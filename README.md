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
- *"Search for data related to Saitama City Hall"*
- *"さいたま市役所のデータを検索して"*

You can also use features from the [ADK](https://adk.dev/) CLI with `uv run adk`.

## Commands

| Command              | Description                                                                                 |
| -------------------- | ------------------------------------------------------------------------------------------- |
| `agents-cli install` | Install dependencies using uv                                                         |
| `agents-cli playground` | Launch local development environment                                                  |
| `agents-cli lint`    | Run code quality checks                                                               |
| `agents-cli eval`    | Evaluate agent behavior (generate, grade, analyze, and more — see `agents-cli eval --help`) |
| `uv run pytest tests/unit tests/integration` | Run unit and integration tests                                                        |
| `agents-cli deploy`  | Deploy agent to Cloud Run                                                                   || [A2A Inspector](https://github.com/a2aproject/a2a-inspector) | Launch A2A Protocol Inspector                                                        |

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
