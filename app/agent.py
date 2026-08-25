# ruff: noqa
# Copyright 2026 Google LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     https://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

import os
from pathlib import Path
import sys

from dotenv import load_dotenv
from google.adk.agents import Agent
from google.adk.apps import App
from google.adk.models import Gemini
from google.adk.tools import McpToolset
from google.adk.tools.mcp_tool.mcp_session_manager import (
    SseConnectionParams,
    StdioConnectionParams,
    StreamableHTTPConnectionParams,
)
from google.genai import types
from mcp import StdioServerParameters

load_dotenv()

MODEL = "gemini-3.6-flash"

# Path to the mlit-dpf-mcp repository
MLIT_MCP_DIR = Path(
    os.getenv(
        "MLIT_MCP_DIR",
        str(Path(__file__).resolve().parents[2] / "mlit-dpf-mcp"),
    )
)
mcp_python = MLIT_MCP_DIR / ".venv" / "bin" / "python"
mcp_server = MLIT_MCP_DIR / "src" / "server.py"

python_executable = (
    str(mcp_python) if mcp_python.exists() else sys.executable
)

# Common connection configuration for mlit-dpf-mcp
def create_mcp_connection_params() -> StdioConnectionParams:
    return StdioConnectionParams(
        server_params=StdioServerParameters(
            command=python_executable,
            args=[str(mcp_server)],
            env={
                **os.environ,
                "MLIT_API_KEY": os.getenv("MLIT_API_KEY", ""),
                "MLIT_BASE_URL": os.getenv(
                    "MLIT_BASE_URL", "https://data-platform.mlit.go.jp/api/v1/"
                ),
            },
        )
    )


# MLIT DPF MCP Toolset providing search and data retrieval tools
mlit_mcp_toolset = McpToolset(
    connection_params=create_mcp_connection_params(),
    tool_filter=["search", "get_data"],
)

# Google Maps Grounding Lite MCP Toolset
maps_grounding_lite_toolset = McpToolset(
    connection_params=StreamableHTTPConnectionParams(
        url="https://mapstools.googleapis.com/mcp",
        headers={"X-Goog-Api-Key": os.getenv("GOOGLE_MAPS_API_KEY", "")},
    )
)

root_agent = Agent(
    name="mlit_dpf_agent",
    model=Gemini(
        model=MODEL,
        retry_options=types.HttpRetryOptions(attempts=3),
    ),
    instruction=(
        "You are an intelligent geospatial AI assistant answering user queries in the user's language.\n\n"
        "Output Guidelines:\n"
        "- **Places & Datasets**: Present findings in two distinct sections:\n"
        "  ### 1. MLIT DPF (PlateauView 3D)\n"
        "  - Official Japanese records with name, category, coordinates, and PlateauView 3D URL: `https://plateauview.mlit.go.jp/#/<lat>/<lon>/16/`.\n"
        "  ### 2. Google Maps (Grounding Lite)\n"
        "  - Real-world places, verified addresses, and direct Google Maps URLs.\n"
        "- **Routes, Transit & Weather**:\n"
        "  - Provide route/distance details (`compute_routes`), directions links, or weather (`lookup_weather`) directly from Google Maps. Omit the MLIT DPF section entirely."
    ),
    tools=[mlit_mcp_toolset, maps_grounding_lite_toolset],
)

app = App(
    root_agent=root_agent,
    name="app",
)



