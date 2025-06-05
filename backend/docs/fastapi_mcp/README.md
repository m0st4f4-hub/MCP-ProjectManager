<p align="center"><a href="https://github.com/tadata-org/fastapi_mcp"><img src="https://github.com/user-attachments/assets/7e44e98b-a0ba-4aff-a68a-4ffee3a6189c" alt="fastapi-to-mcp" height=100/></a></p>
<h1 align="center">FastAPI-MCP</h1>
<p align="center">Expose your FastAPI endpoints as Model Context Protocol (MCP) tools, with Auth!</p>
<div align="center">

[![PyPI version](https://img.shields.io/pypi/v/fastapi-mcp?color=%2334D058&label=pypi%20package)](https://pypi.org/project/fastapi-mcp/)
[![Python Versions](https://img.shields.io/pypi/pyversions/fastapi-mcp.svg)](https://pypi.org/project/fastapi-mcp/)
[![FastAPI](https://img.shields.io/badge/FastAPI-009485.svg?logo=fastapi&logoColor=white)](#)
[![CI](https://github.com/tadata-org/fastapi_mcp/actions/workflows/ci.yml/badge.svg)](https://github.com/tadata-org/fastapi_mcp/actions/workflows/ci.yml)
[![Coverage](https://codecov.io/gh/tadata-org/fastapi_mcp/branch/main/graph/badge.svg)](https://codecov.io/gh/tadata-org/fastapi_mcp)

</div>


<p align="center"><a href="https://github.com/tadata-org/fastapi_mcp"><img src="https://github.com/user-attachments/assets/b205adc6-28c0-4e3c-a68b-9c1a80eb7d0c" alt="fastapi-mcp-usage" height="400"/></a></p>


## Features

- **Authentication** built in, using your existing FastAPI dependencies!

- **FastAPI-native:** Not just another OpenAPI -> MCP converter

- **Zero/Minimal configuration** required - just point it at your FastAPI app and it works

- **Preserving schemas** of your request models and response models

- **Preserve documentation** of all your endpoints, just as it is in Swagger

- **Flexible deployment** - Mount your MCP server to the same app, or deploy separately

- **ASGI transport** - Uses FastAPI's ASGI interface directly for efficient communication


## Installation

We recommend using [uv](https://docs.astral.sh/uv/), a fast Python package installer:

```bash
uv add fastapi-mcp
```

Alternatively, you can install with pip:

```bash
pip install fastapi-mcp
```

## Basic Usage

The simplest way to use FastAPI-MCP is to add an MCP server directly to your FastAPI application:

```python
from fastapi import FastAPI
from fastapi_mcp import FastApiMCP

app = FastAPI()

mcp = FastApiMCP(app)

# Mount the MCP server directly to your FastAPI app
mcp.mount()
```

That's it! Your auto-generated MCP server is now available at `https://app.base.url/mcp`.

## Documentation, Examples and Advanced Usage

FastAPI-MCP provides [comprehensive documentation](https://fastapi-mcp.tadata.com/). Additionaly, check out the [examples directory](examples) for code samples demonstrating these features in action.

## FastAPI-first Approach

FastAPI-MCP is designed as a native extension of FastAPI, not just a converter that generates MCP tools from your API. This approach offers several key advantages:

- **Native dependencies**: Secure your MCP endpoints using familiar FastAPI `Depends()` for authentication and authorization

- **ASGI transport**: Communicates directly with your FastAPI app using its ASGI interface, eliminating the need for HTTP calls from the MCP to your API

- **Unified infrastructure**: Your FastAPI app doesn't need to run separately from the MCP server (though [separate deployment](https://fastapi-mcp.tadata.com/advanced/deploy#deploying-separately-from-original-fastapi-app) is also supported)

This design philosophy ensures minimum friction when adding MCP capabilities to your existing FastAPI services.

## Tool Routes

FastAPI-MCP automatically exposes selected API endpoints as tools under the `/mcp-tools` prefix. The current routes are:

- `/mcp-tools/project/create` (POST)
- `/mcp-tools/task/create` (POST)
- `/mcp-tools/projects/list` (GET)
- `/mcp-tools/tasks/list` (GET)
- `/mcp-tools/memory/add-entity` (POST)
- `/mcp-tools/memory/update-entity` (POST)
- `/mcp-tools/memory/add-observation` (POST)
- `/mcp-tools/memory/add-relation` (POST)
- `/mcp-tools/memory/search` (GET)
- `/mcp-tools/forbidden-action/create` (POST)
- `/mcp-tools/forbidden-action/list` (GET)
- `/mcp-tools/handoff/create` (POST)
- `/mcp-tools/handoff/list` (GET)
- `/mcp-tools/handoff/delete` (DELETE)
- `/mcp-tools/error-protocol/add` (POST)
- `/mcp-tools/error-protocol/list` (GET)
- `/mcp-tools/error-protocol/remove` (DELETE)
- `/mcp-tools/template/create` (POST)
- `/mcp-tools/template/list` (GET)
- `/mcp-tools/template/delete` (POST)

### Forbidden Action Tools

Use these routes to restrict actions for specific agent roles. Create new
forbidden actions with `/mcp-tools/forbidden-action/create` and list all
entries via `/mcp-tools/forbidden-action/list`.

```python
from backend.mcp_tools.forbidden_action_tools import create_forbidden_action_tool

await create_forbidden_action_tool(
    agent_role_id="manager",
    action="deploy_production",
    reason="Only ops may deploy",
    db=session,
)
```

### Agent Handoff Tools

Use these routes to manage when one agent role should hand off control to
another. Create new rules with `/mcp-tools/handoff/create`, list all criteria
via `/mcp-tools/handoff/list`, and remove a rule using `/mcp-tools/handoff/delete`.

## Development and Contributing

Thank you for considering contributing to FastAPI-MCP! We encourage the community to post Issues and create Pull Requests.

Before you get started, please see our [Contribution Guide](CONTRIBUTING.md).

## Community

Join [MCParty Slack community](https://join.slack.com/t/themcparty/shared_invite/zt-30yxr1zdi-2FG~XjBA0xIgYSYuKe7~Xg) to connect with other MCP enthusiasts, ask questions, and share your experiences with FastAPI-MCP.

## Requirements

- Python 3.10+ (Recommended 3.12)
- uv

## License

MIT License. Copyright (c) 2024 Tadata Inc.

<!-- File List Start -->
## File List

- `docs.json`

<!-- File List End -->




