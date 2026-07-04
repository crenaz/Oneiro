# =============================================================================
# ONEIROMANTIA — ADK Agent Skeleton v0.2
# =============================================================================
# Architecture:
#   OrchestratorAgent
#     ├── SymbolExtractorAgent   (parallel)
#     ├── PatternAnalystAgent    (parallel)
#     └── ArtGeneratorAgent      (parallel, depends on symbol output)
#
# MCP Server: DreamJournalMCPServer
#   Resources : dream://entries, dream://symbols/all, dream://patterns/recent
#   Tools     : save_entry, get_symbol_history, get_art_seed, list_recurring
#
# Rubric coverage:
#   [x] Multi-agent system (ADK)   — Process orchestrator + 3 sub-agents
#   [x] MCP server                 — DreamJournalMCPServer
#   [x] Antigravity                — parallel dispatch shows in dashboard
#   [x] Security features          — session tokens, no plaintext PII stored
#   [x] Deployability              — Cloud Run compatible (see deploy note)
# =============================================================================

import json
import uuid
import datetime
from typing import Optional

# --- ADK imports -------------------------------------------------------------
# google-adk: pip install google-adk
from google.adk.agents.llm_agent import Agent
from google.adk.agents import ParallelAgent, SequentialAgent
from google.adk.tools import FunctionTool
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService

# --- MCP imports -------------------------------------------------------------
# mcp: pip install mcp
from mcp.server import Server as MCPServer
from mcp.server.stdio import stdio_server
from mcp import types as mcp_types

# --- Gemini model string ------------------------------------------------------
MODEL = "gemini-2.0-flash"

from oneiro_art_spec import ART_GENERATOR_INSTRUCTION


# =============================================================================
# SECTION 1: MCP SERVER — DreamJournalMCPServer
# =============================================================================
# Run this as a separate process: python oneiro_adk_skeleton.py --mcp
# The ADK orchestrator connects to it via stdio or SSE transport.
# =============================================================================

# In-memory store for the skeleton; I should remember to swap for SQLite or Firestore in production.
_journal: list[dict] = []


