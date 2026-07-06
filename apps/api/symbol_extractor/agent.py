from google.adk.agents.llm_agent import Agent
from pydantic import BaseModel, Field

class SymbolItem(BaseModel):
    name: str = Field(description="Name of the symbol, e.g. 'water', 'tower'")
    recurring: bool = Field(description="True if the symbol has appeared in previous dreams, False otherwise")

class SymbolExtractorOutput(BaseModel):
    symbols: list[SymbolItem] = Field(description="List of archetypal symbols extracted from the dream")
    emotions: list[str] = Field(description="Dominant emotional tones felt in the dream")
    setting: str = Field(description="Primary setting or environment")

def make_symbol_extractor() -> Agent:
    """
    Sub-agent 1: Symbol Extractor
    Input  : normalized dream text + user symbol history (from MCP context)
    Output : Structured SymbolExtractorOutput model
    """
    return Agent(
        name="symbol_extractor",
        model='gemma-4-31b-it',
        description="Extracts archetypal symbols, emotional tone, and setting from a dream.",
        output_schema=SymbolExtractorOutput,  # Enforce structured validation output
        instruction="""
You are a Jungian symbol analyst. Given a dream narrative, extract:
1. symbols   — a list of archetypal objects, figures, or motifs (e.g. "water", "tower", "shadow")
2. emotions  — the dominant emotional tones felt in the dream (e.g. "dread", "wonder")
3. setting   — the primary environment (e.g. "forest", "city", "void")

You will also receive the user's historical symbol list from the MCP dream journal.
Flag any symbol that has appeared in previous dreams by setting "recurring": true.
        """,
    )


agent = make_symbol_extractor()
