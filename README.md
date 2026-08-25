# mlit-dpf-agent

An **unofficial** geospatial AI agent that integrates open datasets from Japan's [MLIT Data Platform](https://data-platform.mlit.go.jp/) with real-world places, routes, and weather from Google Maps via the **Maps Grounding Lite MCP**.

Built with Google ADK (Agent Development Kit), it connects to the **MLIT Data Platform** (via [mlit-dpf-mcp](https://github.com/MLIT-DATA-PLATFORM/mlit-dpf-mcp)) and **Google Maps Grounding Lite MCP** (`https://mapstools.googleapis.com/mcp`), providing verified public records with **PlateauView 3D** links alongside real-time **Google Maps** navigation and place details.

> ⚠️ **Disclaimer:** This is an unofficial community project and is not officially affiliated with or endorsed by the Ministry of Land, Infrastructure, Transport and Tourism (MLIT).

Simple ReAct agent  
Agent generated with `agents-cli` version `1.4.0`

---

## Overview & Architecture

```
[ User Query ] ⇄ [ mlit-dpf-agent (ADK / Gemini) ]
                         ├── [ mlit-dpf-mcp ] ⇄ [ MLIT Data Platform API ] ➔ [ PlateauView 3D ]
                         └── [ Maps Grounding Lite MCP ] ⇄ [ mapstools.googleapis.com/mcp ] ➔ [ Google Maps ]
```

### Core Capabilities
1. **Places & Public Datasets (Dual-Perspective)**:
   * **MLIT DPF (PlateauView 3D)**: Official administrative records, designated evacuation shelters, public infrastructure, and 3D urban models in Japan.
   * **Google Maps (Grounding Lite)**: Real-world POIs, verified full addresses, and direct Google Maps links.
2. **Routes, Navigation & Weather**:
   * Direct route computations (`compute_routes`), walking/driving durations, and turn-by-turn links powered by Google Maps. MLIT DPF is cleanly omitted for route/weather queries to provide clean, focused responses.
3. **Multi-language Support**: Seamlessly processes queries and responds in Japanese, English, and other languages.

---

## Project Structure

```
mlit-dpf-agent/
├── app/                       # Core agent code
│   ├── agent.py               # Main agent logic & MCP toolsets configuration
│   ├── fast_api_app.py        # FastAPI Backend server
│   └── app_utils/             # App utilities and helpers
├── skills/                    # Agent Skills (ADK & MLIT DPF)
│   ├── README.md              # Skills catalog
│   ├── adk/                   # ADK helper skills
│   └── mlit-data-plathome/    # MLIT DPF MCP skill
├── tests/                     # Unit, integration, and E2E tests
├── GEMINI.md                  # AI-assisted development guide
└── pyproject.toml             # Project dependencies
```

---

## Requirements

Before you begin, ensure you have:
* **uv**: Python package manager - [Install](https://docs.astral.sh/uv/getting-started/installation/)
* **agents-cli**: Google Agents CLI - `uv tool install google-agents-cli`
* **Google Cloud SDK**: For Vertex AI and Maps Platform APIs - [Install](https://cloud.google.com/sdk/docs/install)
* **MLIT Data Platform Account & API Key**: [Get MLIT API Key](https://data-platform.mlit.go.jp/api_docs/usage/introduction.html)
* **Google Maps Platform API Key**: With **Maps Grounding Lite API** enabled in Google Cloud Console.

---

## Environment Setup

Configure your `.env` file before running the agent:

```bash
cp .env.example .env
```

Ensure the following variables are configured in `.env`:

```env
# Vertex AI Configuration (default)
GOOGLE_GENAI_USE_VERTEXAI=true
GOOGLE_CLOUD_PROJECT=your-gcp-project-id
GOOGLE_CLOUD_LOCATION=global

# MLIT Data Platform
MLIT_API_KEY=your_mlit_api_key
MLIT_BASE_URL=https://data-platform.mlit.go.jp/api/v1/

# Google Maps Platform (Maps Grounding Lite MCP)
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

---

## Quick Start

Install dependencies:

```bash
agents-cli install
```

Launch the interactive local playground:

```bash
agents-cli playground
```

Access the UI at `http://127.0.0.1:8080/dev-ui/?app=app`.

---

## Commands

| Command | Description |
| :--- | :--- |
| `agents-cli install` | Install dependencies using uv |
| `agents-cli playground` | Launch local development environment (interactive UI) |
| `uv run pytest tests/unit tests/integration` | Run unit, agent stream, and E2E integration tests |
| `agents-cli lint` | Run code quality checks |
| `agents-cli eval` | Run agent evaluation datasets and grade traces |
| `agents-cli deploy` | Deploy agent to Cloud Run |

---

## Sample Queries

Try asking queries in the playground or via API:

### 1. Places & Public Facilities (Dual Sections: MLIT DPF + Google Maps)
* *"Tell me evacuation shelters near Saitama City Hall."*  
  *(Japanese: "さいたま市役所周辺の避難所を教えて")*

### 2. Routes & Navigation (Google Maps Direct)
* *"How do I get from Saitama City Hall to Saitama University Attached Elementary School?"*  
  *(Japanese: "さいたま市役所から埼玉大学教育学部附属小学校までの行き方を教えて")*

### 3. Weather (Google Maps Direct)
* *"What is the current weather around Saitama City Hall?"*  
  *(Japanese: "さいたま市役所周辺の今の天気は？")*

---

## Deployment (Cloud Run)

### 1. Enable Required APIs

```bash
gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  artifactregistry.googleapis.com \
  secretmanager.googleapis.com \
  aiplatform.googleapis.com \
  --project=<your-project-id>
```

### 2. Deploy via CLI

```bash
agents-cli deploy --project <your-project-id> --region <your-region> --no-confirm-project
```

---

## License

Apache License 2.0
