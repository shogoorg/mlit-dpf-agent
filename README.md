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

> ### 1. MLIT DPF (PlateauView 3D)
> 経路検索および乗り換え・経由駅に関するデータはMLIT DPF（国土交通省データプラットフォーム）に含まれないため、該当するデータは見つかりませんでした。
>
> ---
>
> ### 2. Google Maps (Google Maps Grounding)
> [さいたま市役所](https://maps.google.com/?q=Saitama+City+Hall) から [足立区役所](https://maps.google.com/?q=Adachi+City+Office) へ向かう際の主な移動手段・経由駅をご案内します。
>
> #### 🗺️ おすすめの電車ルートと主な経由駅
>
> 1. **赤羽・北千住経由（標準的なルート）**
>    * **徒歩/バス**：[さいたま市役所](https://maps.google.com/?q=Saitama+City+Hall) ➔ [浦和駅](https://maps.google.com/?q=Urawa+Station)（または [北浦和駅](https://maps.google.com/?q=Kita-Urawa+Station)）
>    * **JR線**：[浦和駅](https://maps.google.com/?q=Urawa+Station) ➔ **[赤羽駅](https://maps.google.com/?q=Akabane+Station)** で乗り換え
>    * **JR常磐線/千代田線**：[赤羽駅](https://maps.google.com/?q=Akabane+Station) ➔ **[北千住駅](https://maps.google.com/?q=Kita-Senju+Station)**
>    * **東武スカイツリーライン**：[北千住駅](https://maps.google.com/?q=Kita-Senju+Station) ➔ **[梅島駅](https://maps.google.com/?q=Umejima+Station)**（または [五反野駅](https://maps.google.com/?q=Gotanno+Station)）
>    * **徒歩**：[梅島駅](https://maps.google.com/?q=Umejima+Station)（徒歩約12分）➔ [足立区役所](https://maps.google.com/?q=Adachi+City+Office)
>
> 2. **武蔵野線・東武スカイツリーライン経由**
>    * **乗車**：[北浦和駅](https://maps.google.com/?q=Kita-Urawa+Station)（JR京浜東北線）
>    * **乗り換え駅1**：**[南浦和駅](https://maps.google.com/?q=Minami-Urawa+Station)**（JR武蔵野線へ乗り換え）
>    * **乗り換え駅2**：**[南越谷駅](https://maps.google.com/?q=Minami-Koshigaya+Station) / [新越谷駅](https://maps.google.com/?q=Shin-Koshigaya+Station)**（東武スカイツリーラインへ乗り換え）
>    * **降車駅**：**[梅島駅](https://maps.google.com/?q=Umejima+Station)** ➔ [足立区役所](https://maps.google.com/?q=Adachi+City+Office)
>
> #### 📍 関連リンク
> * [さいたま市役所から足立区役所へのGoogle マップルート案内](https://www.google.com/maps/dir/?api=1&origin=%E3%81%95%E3%81%84%E3%81%9F%E3%81%BE%E5%B8%82%E1%B9%B9%E6%89%80&destination=%E8%B6%B3%E7%AB%8B%E5%8C%BA%E1%B9%B9%E6%89%80)

---

### 2. English (英語での対話例: Transit & En-route Stations)

#### Prompt:
> *"Find train stations along the route from Saitama City Hall to Adachi City Hall."*

#### Agent Response:

> ### 1. MLIT DPF (PlateauView 3D)
>
> No relevant routing, transit, or en-route station data was found in the MLIT Data Platform (DPF) dataset. Transit routes and en-route facility queries are not available in DPF.
>
> ---
>
> ### 2. Google Maps (Google Maps Grounding)
>
> To travel from **Saitama City Hall** to **Adachi City Hall**, you can take the following primary transit routes and key train stations along the way:
>
> #### Route 1: via JR Keihin-Tohoku Line & Tobu Skytree Line (Southbound via Tokyo / Kita-Senju)
> 1. **Departure Point:** Near [Saitama City Hall](https://maps.google.com/?q=Saitama+City+Hall) (walk or bus to **Urawa Station**).
> 2. **Board Train:** **[Urawa Station](https://maps.google.com/maps?cid=125955762729017677)** via JR Keihin-Tohoku Line or JR Utsunomiya/Takasaki Line southbound.
> 3. **Key Stations En-Route (JR Lines):**
>    - **[Kawaguchi Station](https://maps.google.com/maps?cid=2380321002154070180)**
>    - **Akabane Station** / **Nishi-Nippori Station**
>    - **[Kita-Senju Station](https://maps.google.com/maps?cid=916455017776921353)** *(Transfer Station)*
> 4. **Transfer:** At **Kita-Senju Station** to the **Tobu Skytree Line** (Local) northbound.
> 5. **Key Stations En-Route (Tobu Skytree Line):**
>    - **[Gotanno Station](https://maps.google.com/maps?cid=15577551084652085718)**
>    - **[Umejima Station](https://maps.google.com/maps?cid=2645490550474442010)** *(Closest station to Adachi City Hall)*
>    - **[Nishiarai Station](https://maps.google.com/maps?cid=11784116996624238944)**
> 6. **Destination:** **[Adachi City Hall](https://maps.google.com/maps?cid=11715761257836572232)** (approx. 10-12 min walk from Umejima Station).
>
> ---
>
> #### Route 2: via JR Musashino Line & Tobu Skytree Line (Eastbound via Koshigaya / Soka)
> 1. **Board Train:** From **Minami-Urawa Station** via JR Musashino Line eastbound.
> 2. **Transfer:** At **Minami-Koshigaya / Shin-Koshigaya Station** to the **Tobu Skytree Line** southbound.
> 3. **Key Stations En-Route (Tobu Skytree Line):**
>    - **[Soka Station](https://maps.google.com/maps?cid=15530497514608140943)**
>    - **[Takenotsuka Station](https://maps.google.com/maps?cid=5644149346570210508)**
>    - **[Nishiarai Station](https://maps.google.com/maps?cid=11784116996624238944)**
>    - **[Umejima Station](https://maps.google.com/maps?cid=2645490550474442010)**
> 4. **Destination:** Walk to **[Adachi City Hall](https://maps.google.com/maps?cid=11715761257836572232)**.
>
> ---
>
> 🗺️ **Direct Route & Navigation:**
> - [Google Maps Directions: Saitama City Hall to Adachi City Hall](https://www.google.com/maps/dir/?api=1&origin=Saitama+City+Hall&destination=Adachi+City+Hall)

