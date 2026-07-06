# orchestrator/agent.py
import json
import time
import os
import sys
import asyncio
from typing import Any

from google.adk.agents.llm_agent import Agent
from google.adk.workflow import Workflow, START, node
from google.adk.agents.context import Context
from google.adk.events.event import Event
from google.adk.tools.mcp_tool import McpToolset
from google.adk.tools.mcp_tool.mcp_session_manager import StdioConnectionParams
from mcp import StdioServerParameters
from google.genai import types as genai_types

# Resolve the path to the local dream server
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
SERVER_PATH = os.path.abspath(os.path.join(CURRENT_DIR, "../dream_journal_mcp/dream_server.py"))

# Setup the MCP toolset dynamically pointing to the local MCP server using sys.executable
dream_mcp = McpToolset(
    connection_params=StdioConnectionParams(
        server_params=StdioServerParameters(
            command=sys.executable,
            args=[SERVER_PATH],
        )
    ),
    tool_filter=["save_entry", "get_symbol_history", "get_art_seed", "list_recurring"]
)


def get_content_text(content: Any) -> str:
    """Helper to safely extract string content from Event output or Content structures."""
    if not content:
        return ""
    if isinstance(content, str):
        return content
    if hasattr(content, "parts"):
        parts = []
        for part in content.parts:
            if hasattr(part, "text") and part.text:
                parts.append(part.text)
        return "".join(parts)
    return str(content)


# 1. Intake Node: extract raw dream text and session ID
@node
def intake_node(ctx: Context, node_input: Any) -> Event:
    dream_text = get_content_text(node_input)
    return Event(
        output=dream_text,
        state={
            "raw_text": dream_text,
            "session_id": ctx.session.id
        }
    )


# 2. Context Loader Node: fetch historical symbols and patterns from MCP
@node
async def load_context_node(ctx: Context, node_input: str) -> Event:
    try:
        symbols_contents = await dream_mcp.read_resource("Symbol frequency table")
        symbols_text = symbols_contents[0].text if symbols_contents else "[]"
    except Exception as e:
        print(f"Error reading symbols resource: {e}")
        symbols_text = "[]"

    try:
        patterns_contents = await dream_mcp.read_resource("Recent recurring patterns")
        patterns_text = patterns_contents[0].text if patterns_contents else "{}"
    except Exception as e:
        print(f"Error reading patterns resource: {e}")
        patterns_text = "{}"

    return Event(
        output=node_input,
        state={
            "history_symbols": symbols_text,
            "history_patterns": patterns_text
        }
    )


# 3. Formatter Node: prepare input for symbol_extractor
@node
def prepare_symbol_extractor_input(ctx: Context, node_input: str) -> str:
    history_symbols = ctx.state.get("history_symbols", "[]")
    return f"Dream Narrative:\n{node_input}\n\nHistorical Symbol List (MCP):\n{history_symbols}"


# 4. Processor Node: capture symbol_extractor output & delay 2 seconds (rate limits)
@node
async def process_symbol_extractor_output(ctx: Context, node_input: dict) -> Event:
    # Stagger calls to respect API rate limits
    await asyncio.sleep(2)
    # node_input is a parsed dict because symbol_extractor has an output_schema
    return Event(output=node_input, state={"symbols_output": node_input})


# 5. Formatter Node: prepare input for pattern_analyst
@node
def prepare_pattern_analyst_input(ctx: Context, node_input: dict) -> str:
    history_symbols = ctx.state.get("history_symbols", "[]")
    # node_input is the symbols_output dict from the symbol extractor
    return f"Today's Dream Symbols (JSON):\n{json.dumps(node_input)}\n\nHistorical Symbols Frequency Table (MCP):\n{history_symbols}"