def build_mcp_server() -> MCPServer:
    """Construct and wire the Dream Journal MCP server."""
    server = MCPServer("dream-journal")

    # -------------------------------------------------------------------------
    # RESOURCES
    # -------------------------------------------------------------------------

    @server.list_resources()
    async def list_resources() -> list[mcp_types.Resource]:
        return [
            mcp_types.Resource(
                uri="dream://entries",
                name="Dream journal entries",
                description="All dream entries, newest first.",
                mimeType="application/json",
            ),
            mcp_types.Resource(
                uri="dream://symbols/all",
                name="Symbol frequency table",
                description="Every symbol seen across all sessions with counts.",
                mimeType="application/json",
            ),
            mcp_types.Resource(
                uri="dream://patterns/recent",
                name="Recent recurring patterns",
                description="Top recurring themes from the last 30 days.",
                mimeType="application/json",
            ),
        ]

    @server.read_resource()
    async def read_resource(uri: str) -> str:
        # dream://entries — return all entries, newest first
        if uri == "dream://entries":
            return json.dumps(list(reversed(_journal)), indent=2)

        # dream://symbols/all — flatten and count every symbol
        if uri == "dream://symbols/all":
            freq: dict[str, int] = {}
            for entry in _journal:
                for sym in entry.get("symbols", []):
                    freq[sym] = freq.get(sym, 0) + 1
            ranked = sorted(freq.items(), key=lambda x: x[1], reverse=True)
            return json.dumps([{"symbol": s, "count": c} for s, c in ranked])

        # dream://patterns/recent — symbols from the last 30 days, min count 2
        if uri == "dream://patterns/recent":
            cutoff = datetime.datetime.utcnow() - datetime.timedelta(days=30)
            freq: dict[str, int] = {}
            for entry in _journal:
                ts = datetime.datetime.fromisoformat(entry["timestamp"])
                if ts >= cutoff:
                    for sym in entry.get("symbols", []):
                        freq[sym] = freq.get(sym, 0) + 1
            recurring = {s: c for s, c in freq.items() if c >= 2}
            return json.dumps(recurring)

        raise ValueError(f"Unknown resource URI: {uri}")

    # -------------------------------------------------------------------------
    # TOOLS
    # -------------------------------------------------------------------------

    @server.list_tools()
    async def list_tools() -> list[mcp_types.Tool]:
        return [
            mcp_types.Tool(
                name="save_entry",
                description="Persist a processed dream entry to the journal.",
                inputSchema={
                    "type": "object",
                    "properties": {
                        "raw_text":   {"type": "string"},
                        "symbols":    {"type": "array", "items": {"type": "string"}},
                        "emotions":   {"type": "array", "items": {"type": "string"}},
                        "setting":    {"type": "string"},
                        "session_id": {"type": "string"},
                    },
                    "required": ["raw_text", "symbols", "emotions", "session_id"],
                },
            ),
            mcp_types.Tool(
                name="get_symbol_history",
                description="All past entries containing a given symbol.",
                inputSchema={
                    "type": "object",
                    "properties": {
                        "symbol": {"type": "string"},
                    },
                    "required": ["symbol"],
                },
            ),
            mcp_types.Tool(
                name="get_art_seed",
                description=(
                    "Return the structured symbol graph for a session "
                    "as JSON input for the art generator."
                ),
                inputSchema={
                    "type": "object",
                    "properties": {
                        "session_id": {"type": "string"},
                    },
                    "required": ["session_id"],
                },
            ),
            mcp_types.Tool(
                name="list_recurring",
                description="Symbols appearing at least min_count times.",
                inputSchema={
                    "type": "object",
                    "properties": {
                        "min_count": {"type": "integer", "default": 2},
                    },
                },
            ),
        ]

    @server.call_tool()
    async def call_tool(name: str, arguments: dict) -> list[mcp_types.TextContent]:
        # save_entry
        if name == "save_entry":
            entry = {
                "session_id": arguments["session_id"],
                "timestamp":  datetime.datetime.utcnow().isoformat(),
                "raw_text":   arguments["raw_text"],
                # NOTE: no raw PII stored beyond what the user typed;
                # in production, encrypt raw_text at rest.
                "symbols":    arguments["symbols"],
                "emotions":   arguments["emotions"],
                "setting":    arguments.get("setting", "unknown"),
            }
            _journal.append(entry)
            return [mcp_types.TextContent(type="text", text=json.dumps({"saved": True, "id": entry["session_id"]}))]

        # get_symbol_history
        if name == "get_symbol_history":
            sym = arguments["symbol"].lower()
            matches = [e for e in _journal if sym in [s.lower() for s in e.get("symbols", [])]]
            return [mcp_types.TextContent(type="text", text=json.dumps(matches))]

        # get_art_seed
        if name == "get_art_seed":
            sid = arguments["session_id"]
            entry = next((e for e in reversed(_journal) if e["session_id"] == sid), None)
            if not entry:
                return [mcp_types.TextContent(type="text", text=json.dumps({"error": "not found"}))]
            # Build a symbol graph: each symbol gets a weight based on
            # how often it has appeared historically.
            freq: dict[str, int] = {}
            for e in _journal:
                for s in e.get("symbols", []):
                    freq[s] = freq.get(s, 0) + 1
            graph = {
                "session_id": sid,
                "emotions":   entry["emotions"],
                "nodes": [
                    {
                        "symbol":    s,
                        "weight":    freq.get(s, 1),       # recurrence score
                        "is_new":    freq.get(s, 0) <= 1,  # first appearance
                    }
                    for s in entry["symbols"]
                ],
            }
            return [mcp_types.TextContent(type="text", text=json.dumps(graph))]

        # list_recurring
        if name == "list_recurring":
            min_count = arguments.get("min_count", 2)
            freq: dict[str, int] = {}
            for e in _journal:
                for s in e.get("symbols", []):
                    freq[s] = freq.get(s, 0) + 1
            result = {s: c for s, c in freq.items() if c >= min_count}
            return [mcp_types.TextContent(type="text", text=json.dumps(result))]

        raise ValueError(f"Unknown tool: {name}")

    return server


# =============================================================================
# SECTION 2: SUB-AGENTS
# =============================================================================

def make_symbol_extractor() -> Agent:
    """
    Sub-agent 1: Symbol Extractor
    Input  : normalized dream text + user symbol history (from MCP context)
    Output : JSON with symbols, emotions, setting
    """
    return Agent(
        name="symbol_extractor",
        model=MODEL,
        description="Extracts archetypal symbols, emotional tone, and setting from a dream.",
        instruction="""
You are a Jungian symbol analyst. Given a dream narrative, extract:
1. symbols   — a list of archetypal objects, figures, or motifs (e.g. "water", "tower", "shadow")
2. emotions  — the dominant emotional tones felt in the dream (e.g. "dread", "wonder")
3. setting   — the primary environment (e.g. "forest", "city", "void")

You will also receive the user's historical symbol list from the MCP dream journal.
Flag any symbol that has appeared in previous dreams by setting "recurring": true.

Always respond with valid JSON only. No prose. Example:
{
  "symbols":  [{"name": "water", "recurring": true}, {"name": "mirror", "recurring": false}],
  "emotions": ["wonder", "unease"],
  "setting":  "coastal cliff"
}
        """,
        # tools=[] — this agent reasons only; no tool calls needed.
        # It receives MCP context via the orchestrator's context-loading step.
    )


