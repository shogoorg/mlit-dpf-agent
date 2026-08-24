# mlit-dpf-agent

An **unofficial** AI agent for searching and retrieving geospatial, urban infrastructure, and public data from the [MLIT Data Platform](https://data-platform.mlit.go.jp/) alongside global real-world places and routes via Google Maps.  
Built with Google ADK (Agent Development Kit), it combines the **MLIT Data Platform** (via [mlit-dpf-mcp](https://github.com/MLIT-DATA-PLATFORM/mlit-dpf-mcp)) with **Google Maps Grounding**, outputting dual-perspective responses with **PlateauView 3D** links for Japanese public assets and **Google Maps** links for global locations and navigation.

> ⚠️ **Disclaimer:** This is an unofficial community project and is not officially affiliated with or endorsed by the Ministry of Land, Infrastructure, Transport and Tourism (MLIT).

Simple ReAct agent  
Agent generated with `agents-cli` version `1.4.0`

## Overview & Architecture

```
[ User Query ] ⇄ [ mlit-dpf-agent (ADK / Gemini) ]
                         ├── [ mlit-dpf-mcp ] ⇄ [ MLIT Data Platform API ] ➔ [ PlateauView 3D ]
                         └── [ Google Maps Grounding ] ⇄ [ Google Maps API ] ➔ [ Google Maps ]
```

- **mlit-dpf-agent**: An ADK agent that performs dual searches across both MLIT DPF (for public infrastructure, shelters, and 3D urban data in Japan) and Google Maps Grounding (for worldwide POIs, businesses, and routes).
- **Multi-language Support**: Seamlessly processes and responds in Japanese, English, and other languages.
- **mlit-dpf-mcp**: The MCP server providing search and retrieval tools. For details, refer to the [mlit-dpf-mcp README](https://github.com/MLIT-DATA-PLATFORM/mlit-dpf-mcp#readme).

## Project Structure

```
mlit-dpf-agent/
├── app/                       # Core agent code
│   ├── agent.py               # Main agent logic
│   ├── fast_api_app.py        # FastAPI Backend server
│   └── app_utils/             # App utilities and helpers
├── skills/                    # Agent Skills (ADK & MLIT DPF)
│   ├── README.md              # Skills catalog
│   ├── adk/                   # Google Maps Grounding skill
│   └── mlit-data-plathome/    # MLIT DPF MCP skill
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

### 1. Places & Facilities (場所・施設検索)
- **Japanese**: *"さいたま市役所近くの避難所。"*  
  **English**: *"Evacuation shelters near Saitama City Hall."*

### 2. Routes & Directions (経路・行き方)
- **Japanese**: *"さいたま市役所からさいたま市立常盤公民館に行くにはどうすればよいですか？"*  
  **English**: *"How do I get from Saitama City Hall to Saitama City Tokiwa Community Center?"*

### 3. Distance & Proximity (距離・近接計算)
- **Japanese**: *"さいたま市役所から駅までの距離。"*  
  **English**: *"Distances from Saitama City Hall to nearby train stations."*

### 4. Transit & En-route Stations (広域移動・経由駅検索)
- **Japanese**: *"さいたま市役所から足立区役所に行くまでの駅を探してください。"*  
  **English**: *"Find train stations along the route from Saitama City Hall to Adachi City Hall."*

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

### 1. Japanese (日本語での対話例: 広域移動・経由駅検索)

#### プロンプト:
> *"さいたま市役所から足立区役所に行くまでの駅を探してください。"*

#### エージェントの回答例:

> さいたま市役所から足立区役所へ移動する際の主な最寄り駅および経由駅・乗換駅の情報は以下の通りです。
>
> ---
>
> ### 1. MLIT DPF (PlateauView 3D)
>
> MLIT DPFには、経路検索・乗換・経由駅等の交通ルートデータは含まれていないため、該当するデータは見つかりませんでした。
>
> ---
>
> ### 2. Google Maps (Google Maps Grounding)
>
> #### 1. 出発地・目的地の最寄り駅
> * **さいたま市役所側の最寄り駅**:
>   * **浦和駅**（JR京浜東北線・宇都宮線・高崎線・湘南新宿ライン）
> * **足立区役所側の最寄り駅**:
>   * **梅島駅**（東武スカイツリーライン） - 徒歩約12〜15分
>   * **五反野駅**（東武スカイツリーライン） - 徒歩約15分
>
> ---
>
> #### 2. 代表的な移動ルートと経由・乗換駅
>
> * **ルートA：上野・北千住経由（電車のみ）**
>   1. **浦和駅**（JR宇都宮線・高崎線または京浜東北線）
>   2. **上野駅** または **赤羽駅**（乗換・経由）
>   3. **北千住駅**（JR・東京メトロ・東武スカイツリーライン等）
>   4. **梅島駅** または **五反野駅**（足立区役所最寄り駅）
>
> * **ルートB：武蔵野線・東武線経由**
>   1. **浦和駅**（JR京浜東北線）
>   2. **南浦和駅**（JR武蔵野線へ乗り換え）
>   3. **南越谷駅 / 新越谷駅**（東武スカイツリーラインへ乗り換え）
>   4. **梅島駅**（足立区役所最寄り駅）
>
> * **ルートC：赤羽駅からバスを利用するルート**
>   1. **浦和駅**（JR京浜東北線等）
>   2. **赤羽駅**
>   3. 赤羽駅東口から足立区役所行きの路線バスを利用して直行移動
>
> * **ルート案内リンク**: [さいたま市役所 ➔ 足立区役所のルートを開く](https://www.google.com/maps/dir/?api=1&origin=さいたま市役所&destination=足立区役所)

---

### 2. English (英語での対話例: Transit & En-route Stations)

#### Prompt:
> *"Find train stations along the route from Saitama City Hall to Adachi City Hall."*

#### Agent Response:

> ### 1. MLIT DPF (PlateauView 3D)
> No relevant routing or transit data was found in the MLIT Data Platform for this query, as route navigation and en-route transit analysis are handled outside of the DPF dataset.
>
> ---
>
> ### 2. Google Maps (Google Maps Grounding)
>
> Below is an overview of key train stations along the transit routes connecting **Saitama City Hall** and **Adachi City Office (Hall)**.
>
> #### 🚆 Origin / Departure Stations (Near Saitama City Hall)
> - **Kita-Urawa Station** (JR Keihin-Tohoku Line) - ~1.1 km from Saitama City Hall
> - **Urawa Station** (JR Keihin-Tohoku, Utsunomiya, Takasaki, Shonan-Shinjuku Lines) - ~1.5 km
>
> #### 🔄 Major Intermediate & Transfer Stations
> 1. **Route via Akabane & Kita-Senju**:
>    - **Minami-Urawa Station** (JR Keihin-Tohoku Line / JR Musashino Line)
>    - **Akabane Station** (JR Lines)
>    - **Kita-Senju Station** (JR Joban Line, Tobu Skytree Line, Tokyo Metro Hibiya/Chiyoda Lines, Tsukuba Express)
> 2. **Route via Tobu Skytree Line**:
>    - **Nishiarai Station** (Tobu Skytree Line, Tobu Daishi Line)
>
> #### 🏁 Arrival / Destination Stations (Near Adachi City Hall)
> - **Umejima Station** (Tobu Skytree Line) - ~1.1 km to Adachi City Office (~12–15 min walk)
> - **Gotanno Station** (Tobu Skytree Line) - ~1.2 km to Adachi City Office (~15 min walk)

