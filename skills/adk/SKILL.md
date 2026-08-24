---
name: adk
description: >
  This skill explains how to use the built-in `google_maps_grounding` tool from Google ADK
  to ground places, addresses, facilities, and map links in agent responses.
metadata:
  author: Google ADK
  license: Apache-2.0
  version: 1.0.0
---

# Google Maps Grounding Skill (Google ADK)

This skill covers the setup and usage of the built-in **`google_maps_grounding`** tool provided by Google ADK (`google.adk.tools`).

## Overview

`google_maps_grounding` connects Gemini models directly to Google Maps to:
- Ground real-world locations, facility names, and street addresses.
- Verify opening hours, location metadata, and place overviews.
- Enhance geospatial responses with verified Google Maps navigation links.

## Usage

Import `google_maps_grounding` and add it to the agent's `tools` list:

```python
from google.adk.agents import Agent
from google.adk.models import Gemini
from google.adk.tools import google_maps_grounding

agent = Agent(
    name="geospatial_agent",
    model=Gemini(model="gemini-2.5-flash"),
    instruction="Answer queries by grounding location and facility details using Google Maps.",
    tools=[google_maps_grounding],
)
```

## Capabilities & Output

When activated, the agent automatically:
- Resolves fuzzy place names (e.g., "Shinjuku Central Park") to official addresses.
- Provides grounded metadata (place name, exact address, latitude/longitude).
- Avoids hallucinating non-existent public facilities or wrong locations.
