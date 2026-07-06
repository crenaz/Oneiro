import json
import datetime
from mcp.server import Server as MCPServer
from mcp.server.stdio import stdio_server
from mcp import types as mcp_types

# In-memory store for the journal.
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
        uri_str = str(uri)
        # dream://entries — return all entries, newest first
        if uri_str == "dream://entries":
            return json.dumps(list(reversed(_journal)), indent=2)

        # dream://symbols/all — flatten and count every symbol
        if uri_str == "dream://symbols/all":
            freq: dict[str, int] = {}
            for entry in _journal:
                for sym in entry.get("symbols", []):
                    freq[sym] = freq.get(sym, 0) + 1
            ranked = sorted(freq.items(), key=lambda x: x[1], reverse=True)
            return json.dumps([{"symbol": s, "count": c} for s, c in ranked])

        # dream://patterns/recent — symbols from the last 30 days, min count 2
        if uri_str == "dream://patterns/recent":
            cutoff = datetime.datetime.utcnow() - datetime.timedelta(days=30)
            freq: dict[str, int] = {}
            for entry in _journal:
                ts = datetime.datetime.fromisoformat(entry["timestamp"])
                if ts >= cutoff:
                    for sym in entry.get("symbols", []):
                        freq[sym] = freq.get(sym, 0) + 1
            recurring = {s: c for s, c in freq.items() if c >= 2}
            return json.dumps(recurring)

        raise ValueError(f"Unknown resource URI: {uri_str}")

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


async def run_mcp_server():
    """Start the MCP server over stdio (for local ADK connection)."""
    server = build_mcp_server()
    async with stdio_server() as (read_stream, write_stream):
        await server.run(read_stream, write_stream, server.create_initialization_options())


if __name__ == "__main__":
    import asyncio
    asyncio.run(run_mcp_server())