# 6. Processor & MCP Persistence Node: save dream to MCP and prepare art seed
@node
async def save_dream_and_prepare_art(ctx: Context, node_input: dict) -> Event:
    # node_input is a parsed dict from pattern_analyst
    
    # Stagger calls to respect API rate limits
    await asyncio.sleep(2)

    symbols_data = ctx.state.get("symbols_output", {})
    raw_text = ctx.state.get("raw_text", "")
    session_id = ctx.state.get("session_id", "")
    
    # Extract details for the save_entry MCP tool call
    symbols = [s.get("name") if isinstance(s, dict) else str(s) for s in symbols_data.get("symbols", [])]
    emotions = symbols_data.get("emotions", [])
    setting = symbols_data.get("setting", "unknown")

    # Call save_entry tool on MCP
    try:
        await dream_mcp._execute_with_session(
            lambda session: session.call_tool(
                name="save_entry",
                arguments={
                    "raw_text": raw_text,
                    "symbols": symbols,
                    "emotions": emotions,
                    "setting": setting,
                    "session_id": session_id
                }
            ),
            "Failed to save dream entry"
        )
    except Exception as e:
        print(f"Error calling save_entry tool: {e}")

    # Retrieve the structured art seed graph
    try:
        seed_response = await dream_mcp._execute_with_session(
            lambda session: session.call_tool(
                name="get_art_seed",
                arguments={"session_id": session_id}
            ),
            "Failed to get art seed"
        )
        seed_text = "{}"
        if seed_response and hasattr(seed_response, "content"):
            for content_item in seed_response.content:
                if hasattr(content_item, "text") and content_item.text:
                    seed_text = content_item.text
                    break
    except Exception as e:
        print(f"Error calling get_art_seed tool: {e}")
        seed_text = "{}"

    return Event(
        output=seed_text,
        state={
            "patterns_output": node_input,
            "art_seed": seed_text
        }
    )


# 7. Assembly Node: compile everything into the final report structure
@node
def assembly_node(ctx: Context, node_input: Any) -> Event:
    art_text = get_content_text(node_input)
    symbols_data = ctx.state.get("symbols_output", {})
    patterns_data = ctx.state.get("patterns_output", {})

    # Composition matching the required final structure
    report = f"""# Oneiromantia Dream Analysis Report

## ANALYSIS
```json
{json.dumps(symbols_data, indent=2)}
```

## PATTERNS
```json
{json.dumps(patterns_data, indent=2)}
```

## ART_SKETCH
```javascript
{art_text}
```
"""
    # Yield content event for Web UI rendering
    yield Event(content=genai_types.Content(role="model", parts=[genai_types.Part(text=report)]))
    yield Event(output=report)


def make_orchestrator(
    symbol_extractor: Agent,
    pattern_analyst: Agent,
    art_generator: Agent,
) -> Workflow:
    """
    Orchestrator: Compiled Workflow managing intake, context loading, staggered agent
    execution, MCP persistence, and report assembly.
    """
    # Connect the graph edges
    orchestrator = Workflow(
        name="oneiro_orchestrator",
        edges=[
            (START, intake_node),
            (intake_node, load_context_node),
            (load_context_node, prepare_symbol_extractor_input),
            (prepare_symbol_extractor_input, symbol_extractor),
            (symbol_extractor, process_symbol_extractor_output),
            (process_symbol_extractor_output, prepare_pattern_analyst_input),
            (prepare_pattern_analyst_input, pattern_analyst),
            (pattern_analyst, save_dream_and_prepare_art),
            (save_dream_and_prepare_art, art_generator),
            (art_generator, assembly_node)
        ]
    )

    return orchestrator


# --- ADK LOADER BINDING ---
# Import the sub-agents natively so the AgentLoader can discover them and construct the visual graph
from symbol_extractor.agent import agent as symbol_agent
from pattern_analyst.agent import agent as pattern_agent
from art_generator.agent import agent as art_agent

# Instantiate the global agent object that the playground uses to build the graph
agent = make_orchestrator(
    symbol_extractor=symbol_agent,
    pattern_analyst=pattern_agent,
    art_generator=art_agent
)

root_agent = agent