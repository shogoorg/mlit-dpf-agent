---
name: mlit-data-plathome
description: >
  This skill covers the setup and tool usage for `mlit-dpf-mcp`, an MCP server
  providing search and detailed data retrieval from the MLIT Data Platform (DPF).
metadata:
  author: MLIT DPF Agent Project
  license: Apache-2.0
  version: 1.0.0
  requires:
    env:
      - MLIT_API_KEY
      - MLIT_BASE_URL
---

# MLIT DPF MCP Skill (`mlit-dpf-mcp`)

This skill explains how to connect to and use the **`mlit-dpf-mcp`** Model Context Protocol (MCP) server for querying data from the Ministry of Land, Infrastructure, Transport and Tourism (MLIT) Data Platform.

## Environment Variables

| Variable | Description | Default |
|---|---|---|
| `MLIT_API_KEY` | API Key for MLIT Data Platform | `""` |
| `MLIT_BASE_URL` | Base API endpoint | `https://data-platform.mlit.go.jp/api/v1/` |
| `MLIT_MCP_SERVER_URL` | URL of the standalone MLIT MCP server | `http://localhost:8000/sse` |

## MCP Connection Setup

Configure `McpToolset` in Google ADK to connect to the standalone `mlit-dpf-mcp` server:

```python
import os
from google.adk.tools import McpToolset
from google.adk.tools.mcp_tool.mcp_session_manager import SseConnectionParams

mlit_mcp_toolset = McpToolset(
    connection_params=SseConnectionParams(
        url=os.getenv("MLIT_MCP_SERVER_URL", "http://localhost:8000/sse"),
    ),
    tool_filter=["search", "get_data"],
)
```

## Available Tools

### 1. `search`
Searches cataloged datasets by free-text keywords.

- **Input**:
  - `query` (`string`): Search terms (e.g., `"新宿区 避難所"`, `"道路交通センサス"`).
- **Output**:
  - List of matching records with `dataset_id`, `data_id`, and title.

### 2. `get_data`
Retrieves full attribute information and geometry for a specific data item.

- **Input**:
  - `dataset_id` (`string`): Dataset ID obtained from `search`.
  - `data_id` (`string`): Record ID obtained from `search`.
- **Output**:
  - Complete record metadata, attributes, and GeoJSON geometry.
