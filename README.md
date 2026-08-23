# mlit-dpf-agent

An AI agent for searching and retrieving data from the [MLIT Data Platform](https://data-platform.mlit.go.jp/) using natural language.  
Built with Google ADK (Agent Development Kit), it integrates with [mlit-dpf-mcp](https://github.com/MLIT-DATA-PLATFORM/mlit-dpf-mcp) to interact with the MLIT Data Platform API.

Simple ReAct agent  
Agent generated with `agents-cli` version `1.4.0`

## Overview & Architecture

```
[ User ] ⇄ [ mlit-dpf-agent (ADK / Gemini) ] ⇄ [ mlit-dpf-mcp (MCP Server) ] ⇄ [ MLIT Data Platform API ]
```

- **mlit-dpf-agent**: An ADK agent that understands user queries, invokes MCP tools, and provides categorized summaries of geospatial and infrastructure datasets.
- **mlit-dpf-mcp**: The MCP server providing search and retrieval tools. For setup instructions and MCP server details, please refer to the [mlit-dpf-mcp README](https://github.com/MLIT-DATA-PLATFORM/mlit-dpf-mcp#readme).

## Project Structure

```
mlit-dpf-agent/
├── app/         # Core agent code
│   ├── agent.py               # Main agent logic
│   ├── fast_api_app.py        # FastAPI Backend server
│   └── app_utils/             # App utilities and helpers
├── tests/                     # Unit, integration, and load tests
├── GEMINI.md                  # AI-assisted development guide
└── pyproject.toml             # Project dependencies
```

> 💡 **Tip:** Use [Antigravity CLI](https://antigravity.google/) for AI-assisted development - project context is pre-configured in `GEMINI.md`.

## Requirements

Before you begin, ensure you have:
- **uv**: Python package manager (used for all dependency management in this project) - [Install](https://docs.astral.sh/uv/getting-started/installation/) ([add packages](https://docs.astral.sh/uv/concepts/dependencies/) with `uv add <package>`)
- **agents-cli**: Agents CLI - Install with `uv tool install google-agents-cli`
- **Google Cloud SDK**: For GCP services - [Install](https://cloud.google.com/sdk/docs/install)
- **MLIT Data Platform Account & API Key**: [Get API Key](https://data-platform.mlit.go.jp/api_docs/usage/introduction.html)

## Environment Setup

Configure your `.env` file before running the agent:

```bash
cp .env.example .env
```

Ensure the following variables are configured in `.env`:
- `MLIT_API_KEY`: Your MLIT Data Platform API key ([Get API Key](https://data-platform.mlit.go.jp/api_docs/usage/introduction.html))
- `MLIT_BASE_URL`: `https://data-platform.mlit.go.jp/api/v1/`
- `GOOGLE_GENAI_USE_VERTEXAI`: `true` (or configure `GEMINI_API_KEY`)

## Quick Start

Install `agents-cli` and its skills if not already installed:

```bash
uvx google-agents-cli setup
```

Install required packages:

```bash
agents-cli install
```

Test the agent with a local web server:

```bash
agents-cli playground
```

Try asking queries in the playground, such as:
- **Search (`search`):**
  - *"Search for evacuation sites and shelters around Saitama City Hall"*
  - *"さいたま市役所周辺の避難場所と避難所を検索して"*
- **Get Data directly (`get_data`):**
  - *"Get detailed information for data ID `21a45b8d-0922-4f28-bfdc-0ae57961c6b5` in dataset `nlni_ksj-p05`"*
  - *"データセット `nlni_ksj-p05`、データID `21a45b8d-0922-4f28-bfdc-0ae57961c6b5` の詳細情報を取得して"*
- **Combined Workflow (`search` → `get_data`):**
  - *"Search for evacuation sites and shelters around Saitama City Hall, then show me the detailed information for the nearest shelter"*
  - *"さいたま市役所周辺の避難場所と避難所を検索して、最寄りの避難所の詳細情報を教えて"*

You can also use features from the [ADK](https://adk.dev/) CLI with `uv run adk`.

## Commands

| Command              | Description                                                                                 |
| -------------------- | ------------------------------------------------------------------------------------------- |
| `agents-cli install` | Install dependencies using uv                                                         |
| `agents-cli playground` | Launch local development environment                                                  |
| `agents-cli lint`    | Run code quality checks                                                               |
| `agents-cli eval`    | Evaluate agent behavior (generate, grade, analyze, and more — see `agents-cli eval --help`) |
| `uv run pytest tests/unit tests/integration` | Run unit and integration tests                                                        |
| `agents-cli deploy`  | Deploy agent to Cloud Run                                                                   |
| [A2A Inspector](https://github.com/a2aproject/a2a-inspector) | Launch A2A Protocol Inspector                                                        |

## 🛠️ Project Management

| Command | What It Does |
|---------|--------------|
| `agents-cli scaffold enhance` | Add CI/CD pipelines and Terraform infrastructure |
| `agents-cli infra cicd` | One-command setup of entire CI/CD pipeline + infrastructure |
| `agents-cli scaffold upgrade` | Auto-upgrade to latest version while preserving customizations |

---

## Development

Edit your agent logic in `app/agent.py` and test with `agents-cli playground` - it auto-reloads on save.

## Deployment (Cloud Run)

### 1. GCP Configuration & Enable APIs

```bash
# Set active project
gcloud config set project <your-project-id>

# Enable required Google Cloud APIs
gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  artifactregistry.googleapis.com \
  secretmanager.googleapis.com \
  aiplatform.googleapis.com \
  --project=<your-project-id>
```

### 2. Configure Deployment Target (if not already configured)

```bash
agents-cli scaffold enhance . --deployment-target cloud_run
```

### 3. Deploy to Cloud Run

```bash
agents-cli deploy --project <your-project-id> --region <your-region> --no-confirm-project
```

### 4. Test the Deployed Agent

```bash
# Run using ADK mode
agents-cli run --mode adk --url <deployed-service-url> "<your-prompt>"

# Run via A2A protocol
agents-cli run --mode a2a --url <deployed-service-url> "<your-prompt>"
```

---

To add CI/CD and Terraform, run `agents-cli scaffold enhance`.
To set up your production infrastructure, run `agents-cli infra cicd`.

## Observability

Built-in telemetry exports to Cloud Trace, BigQuery, and Cloud Logging.

## A2A Inspector

This agent supports the [A2A Protocol](https://a2a-protocol.org/). Use the [A2A Inspector](https://github.com/a2aproject/a2a-inspector) to test interoperability.
See the [A2A Inspector docs](https://github.com/a2aproject/a2a-inspector) for details.

---

## 💬 Sample Interaction & Response Showcase (対話・出力例)

### User Prompt (English / 日本語)
- **EN:** *"Search for designated emergency evacuation sites and shelters around Saitama City Hall, then show me the detailed information for the nearest shelter."*
- **JA:** *"さいたま市役所周辺の避難場所と避難所を検索して、最寄りの避難所の詳細情報を教えて"*

### Agent Response (エージェントの出力結果)

> Here are the designated emergency evacuation sites and public facilities around Saitama City Hall, along with detailed information for the nearest shelter.
>
> ---
>
> ### Nearby Emergency Evacuation Sites & Facilities (around Saitama City Hall)
>
> 1. **Saitama City Hall / Urawa Ward Office (さいたま市役所 / 浦和区役所)**
>    - **Type**: Administrative Facility / Designated Base Facility
>    - **Estimated Distance / Walking Time**: 0 m (~0 min walk)
> 2. **Saitama City Nakamachi Elementary School (さいたま市立仲町小学校)**
>    - **Type**: Elementary School / Designated Emergency Evacuation Site & Shelter
>    - **Estimated Distance / Walking Time**: ~450 m (~6 min walk)
> 3. **Besshonuma Park Temporary Evacuation Area (別所沼公園 一時避難場所)**
>    - **Type**: Park / Temporary Evacuation Site
>    - **Estimated Distance / Walking Time**: ~850 m (~11 min walk)
>
> ---
>
> ### Detailed Information for Nearest Shelter: Saitama City Nakamachi Elementary School (さいたま市立仲町小学校)
>
> #### Section 1: Attribute Information (属性情報)
>
> * **MLIT DPF (`nlni_ksj-p29` / `p05`) Attributes**:
>   * **Full Facility Name**: さいたま市立仲町小学校 (Saitama City Nakamachi Elementary School)
>   * **Facility Type Code / Category**: 16001 (Elementary School / 学校)
>   * **Administrative Code**: 11107 (Saitama City Urawa Ward / 埼玉県さいたま市浦和区)
>   * **Dataset ID**: `nlni_ksj-p29`
>   * **Data ID**: `7ddd06b7-ff50-4986-b8c9-692ab015761d`
>   * **Latitude / Longitude**: 35.863961, 139.640549
>   * **Disaster Suitability Flags**:
>     * **Flood (洪水)**: Suitable / Grounded shelter facility
>     * **Earthquake (地震)**: Suitable (Designated shelter and evacuation ground)
>     * **Landslide / Debris Flow (土砂災害)**: Suitable
>     * **Tsunami (津波)**: Not Applicable / Low risk area
>     * **Fire (火災)**: Suitable
>
> * **Google Maps Attributes**:
>   * **Official Place Name**: Nakamachi Elementary School (さいたま市立仲町小学校)
>   * **Exact Street Address**: 8 Chome-18-4 Tokiwa, Urawa Ward, Saitama, 330-0061, Japan
>   * **Facility Overview**: Municipal elementary school serving as a primary designated emergency evacuation site and shelter for surrounding neighborhoods.
>
> ---
>
> #### Section 2: Map & 3D Viewer Links (地図・3Dビューア)
>
> 1. **PlateauView 3D Link**:  
>    https://plateauview.mlit.go.jp/#/35.86396099527865/139.64054899888734/16/
> 2. **GSI Hazard Overlay Map Link**:  
>    https://disaportal.gsi.go.jp/hazardmap/maps/index.html?ll=35.86396099527865,139.64054899888734&z=16&base=pale&vs=c1j0l0u0t0h0z0
> 3. **Google Earth 3D Link**:  
>    https://earth.google.com/web/@35.86396099527865,139.64054899888734,100a,500d,60y,0h,0t,0r
> 4. **Google Maps Link**:  
>    https://maps.google.com/?q=35.86396099527865,139.64054899888734
