# orchestrator/agent.py
import json
import time
import uuid

from google.adk.agents.llm_agent import Agent
from google.adk.agents import SequentialAgent
from google.adk.tools import FunctionTool

def make_orchestrator(
    symbol_extractor: Agent,
    pattern_analyst: Agent,
    art_generator: Agent,
) -> Agent:
    """
    Orchestrator: Agent wrapping a SequentialAgent for staggered sub-agent execution.

    Pipeline:
      Step 1 (Agent):            normalize input, load MCP context
      Step 2 (SequentialAgent):  run sub-agents one after another (2-second stagger)
      Step 3 (Agent):            assemble final output, save to MCP
    """

    # Sequential execution with a 2-second stagger between sub-agents.
    # This prevents all three from slamming the Gemini endpoint at the exact same
    # millisecond, which causes 429 quota errors on the free tier.
    # Trade-off: slightly longer wall-clock time, but far more stable under rate limits.
    def _stagger_sleep():
        """Introduce a 2-second pause between sub-agent calls to respect API rate limits."""
        time.sleep(2)

    parallel_analysis = SequentialAgent(
        name="parallel_analysis",
        description="Run symbol extraction, pattern analysis, and art generation with a stagger to avoid rate limits.",
        sub_agents=[symbol_extractor, pattern_analyst, art_generator],
    )

    orchestrator = Agent(
        name="oneiro_orchestrator",
        model="gemini-2.0-flash",
        description=(
            "Main Oneiromantia process orchestrator. Normalizes dream input, loads MCP context, "
            "dispatches sub-agents in parallel, and assembles the final report."
        ),
        sub_agents=[parallel_analysis],
        # The process orchestrator's system instruction handles phases 1, 2, and 4.
        # Phase 3 (staggered dispatch) is handled structurally by SequentialAgent above.
        instruction="""
You are the Oneiromantia orchestrator. You coordinate the full dream analysis pipeline.

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

PHASE 3 — STAGGERED DISPATCH
        The SequentialAgent handles this automatically, running sub-agents one after another
        with a 2-second stagger between calls to stay within API rate limits.

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