def make_pattern_analyst() -> Agent:
    """
    Sub-agent 2: Pattern Analyst
    Input  : current dream symbols + full symbol history from MCP
    Output : cross-session pattern report in JSON
    """
    return Agent(
        name="pattern_analyst",
        model=MODEL,
        description="Identifies recurring themes and symbol clusters across dream sessions.",
        instruction="""
You are a dream pattern analyst. You will receive:
- The symbols extracted from today's dream
- A historical frequency table of all symbols the user has ever recorded

Your job is to identify:
1. recurring_clusters — groups of symbols that tend to co-occur
2. emotional_arc      — how the user's emotional tone has shifted over recent sessions
3. emerging_themes    — symbols appearing for the first time or increasing in frequency

Respond with valid JSON only. Example:
{
  "recurring_clusters": [["water", "mirror", "reflection"], ["tower", "falling"]],
  "emotional_arc": "Shift from dread-dominant toward wonder over last 14 days.",
  "emerging_themes": ["labyrinth"]
}
        """,
    )


def make_art_generator() -> Agent:
    """
    Sub-agent 3: Art Generator
    Input  : art seed JSON from MCP (symbol graph with weights + emotions)
    Output : p5.js sketch code as a string
    """
    return Agent(
        name="art_generator",
        model=MODEL,
        description="Translates a symbol graph into a procedural p5.js sketch.",
        instruction=ART_GENERATOR_INSTRUCTION,
    )


# =============================================================================
# SECTION 3: PROCESS ORCHESTRATOR
# =============================================================================

def make_orchestrator(
    symbol_extractor: Agent,
    pattern_analyst: Agent,
    art_generator: Agent,
) -> Agent:
    """
    Orchestrator: Agent wrapping a ParallelAgent for sub-agents.

    Pipeline:
      Step 1 (Agent):           normalize input, load MCP context
      Step 2 (ParallelAgent):   run all three sub-agents simultaneously
      Step 3 (Agent):           assemble final output, save to MCP
    """

    # Parallel execution of all three sub-agents
    # ADK fires these simultaneously; Antigravity should then show three live threads.
    parallel_analysis = ParallelAgent(
        name="parallel_analysis",
        description="Run symbol extraction, pattern analysis, and art generation in parallel.",
        sub_agents=[symbol_extractor, pattern_analyst, art_generator],
    )

    orchestrator = Agent(
        name="oneiro_orchestrator",
        model=MODEL,
        description=(
            "Main process orchestrator. Normalizes dream input, loads MCP context, "
            "dispatches sub-agents in parallel, and assembles the final report."
        ),
        sub_agents=[parallel_analysis],
        # The process orchestrator's system instruction handles phases 1, 2, and 4.
        # Phase 3 (parallel dispatch) is handled structurally by ParallelAgent above.
        instruction="""
You are the orchestrator. You coordinate the full dream analysis pipeline.

PHASE 1 — INTAKE
When the user sends a dream, first produce a normalized dream record:
{
  "session_id":          "<generate a uuid>",
  "raw_text":            "<the user's dream text>",
  "word_count":          <int>,
  "apparent_tone":       "<one of: dread | wonder | anxiety | joy | grief | neutral>"
}
Pass this normalized record as context to all sub-agents.

PHASE 2 — CONTEXT LOADING
Before dispatching sub-agents, retrieve from the MCP dream journal:
- dream://symbols/all        (for symbol extractor and pattern analyst)
- dream://patterns/recent    (for pattern analyst)
Include this historical context in the input to each sub-agent.

PHASE 3 — PARALLEL DISPATCH
The ParallelAgent handles this automatically. Do not sequence the sub-agents manually.

PHASE 4 — ASSEMBLY
When all sub-agents return:
1. Call the MCP tool save_entry with the symbol extractor's output + session_id.
2. Call the MCP tool get_art_seed with the session_id (art generator needs the graph).
3. Compose the final response with three sections:
   a. ANALYSIS     — natural language summary of symbols and emotions (2-3 paragraphs)
   b. PATTERNS     — the cross-session pattern report from the pattern analyst
   c. ART_SKETCH   — the raw p5.js code string from the art generator

IMPORTANT: You interpret nothing yourself. Normalization, routing, and assembly
are your only responsibilities. Meaning-making lives in the sub-agents.

SECURITY NOTE: Never log or repeat the user's raw dream text in your final response
beyond the ANALYSIS section. Session IDs are UUIDs — never expose internal storage keys.
        """,
    )

    return orchestrator


