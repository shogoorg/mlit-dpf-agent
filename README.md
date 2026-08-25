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
* *"How do I get from Saitama City Hall to Saitama City Tokiwa Elementary School?"*  
  *(Japanese: "さいたま市役所からさいたま市立常盤小学校までの行き方を教えて")*

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

## Sample Interactions & Live Responses

### 1. English Interactions (英語での対話例)

#### 1. Place & Evacuation Shelter Search (Dual Sections)

**Prompt**:
> *"Tell me evacuation shelters near Saitama City Hall."*

**Agent Response**:
> Here are evacuation shelters and emergency locations near Saitama City Hall:
>
> #### 1. MLIT DPF (PlateauView 3D)
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
>
> #### 2. Google Maps (Grounding Lite)
> * **別所沼公園 一時避難場所 (Besshonuma Park Temporary Evacuation Area)**
>   * Address: 1-Chome, Oto, Chuo Ward, Saitama, 338-0012
>   * Google Maps: [View on Google Maps](https://www.google.com/maps/place//data=!4m2!3m1!1s0x6018c10998e26141:0xf84e1d900c6f9a67)
> * **さいたま市立仲町小学校 (Nakacho Elementary School)**
>   * Address: 8-18-4 Tokiwa, Urawa Ward, Saitama, 330-0061
>   * Google Maps: [View on Google Maps](https://www.google.com/maps/place//data=!4m2!3m1!1s0x6018c1d00e4efc61:0xb5742d83aa80fb86)
> * **さいたま市立常盤小学校 (Tokiwa Elementary School)**
>   * Address: 9-30-9 Tokiwa, Urawa Ward, Saitama, 330-0061
>   * Google Maps: [View on Google Maps](https://www.google.com/maps/place//data=!4m2!3m1!1s0x6018c1ceee0daae9:0xa65699ee32683a1f)

---

#### 2. Route & Navigation (Google Maps Direct)

**Prompt**:
> *"How do I get from Saitama City Hall to Saitama City Tokiwa Elementary School?"*

**Agent Response**:
> Here are the travel options to get from Saitama City Hall to Saitama City Tokiwa Elementary School:
>
> - 🚶 **Walking (Recommended)**
>   - **Distance**: Approximately 925 meters
>   - **Duration**: ~13 minutes
> - 🚗 **Driving**
>   - **Distance**: Approximately 1.4 km
>   - **Duration**: ~6 minutes
> - 🗺️ **Google Maps Directions**
>   - [Google Maps Route: Saitama City Hall to Tokiwa Elementary School](https://www.google.com/maps/dir/%E3%81%95%E3%81%84%E3%81%9F%E3%81%BE%E5%B8%82%E5%BD%B9%E6%89%80%2C%20%E5%9F%BC%E7%8E%89%E7%9C%8C%E3%81%95%E3%81%84%E3%81%9F%E3%81%BE%E5%B8%82%E6%B5%A6%E5%92%8C%E5%8C%BA%E5%B8%B8%E7%9B%A46-4-4/%E3%81%95%E3%81%84%E3%81%9F%E3%81%BE%E5%B8%82%E7%AB%8B%E5%B8%B8%E7%9B%A4%E5%B0%8F%E5%AD%A6%E6%A0%A1%2C%20%E5%9F%BC%E7%8E%89%E7%9C%8C%E3%81%95%E3%81%84%E3%81%9F%E3%81%BE%E5%B8%82%E6%B5%A6%E5%92%8C%E5%8C%BA%E5%B8%B8%E7%9B%A49-30-9)

---

#### 3. Weather Query (Safe Fallback Handling)

**Prompt**:
> *"What is the current weather around Saitama City Hall?"*

**Agent Response**:
> I'm sorry, but real-time weather information is currently not available for Saitama City Hall.

---

### 2. Japanese Interactions (日本語での対話例)

#### 1. 場所・避難所検索 (2セクション並行表示)

**プロンプト**:
> *"さいたま市役所周辺の避難所を教えて"*

**エージェントの回答**:
> さいたま市役所（埼玉県さいたま市浦和区常盤6丁目4-4）周辺の避難所および関連施設の情報は以下の通りです。
>
> #### 1. MLIT DPF (PlateauView 3D)
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
>
> #### 2. Google Maps (Grounding Lite)
> さいたま市役所周辺の避難場所および防災関連施設の情報です。
> * **別所沼公園 一時避難場所**
>   * 住所: 埼玉県さいたま市中央区大戸1丁目6-5
>   * Google Maps: [地図で見る](https://www.google.com/maps/place//data=!4m2!3m1!1s0x6018c10998e26141:0xf84e1d900c6f9a67)
> * **埼玉県 危機管理防災センター**
>   * 住所: 埼玉県さいたま市浦和区高砂3丁目15-1
>   * Google Maps: [地図で見る](https://www.google.com/maps/place//data=!4m2!3m1!1s0x6018ea7fb7fd7349:0x984fa1e16cfc58a7)
> * **さいたま市立常盤小学校**
>   * 住所: 埼玉県さいたま市浦和区常盤9丁目30-9
>   * Google Maps: [地図で見る](https://www.google.com/maps/place//data=!4m2!3m1!1s0x6018c1ceee0daae9:0xa65699ee32683a1f)

---

#### 2. 経路・行き方検索 (Google Maps 直接表示)

**プロンプト**:
> *"さいたま市役所からさいたま市立常盤小学校までの行き方を教えて"*

**エージェントの回答**:
> さいたま市役所からさいたま市立常盤小学校までのルート・移動情報は以下の通りです。
>
> - 🚶 **徒歩での移動**
>   - 移動距離: 約 830 m
>   - 所要時間: 約 12 分 (※徒歩ルートはベータ版機能のため、実際の通行時は歩道や交通状況にご注意ください。)
> - 🚗 **お車での移動**
>   - 移動距離: 約 1.2 km
>   - 所要時間: 約 5 分
> - 📍 **詳細なルートとナビゲーション（Google Maps）**
>   - [さいたま市役所からさいたま市立常盤小学校へのルートを見る](https://www.google.com/maps/dir/%E5%9F%BC%E7%8E%89%E7%9C%8C%E3%81%95%E3%81%84%E3%81%9F%E3%81%BE%E5%B8%82%E6%B5%A6%E5%92%8C%E5%8C%BA%E5%B8%B8%E7%9B%A46%E4%B8%81%E7%9B%AE4-4/%E5%9F%BC%E7%8E%89%E7%9C%8C%E3%81%95%E3%81%84%E3%81%9F%E3%81%BE%E5%B8%82%E6%B5%A6%E5%92%8C%E5%8C%BA%E5%B8%B8%E7%9B%A49%E4%B8%81%E7%9B%AE30-9)

---

#### 3. 天気検索 (安全なフォールバック案内)

**プロンプト**:
> *"さいたま市役所周辺の今の天気は？"*

**エージェントの回答**:
> 申し訳ありません。現在、該当地域のリアルタイム気象データを取得することができませんでした。
>
> さいたま市役所周辺の最新の天気・気温・警報情報等につきましては、気象庁Webサイトや各種天気予報サービス、またはGoogle等で検索してご確認いただきますようお願いいたします。

---

## License

Apache License 2.0


