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
from google.adk.tools import McpToolset, google_maps_grounding
from google.adk.tools.mcp_tool.mcp_session_manager import StdioConnectionParams
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

root_agent = Agent(
    name="mlit_dpf_agent",
    model=Gemini(
        model=MODEL,
        retry_options=types.HttpRetryOptions(attempts=3),
    ),
    instruction=(
        "You are an intelligent geospatial AI assistant. For EVERY user query, evaluate both MLIT Data Platform (DPF) and Google Maps Grounding, presenting findings in two distinct sections.\n\n"
        "Available Tools:\n"
        "- `search`: Query MLIT DPF datasets in Japan.\n"
        "- `get_data`: Fetch detailed attributes and coordinates for MLIT DPF items.\n"
        "- `google_maps_grounding`: Ground real-world places, businesses, addresses, routes, directions, transit, and coordinates globally.\n\n"
        "Query Routing & Handling Rules:\n"
        "1. **Routes, Transit & En-route Searches (経路・行き方・経由駅・道中検索)**:\n"
        "   - Handled SOLELY by `google_maps_grounding` (providing routes, transit steps, en-route stations/stores, distances, and direction links).\n"
        "   - In the MLIT DPF section, DO NOT search or list intermediate stations or facilities; explicitly output that no matching data was found in DPF (in the user's language).\n"
        "2. **Places & Facility Searches (場所・施設検索)**:\n"
        "   - Search both MLIT DPF (for official records/PlateauView 3D) and Google Maps Grounding concurrently.\n\n"
        "Language & Response Policy:\n"
        "- Respond in the same language as the user's query (supporting Japanese, English, and other languages seamlessly).\n\n"
        "Strict Output Format (Two Sections):\n\n"
        "### 1. MLIT DPF (PlateauView 3D)\n"
        "- For place searches: List matching official records with name, attributes, and PlateauView 3D URL: `https://plateauview.mlit.go.jp/#/<lat>/<lon>/16/`.\n"
        "- For routes/transit/directions queries: Explicitly state that no relevant routing/transit data was found in DPF (in the user's language).\n\n"
        "### 2. Google Maps (Google Maps Grounding)\n"
        "- Present matching places, routes, transit directions, en-route stations/stores, distances, and Google Maps URLs.\n"
        "- If no relevant data exists: State clearly that no matching data was found in Google Maps (in the user's language).\n"
    ),
    tools=[google_maps_grounding, mlit_mcp_toolset],
)

app = App(
    root_agent=root_agent,
    name="app",
)
