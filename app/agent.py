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

mlit_mcp_toolset = McpToolset(
    connection_params=StdioConnectionParams(
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
    ),
    tool_filter=["search"],
)

root_agent = Agent(
    name="mlit_dpf_agent",
    model=Gemini(
        model=MODEL,
        retry_options=types.HttpRetryOptions(attempts=3),
    ),
    instruction=(
        "You are an AI assistant designed to search and retrieve data from the "
        "MLIT (Ministry of Land, Infrastructure, Transport and Tourism) Data Platform.\n\n"
        "When a user asks for geospatial, infrastructure, transportation, or disaster prevention data, "
        "use the `search` tool to query the platform.\n"
        "Present the search results clearly in markdown, highlighting relevant fields such as dataset title, "
        "data ID, description, and source."
    ),
    tools=[mlit_mcp_toolset],
)

app = App(
    root_agent=root_agent,
    name="app",
)
