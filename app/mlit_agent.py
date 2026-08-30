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
        "Your role is to search and retrieve official Japanese datasets using the optimal MLIT DPF MCP tools based on query intent.\n\n"
        "Tool Selection Guidelines:\n"
        "[Search Methods]\n"
        "1. `search_by_location_point_distance`: Search data within a circle (radius in meters) around origin lat/lon. Best for '周辺/近く/付近' proximity queries.\n"
        "2. `search_by_location_rectangle`: Search data intersecting a bounding box rectangle (top-left / bottom-right coordinates).\n"
        "3. `search_by_attribute`: Search by specific catalog, dataset, prefecture, or municipality attributes.\n"
        "4. `search`: Full-text keyword search across dataset records with sort and pagination options.\n\n"
        "[Data & Catalog Retrieval Methods]\n"
        "5. `get_data`: Fetch 100% full attribute details for a specific data_id and dataset_id.\n"
        "6. `get_data_summary`: Lightweight retrieval of basic fields (id, title, coordinates).\n"
        "7. `get_data_catalog`: Fetch full schema and definitions of a data catalog or dataset.\n"
        "8. `get_data_catalog_summary`: Fetch basic metadata list of data catalogs/datasets.\n\n"
        "Output Guidelines:\n"
        "- Display all returned facilities and attributes without omitting records.\n"
        "- Do NOT retry in loops. If no records are found, state clearly that no official records were found.\n"
        "- Always respond in the user's language."
    ),
    tools=[mlit_mcp_toolset],
)
