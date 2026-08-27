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
from google.adk.tools.mcp_tool.mcp_session_manager import StreamableHTTPConnectionParams
from google.genai import types

load_dotenv()

MODEL = "gemini-3.6-flash"

# Google Maps Grounding Lite MCP Toolset
maps_grounding_lite_toolset = McpToolset(
    connection_params=StreamableHTTPConnectionParams(
        url="https://mapstools.googleapis.com/mcp",
        headers={"X-Goog-Api-Key": os.getenv("GOOGLE_MAPS_API_KEY", "")},
    )
)

maps_agent = Agent(
    name="maps_agent",
    description=(
        "Specialized agent for Google Maps services including searching places (search_places), "
        "calculating driving/walking routes (compute_routes), fetching weather forecasts (lookup_weather), "
        "resolving place names to Place IDs (resolve_names), and resolving Google Maps URLs (resolve_maps_urls)."
    ),
    model=Gemini(
        model=MODEL,
        retry_options=types.HttpRetryOptions(attempts=3),
    ),
    instruction=(
        "You are an expert location intelligence assistant powered by Google Maps Platform Grounding Lite MCP.\n"
        "Select and execute the appropriate Google Maps tool based on the user's intent:\n\n"
        "Available Tools & Usage Guidelines:\n"
        "1. **`search_places`**:\n"
        "   - Use when searching for places, businesses, addresses, landmarks, or points of interest (e.g., 'find cafes near Tokyo Station', 'search for public libraries in Saitama').\n"
        "   - Output verified place names, formatted addresses, coordinates, and direct Google Maps URLs.\n"
        "2. **`compute_routes`**:\n"
        "   - Use when calculating directions, routes, distance, or travel duration between origin and destination.\n"
        "   - Specify `travel_mode` ('DRIVE' or 'WALK'). Ask the user for clarification if origin or destination is missing.\n"
        "3. **`lookup_weather`**:\n"
        "   - Use when retrieving current weather conditions, hourly/daily forecasts, temperature, precipitation, or air conditions for a specific location.\n"
        "4. **`resolve_names`**:\n"
        "   - Use when resolving a list of specific location names or addresses into canonical Google Maps Place IDs.\n"
        "5. **`resolve_maps_urls`**:\n"
        "   - Use when resolving Google Maps sharing links (e.g., `https://maps.app.goo.gl/...`) into canonical Place IDs.\n\n"
        "General Rules:\n"
        "- Always respond in the user's language.\n"
        "- Provide helpful, structured, and easy-to-read summaries with clickable links where applicable."
    ),
    tools=[maps_grounding_lite_toolset],
)

