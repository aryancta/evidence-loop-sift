"""Entrypoint for running the Python MCP parity server.

The file `mcp-server.py` contains a `app` FastAPI instance. Because its filename
contains a hyphen it cannot be imported as a standard Python module, so when you
want to run it use:

    uvicorn src.server.mcp_server:app --host 0.0.0.0 --port 8787

or copy/rename the file. For the hackathon demo we run the agent loop inside
Next.js, so this server is optional parity only.
"""

if __name__ == "__main__":
    print("Run with: uvicorn src.server.mcp_server:app --host 0.0.0.0 --port 8787")