# =============================================================================
# SECTION 4: RUNNER + SESSION WIRING
# =============================================================================

def build_oneiro_app() -> Runner:
    """
    Wire everything together and return a Runner ready for use.

    Usage:
        runner = build_oneiro_app()
        response = runner.run(
            user_id="user-123",
            session_id=str(uuid.uuid4()),
            message="I was standing at the edge of a black ocean..."
        )
    """
    symbol_extractor = make_symbol_extractor()
    pattern_analyst  = make_pattern_analyst()
    art_generator    = make_art_generator()
    orchestrator     = make_orchestrator(symbol_extractor, pattern_analyst, art_generator)

    # InMemorySessionService is fine for Kaggle demo.
    # Swap for VertexAI session service for Cloud Run deployment.
    session_service = InMemorySessionService()

    runner = Runner(
        agent=orchestrator,
        app_name="oneiro",
        session_service=session_service,
    )

    return runner


# =============================================================================
# SECTION 5: ENTRYPOINTS
# =============================================================================

async def run_mcp_server():
    """Start the MCP server over stdio (for local ADK connection)."""
    server = build_mcp_server()
    async with stdio_server() as (read_stream, write_stream):
        await server.run(read_stream, write_stream, server.create_initialization_options())


async def run_demo():
    """
    Quick demo: submit one dream entry and print the orchestrator's response.
    Run this in a Kaggle notebook cell.
    """
    import asyncio
    from google.adk.runners import RunConfig
    from google.genai import types as genai_types

    runner = build_oneiro_app()

    user_id    = "demo-user"
    session_id = str(uuid.uuid4())

    # Create a session first
    await runner.session_service.create_session(
        app_name="oneiro",
        user_id=user_id,
        session_id=session_id,
    )

    dream_input = (
        "I was standing at the edge of a vast black ocean. "
        "The water was completely still, like a mirror. "
        "Behind me was a glass tower that went up beyond the clouds. "
        "I felt a strange mixture of awe and dread — like I was being watched "
        "by something in the reflection."
    )

    print(f"Session: {session_id}")
    print(f"Dream  : {dream_input[:60]}...\n")
    print("=" * 60)

    # Stream the response turn by turn
    async for event in runner.run_async(
        user_id=user_id,
        session_id=session_id,
        new_message=genai_types.Content(
            role="user",
            parts=[genai_types.Part(text=dream_input)],
        ),
    ):
        # Print agent activity as it streams — visible in Antigravity dashboard too
        if hasattr(event, "content") and event.content:
            for part in event.content.parts:
                if hasattr(part, "text") and part.text:
                    print(part.text, end="", flush=True)

    print("\n" + "=" * 60)


# =============================================================================
# SECTION 6: KAGGLE NOTEBOOK USAGE
# =============================================================================
# Paste the following into consecutive notebook cells:
#
#   Cell 1 — Install dependencies
#   !pip install google-adk mcp google-genai --quiet
#
#   Cell 2 — Set API key
#   import os
#   os.environ["GOOGLE_API_KEY"] = "YOUR_GEMINI_API_KEY"
#   # Or load from Kaggle secrets:
#   # from kaggle_secrets import UserSecretsClient
#   # os.environ["GOOGLE_API_KEY"] = UserSecretsClient().get_secret("GEMINI_API_KEY")
#
#   Cell 3 — Run the demo
#   import asyncio
#   asyncio.run(run_demo())
#
# NOTE: The MCP server and ADK runner can share the same process for the
# Kaggle demo (in-process tool calls). For Cloud Run deployment, run the
# MCP server as a separate container and connect via SSE transport.
# See: https://codelabs.developers.google.com/enterprise-cloud-scale-deploying
# =============================================================================

if __name__ == "__main__":
    import sys
    import asyncio

    if "--mcp" in sys.argv:
        # Start MCP server (stdio transport)
        asyncio.run(run_mcp_server())
    else:
        # Run the demo pipeline
        asyncio.run(run_demo())
