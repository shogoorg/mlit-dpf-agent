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

from dotenv import load_dotenv
from google.adk.agents import Agent
from google.adk.apps import App
from google.adk.models import Gemini
from google.adk.tools import AgentTool
from google.genai import types

from app.mlit_agent import mlit_agent

load_dotenv()

MODEL = "gemini-3.6-flash"

root_agent = Agent(
    name="mlit_dpf_agent",
    model=Gemini(
        model=MODEL,
        retry_options=types.HttpRetryOptions(attempts=3),
    ),
    instruction=(
        "You are an intelligent geospatial assistant answering user queries in the user's language.\n"
        "For all user queries, call `mlit_agent` to gather geospatial intelligence from Japan's MLIT Data Platform.\n\n"
        "Present your response with:\n"
        "- Official Japanese records, category, coordinates, and PlateauView 3D URL (`https://plateauview.mlit.go.jp/#/<lat>/<lon>/16/`).\n"
        "- If no data is found, clearly state that no official MLIT records were found on the platform."
    ),
    tools=[
        AgentTool(agent=mlit_agent),
    ],
)

app = App(
    root_agent=root_agent,
    name="app",
)
