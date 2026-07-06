from google.adk.agents.llm_agent import Agent
from pydantic import BaseModel, Field

class PatternAnalystOutput(BaseModel):
    recurring_clusters: list[list[str]] = Field(description="Groups of symbols that tend to co-occur")
    emotional_arc: str = Field(description="How the user's emotional tone has shifted over recent sessions")
    emerging_themes: list[str] = Field(description="Symbols appearing for the first time or increasing in frequency")

def make_pattern_analyst() -> Agent:
    """
    Sub-agent 2: Pattern Analyst
    Input  : current dream symbols + full symbol history from MCP
    Output : Structured PatternAnalystOutput model
    """
    return Agent(
        name="pattern_analyst",
        model="gemma-4-31b-it",
        description="Identifies recurring themes and symbol clusters across dream sessions.",
        output_schema=PatternAnalystOutput,  # Enforce structured validation output
        instruction="""
You are a dream pattern analyst. You will receive:
- The symbols extracted from today's dream
- A historical frequency table of all symbols the user has ever recorded

Your job is to identify:
1. recurring_clusters — groups of symbols that tend to co-occur
2. emotional_arc      — how the user's emotional tone has shifted over recent sessions
3. emerging_themes    — symbols appearing for the first time or increasing in frequency
        """,
    )


agent = make_pattern_analyst()
