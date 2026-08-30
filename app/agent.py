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

"""MLIT DPF Agent with A2UI Geospatial Orchestration, 8-API Glossary, and Clean Links."""

from dotenv import load_dotenv
from google.adk.agents import Agent
from google.adk.apps import App
from google.adk.models import Gemini
from google.genai import types

from app.mlit_agent import mlit_mcp_toolset

load_dotenv()

MODEL = "gemini-3.6-flash"

from pathlib import Path

SKILL_PATH = Path(__file__).parent / "skills" / "mlit-dpf" / "SKILL.md"
SYSTEM_INSTRUCTION = SKILL_PATH.read_text(encoding="utf-8") if SKILL_PATH.exists() else (
    "You are an expert specialist in MLIT geospatial data. "
    "Follow the tool selection and A2UI formatting rules defined in the mlit-dpf skill."
)

root_agent = Agent(
    name="mlit_dpf_agent",
    model=Gemini(
        model=MODEL,
        retry_options=types.HttpRetryOptions(attempts=3),
    ),
    instruction=SYSTEM_INSTRUCTION,
    tools=[
        mlit_mcp_toolset,
    ],
)

app = App(
    root_agent=root_agent,
    name="app",
)
