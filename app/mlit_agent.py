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
from dotenv import load_dotenv
from google.adk.agents import Agent
from google.adk.models import Gemini
from google.adk.tools import McpToolset
from google.adk.tools.mcp_tool.mcp_session_manager import SseConnectionParams
from google.genai import types

load_dotenv()

MODEL = "gemini-3.6-flash"

# MLIT DPF MCP Toolset connecting to standalone MCP server via SSE
MLIT_MCP_SERVER_URL = os.getenv("MLIT_MCP_SERVER_URL", "http://localhost:8000/sse")

mlit_mcp_toolset = McpToolset(
    connection_params=SseConnectionParams(
        url=MLIT_MCP_SERVER_URL,
    ),
)

mlit_agent = Agent(
    name="mlit_agent",
    description=(
        "Specialized agent for searching and retrieving Japanese official open datasets from the "
        "MLIT (Ministry of Land, Infrastructure, Transport and Tourism) Data Platform, "
        "including evacuation shelters, urban planning, infrastructure, land records, and PlateauView 3D visualizations."
    ),
    model=Gemini(
        model=MODEL,
        retry_options=types.HttpRetryOptions(attempts=3),
    ),
    instruction=(
        "You are an expert specialist in MLIT (Ministry of Land, Infrastructure, Transport and Tourism) geospatial data.\n"
        "Your role is to search and retrieve official Japanese datasets using the MLIT DPF MCP tools.\n\n"
        "Search Strategy & Tool Usage:\n"
        "1. **Keyword Search (`search`)**:\n"
        "   - Use concise keywords (e.g., '避難所', '指定緊急避難場所', '都市計画', '道路', '橋梁') rather than long natural sentences.\n"
        "   - Use `phrase_match=False` for broader partial matching when needed.\n"
        "2. **Spatial Search (`search_by_location_point_distance` / `search_by_location_rectangle`)**:\n"
        "   - When querying an area or surroundings of a landmark, use `search_by_location_point_distance` with latitude, longitude, and distance (meters) to find nearby official data.\n"
        "3. **Attribute Search (`search_by_attribute`)**:\n"
        "   - Filter by prefecture code, municipality code, or specific dataset IDs.\n"
        "4. **Data Retrieval (`get_data` / `get_data_summary`)**:\n"
        "   - Fetch full or summary records for retrieved data IDs.\n\n"
        "Output Guidelines:\n"
        "- Format output clearly with Dataset/Record Name, Category, Complete Full Address (including chome, block, building number), Coordinates, and PlateauView 3D URL.\n"
        "- PlateauView 3D URL format: [PlateauView 3D](https://plateauview.mlit.go.jp/)（「<完全な所在地>」で検索）.\n"
        "- **No Data Fallback**: If no matching records are found, do NOT hallucinate or invent records. State clearly that no official MLIT records were found on the platform for the queried location.\n"
        "- Always respond in the user's language."
    ),
    tools=[mlit_mcp_toolset],
)
