from google.adk.agents.llm_agent import Agent
from oneiromantia_art_spec import ART_GENERATOR_INSTRUCTION

def make_art_generator() -> Agent:
    """
    Sub-agent 3: Art Generator
    Input  : art seed JSON from MCP (symbol graph with weights + emotions)
    Output : p5.js sketch code as a string
    """
    return Agent(
        name="art_generator",
        model="gemma-4-31b-it",
        description="Translates a symbol graph into a procedural p5.js sketch.",
        instruction=ART_GENERATOR_INSTRUCTION,
    )


agent = make_art_generator()
