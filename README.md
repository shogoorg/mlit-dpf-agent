# mlit-dpf-agent

An **unofficial** geospatial AI agent that queries open datasets from Japan's [MLIT Data Platform](https://data-platform.mlit.go.jp/) using the **MLIT DPF MCP**.

Built with Google ADK (Agent Development Kit), it connects to the **MLIT Data Platform** (via [mlit-dpf-mcp](https://github.com/MLIT-DATA-PLATFORM/mlit-dpf-mcp)), providing verified public records with **PlateauView 3D** visualization links.

> ⚠️ **Disclaimer:** This is an unofficial community project and is not officially affiliated with or endorsed by the Ministry of Land, Infrastructure, Transport and Tourism (MLIT).

Simple ReAct agent  
Agent generated with `agents-cli` version `1.4.0`

---

## Overview & Architecture

```
[ User Query ] ⇄ [ mlit-dpf-agent (ADK / Gemini) ]
                         └── [ mlit-dpf-mcp ] ⇄ [ MLIT Data Platform API ] ➔ [ PlateauView 3D ]
```

### Core Capabilities
1. **Official Geospatial Records (MLIT DPF / PlateauView 3D)**: Official administrative records, designated evacuation shelters, public infrastructure, urban planning, and 3D urban models across Japan.
2. **PlateauView 3D Visualizations**: Automatically generates direct 3D visual exploration links (`https://plateauview.mlit.go.jp/#/<lat>/<lon>/16/`).
3. **Multi-language Support**: Seamlessly processes queries and responds in Japanese, English, and other languages.

---

## Project Structure

```
mlit-dpf-agent/
├── app/                       # Core agent code
│   ├── agent.py               # Main agent logic & orchestration
│   ├── mlit_agent.py          # MLIT DPF specialized agent (SSE MCP client)
│   ├── fast_api_app.py        # FastAPI Backend server
│   └── app_utils/             # App utilities and helpers
├── skills/                    # Agent Skills (MLIT DPF)
│   ├── README.md              # Skills catalog
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
* **Google Cloud SDK**: For Vertex AI - [Install](https://cloud.google.com/sdk/docs/install)
* **MLIT DPF MCP Server**: Running `mlit-dpf-mcp` instance (SSE endpoint)

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

# MLIT DPF MCP Server URL (SSE)
MLIT_MCP_SERVER_URL=http://localhost:8000/sse
```

---

## Local Development (ローカル開発・実行)

To run the complete 3-tier system on your local machine:

### 1. Step 1: Run MLIT DPF MCP Server (Local)
In the MCP server repository, install dependencies and start the SSE server:

```bash
cd ../mlit-dpf-mcp
uv sync
uv run python src/server.py
```
* **Local SSE Endpoint**: `http://localhost:8000/sse`

---

### 2. Step 2: Run ADK Agent (Local)
In this repository (`mlit-dpf-agent`), set up your `.env` and start the interactive playground:

```bash
# Configure environment
cp .env.example .env

# Install dependencies
agents-cli install

# Start local agent dev server
agents-cli playground
```
* **Local Dev UI**: `http://127.0.0.1:8080/dev-ui/?app=app`
* **Local A2A RPC Endpoint**: `http://localhost:8080/a2a/app`

---

### 3. Step 3: Run React Web UI (Local)
In the React frontend directory, install dependencies and launch the Vite dev server:

```bash
cd client/web/react
npm install
npm run dev
```
* **Local Web Client**: `http://localhost:5173/`

---

## Production Deployment (Cloud Run 本番デプロイ)

The production deployment consists of 3 standalone Cloud Run services:
1. **MLIT DPF MCP Server** (`mlit-dpf-mcp`): Communicates with official MLIT data APIs via SSE.
2. **ADK Agent Server** (`mlit-dpf-agent`): Orchestrates Gemini LLM, MLIT MCP tools, and A2UI JSON output.
3. **React Web UI** (`client/web/react`): Frontend chat interface with A2UI maps and cards.

---

### 1. Enable Required GCP APIs

```bash
gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  artifactregistry.googleapis.com \
  secretmanager.googleapis.com \
  aiplatform.googleapis.com \
  cloudresourcemanager.googleapis.com \
  --project=shogoorg-mlit-dpf
```

---

### 2. Step 1: Deploy MLIT DPF MCP Server to Cloud Run

Deploy `mlit-dpf-mcp` as a standalone SSE service on Cloud Run:

```bash
cd ../mlit-dpf-mcp
gcloud run deploy mlit-dpf-mcp \
  --source . \
  --project shogoorg-mlit-dpf \
  --region us-west1 \
  --set-env-vars "MLIT_API_KEY=<your-mlit-api-key>,MLIT_BASE_URL=https://data-platform.mlit.go.jp/api/v1/" \
  --allow-unauthenticated
```

Note the service URL output (e.g., `https://mlit-dpf-mcp-<hash>-<region>.a.run.app`). The SSE endpoint will be:
`https://<your-mcp-server-endpoint>/sse`

---

### 3. Step 2: Deploy ADK Agent (`mlit-dpf-agent`) to Cloud Run

Deploy the agent using `agents-cli deploy`:

```bash
cd ../mlit-dpf-agent
agents-cli deploy \
  --project shogoorg-mlit-dpf \
  --region us-west1 \
  --no-confirm-project
```

#### Update Environment Variables & Public Access

Update the Cloud Run service with the deployed MCP server URL and enable public access:

```bash
# Update MCP server URL
gcloud run services update mlit-dpf-agent \
  --project shogoorg-mlit-dpf \
  --region us-west1 \
  --update-env-vars "MLIT_MCP_SERVER_URL=https://<your-mcp-server-endpoint>/sse"

# Grant public invoker access
gcloud run services add-iam-policy-binding mlit-dpf-agent \
  --member="allUsers" \
  --role="roles/run.invoker" \
  --project shogoorg-mlit-dpf \
  --region us-west1
```

#### Verification Endpoints
* **Web UI (ADK Dev UI)**: `https://<your-agent-endpoint>/dev-ui/?app=app`
* **A2A Agent Card**: `https://<your-agent-endpoint>/a2a/app/.well-known/agent-card.json`
* **A2A RPC Endpoint**: `https://<your-agent-endpoint>/a2a/app`

---

### 4. Step 3: Deploy React Web UI (`client/web/react`) to Cloud Run

To deploy the React web client to Cloud Run:

```bash
cd client/web/react

# Deploy directly with Cloud Run source deploy
gcloud run deploy mlit-dpf-web \
  --source . \
  --project shogoorg-mlit-dpf \
  --region us-west1 \
  --set-env-vars "VITE_A2A_SERVER_URL=https://<your-agent-endpoint>/a2a/app,VITE_GOOGLE_MAPS_API_KEY=<your-maps-api-key>" \
  --allow-unauthenticated
```

#### Verification Endpoints
* **React Web UI**: `https://<your-web-ui-endpoint>`


---

## Sample Interactions & Live Responses

### 1. English Interactions (英語での対話例)

#### Place & Evacuation Shelter Search

**Prompt**:
> *"Tell me evacuation shelters near Saitama City Hall."*

**Agent Response**:
> Here are evacuation shelters and emergency locations near Saitama City Hall from the MLIT Data Platform:
>
> * **仲町小学校 (Nakacho Elementary School)**
>   * Category: Evacuation Facility Data (`nlni_ksj-p20`)
>   * Coordinates: 35.863961, 139.640549
>   * PlateauView 3D: [View in PlateauView 3D](https://plateauview.mlit.go.jp/#/35.863961/139.640549/16/)
> * **常盤公園 (Tokiwa Park)**
>   * Category: Evacuation Facility Data (`nlni_ksj-p20`)
>   * Coordinates: 35.862184, 139.650975
>   * PlateauView 3D: [View in PlateauView 3D](https://plateauview.mlit.go.jp/#/35.862184/139.650975/16/)
> * **常盤小学校 (Tokiwa Elementary School)**
>   * Category: Evacuation Facility Data (`nlni_ksj-p20`)
>   * Coordinates: 35.868739, 139.643076
>   * PlateauView 3D: [View in PlateauView 3D](https://plateauview.mlit.go.jp/#/35.868739/139.643076/16/)

---

### 2. Japanese Interactions (日本語での対話例)

#### 場所・避難所検索

**プロンプト**:
> *"さいたま市役所周辺の避難所を教えて"*

**エージェントの回答**:
> さいたま市役所（埼玉県さいたま市浦和区常盤6丁目4-4）周辺の避難所および関連施設の情報は以下の通りです。
>
> 国土交通省データ等に登録されている公的施設・指定避難所データです。
> * **さいたま市立仲町小学校**
>   * カテゴリ: 学校施設（指定避難所）
>   * 座標: 緯度 35.863961, 経度 139.640549
>   * PlateauView 3D: [3D表示で見る](https://plateauview.mlit.go.jp/#/35.863961/139.640549/16/)
> * **さいたま市立常盤小学校**
>   * カテゴリ: 学校施設（指定避難所）
>   * 座標: 緯度 35.868739, 経度 139.643076
>   * PlateauView 3D: [3D表示で見る](https://plateauview.mlit.go.jp/#/35.868739/139.643076/16/)
> * **さいたま市立高砂小学校**
>   * カテゴリ: 学校施設（指定避難所）
>   * 座標: 緯度 35.856518, 経度 139.656714
>   * PlateauView 3D: [3D表示で見る](https://plateauview.mlit.go.jp/#/35.856518/139.656714/16/)

---

## License

Apache License 2.0
