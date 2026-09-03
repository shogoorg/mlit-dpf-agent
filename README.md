# mlit-dpf-agent

## Overview & Architecture

**`mlit-dpf-agent`** is an AI agent built with Google ADK that leverages **`mlit-dpf-mcp`** (MLIT Data Platform MCP Server) to ground LLM intelligence in official public data from Japan's Ministry of Land, Infrastructure, Transport and Tourism, seamlessly integrating with **PlateauView 3D** for geospatial exploration.

```
[ User Query ] ⇄ [ mlit-dpf-agent (ADK / Gemini) ]
                         └── [ mlit-dpf-mcp ] ⇄ [ MLIT Data Platform API ] ➔ [ PlateauView 3D ]
```

> ⚠️ **Disclaimer:** This is an unofficial community project and is not officially affiliated with or endorsed by the Ministry of Land, Infrastructure, Transport and Tourism (MLIT).

### Mission Statement
> *"Manually finding, formatting, and combining geospatial data takes hours of work. Our mission is to eliminate that busywork entirely. Just use natural language to ask for the data you're looking for, and watch the agent guide you directly to the required 3D layers on PlateauView—turning manual research into instant spatial insights."*

---

### The 3 Core Pillars of Value

```
        ┌─────────────────────────────────────────────────────────┐
        │            Project PLATEAU × MLIT DPF Agent             │
        └─────────────────────────────────────────────────────────┘
                     │                       │                       │
        ┌────────────▼────────────┐ ┌────────▼────────┐ ┌────────────▼────────────┐
        │     1. Multilingual     │ │  2. Factuality  │ │      3. Reasoning       │
        │ (Global Inclusive Access│ │(Grounded Truth) │ │(Spatial & Intent Logic) │
        └─────────────────────────┘ └─────────────────┘ └─────────────────────────┘
```

1. **Multilingual (Global & Inclusive Access)**:
   - Breaks linguistic barriers for international residents, inbound visitors, and global urban researchers.
   - Users can query in **English, Japanese, Chinese, French, Spanish**, etc., and the agent translates intents into precise continuous Japanese search keywords for PlateauView 3D.

2. **Factuality (Authoritative Grounding in Public Goods)**:
   - **Zero-hallucination** spatial intelligence strictly grounded in sovereign **Digital Public Infrastructure (DPI)** from MLIT DPF & Project PLATEAU via MCP.
   - Delivers official statutory hazard zones, GSI map coordinates, and official LOD1/LOD2 metadata backed by national open government standards (CC BY 4.0).

3. **Reasoning (High-Order Spatial Reasoning)**:
   - Transforms ambiguous, high-level user objectives (e.g., *"I want to create a disaster prevention map for Saitama City Hall"*) into concrete thematic layer combinations (`fld`, `htd`, `tsu`, `lsld`), physical structures, and administrative coverage.

---

### Public Goods vs Commercial Stacks

1. **Public Goods MCP (`mlit-dpf-mcp` vs Maps Grounding Lite)**: While *Maps Grounding Lite* connects agents to commercial map data, **`mlit-dpf-mcp`** connects directly to national **Public Goods**—official geospatial datasets, urban infrastructure, and disaster prevention records.
2. **Public Goods Agent (`mlit-dpf-agent` vs Maps Agentic UI Toolkit)**: While the *Google Maps Agentic UI Toolkit* orchestrates commercial POI interactions, **`mlit-dpf-agent`** is purpose-built to navigate public administrative workflows and national open data.
3. **Public Goods Map (PlateauView 3D vs Google Maps)**: While standard solutions visualize onto commercial *Google Maps*, **`mlit-dpf-agent`** integrates with Japan's official **PlateauView 3D** for rich, open-standard 3D urban model exploration.

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
In this repository (`mlit-dpf-agent`), launch the Project PLATEAU 3D Agent using either option below:

---

#### Option A: Full A2UI Web App Server (Recommended for Map & Card UI)
Starts the FastAPI server with A2A / A2UI endpoints mounted on port 8080:
```bash
# Configure environment
cp .env.example .env

# Install dependencies
agents-cli install

# Run Project PLATEAU 3D Agent
uv run python -m app.fast_api_app
```
* **Local A2A RPC Endpoint**: `http://localhost:8080/a2a/app`
* **Agent Card**: `http://localhost:8080/a2a/app/.well-known/agent-card.json`

#### Option B: ADK CLI Playground (For Trace & Inspection)
Starts the ADK interactive developer UI on port 8080:
```bash
agents-cli playground
```
* **Local Dev UI**: `http://127.0.0.1:8080/dev-ui/?app=app`

> **Note**: Both options listen on port 8080. Run either Option A or Option B, not both simultaneously.

---

### 3. Step 3: Run React Web UI (Local)
*(Required when using Option A)* In the React frontend directory, install dependencies and launch the Vite dev server:

```bash
cd client/web/react
npm install
npm run dev
```
* **Local Web Client**: `http://localhost:5173/`

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

## Core Concept: Intelligent PlateauView Search Assistant (3 Core Entities)

The fundamental mission of **`mlit-dpf-agent`** is to serve as an intelligent search assistant that translates natural conversational inquiries into exact query inputs for the **PlateauView Search Box**.

> 💡 **The 3 Invariant Pillars of Actionable Spatial Exploration:**
> In geospatial intelligence (GIS / MLIT DPF / Project PLATEAU), every meaningful user inquiry strictly resolves across 3 non-fungible foundational axes:
> 1. **What (Dataset / Category)**: The thematic layer (e.g. 3D building models, flood risk, zoning districts).
> 2. **Which (Building / Structure)**: The physical structure/facility (e.g. City Hall, fire stations, schools).
> 3. **Where (Address / Coverage)**: The geographic administrative hierarchy (Prefecture, Municipality, Town/Chome).
> Answers that blur or confuse these 3 dimensions lack actionable utility. `mlit-dpf-agent` strictly grounds every response in this 3-pillar foundation.

```
┌─────────────────────────────────────────────────────────────┐
│ 👤 User Natural Language                                    │
│ "I want to create a hazard map", "Buildings near City Hall" │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ 🤖 mlit-dpf-agent (ADK / Gemini 3.6 Flash)                  │
│ Resolves intent across MLIT DPF APIs and generates the      │
│ exact PlateauView keywords across the 3 Fundamental Entities │
└──────────────────────────────┬──────────────────────────────┘
                               │ 2-Step Copy & Paste
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ 🔍 PlateauView Search Box (Accepts 3 Core Entity Types)     │
│                                                             │
│  ① Dataset / Category: `建築物モデル`, `洪水浸水想定区域モデル`   │
│  ② Building / Facility: `さいたま市役所本庁舎`                 │
│  ③ Address (Levels 1〜3): `埼玉県さいたま市浦和区常盤`         │
│                                                             │
│  Combined Shortcut: `建築物モデル 埼玉県さいたま市浦和区`      │
└─────────────────────────────────────────────────────────────┘
```

### The 3 Fundamental Spatial Entities

1. **データセット (Dataset / Category / 12 Thematic Layers) [HIGHEST PRIORITY]**:
   - **Scope**: All 12 national thematic datasets (建築物 `bldg`, 道路 `tran`, 都市設備 `frn`, 植生 `veg`, 土地利用 `luse`, 数値地形 `dem`, 汎用 `gen`, 洪水浸水 `fld`, 内水 `htd`, 高潮/津波 `tsu`/`tnm`, 土砂災害 `lsld`, 都市計画 `urf`).
   - **Query Keywords**: `データセット`, `カテゴリー`, `テーマ`, `カタログ`, `何がある`, `ハザードマップ`.
   - **Action**: Outputs all 12 thematic dataset cards for the municipality.

2. **建築物 (Building / Facility / Physical Structures)**:
   - **Scope**: Concrete physical facilities and structures (本庁舎, 消防署, 避難所, 病院, 学校, 個別ビル).
   - **Query Keywords**: `建築物`, `建物`, `施設`, `役所`, `避難所`, `学校`, `ビル`.
   - **Action**: Outputs Top 5 nearest building cards with names and LOD specifications.

3. **住所 (Address / Administrative GADM Levels 1〜3)**:
   - **Scope**: Standard Japanese administrative hierarchy:
     - **LEVEL 1**: 都道府県 (Prefecture, e.g. 埼玉県, 東京都) → JIS Master
     - **LEVEL 1 + 2**: 市区町村 (Municipality, e.g. 埼玉県さいたま市浦和区) → JIS Master
     - **LEVEL 1 + 2 + 3**: 住所・町丁目 (Full Town/Chome Address, e.g. 埼玉県さいたま市浦和区常盤) → MLIT Coverage
   - **Query Keywords**: `住所`, `エリア`, `町名`, `丁目`, `大字`, `どこまで`.
   - **Action**: Outputs covered town/chome area listings.

---

## MCP Toolset & Sample Query Reference (全18ツールのプロンプト例)

The agent integrates all 18 tools provided by `mlit-dpf-mcp` across 3 primary categories. Below are standard query templates for interactive testing:

### Category A. Search & Discovery (検索系 - 地図＋一覧カード表示)

| # | MCP Tool | Standard Query (Japanese) | Standard Query (English) | Expected Behavior |
| :-: | :--- | :--- | :--- | :--- |
| 1 | `search` | `さいたま市浦和区の建築物` | *"Buildings in Urawa-ku, Saitama City"* | Keyword lookup for multiple concrete buildings |
| 2 | `search_by_location_point_distance` | `さいたま市役所から500m以内にある建築物` | *"Buildings within 500m of Saitama City Hall"* | Radius proximity search (Top 5 nearest buildings) |
| 3 | `search_by_location_rectangle` | `緯度35.85〜35.87、経度139.64〜139.66の範囲にある建築物` | *"Buildings in bounding box lat 35.85-35.87, lon 139.64-139.66"* | Bounding box spatial search |
| 4 | `search_by_attribute` | `さいたま市（自治体コード: 11100）の建築物データセット` | *"Building datasets for Saitama City (Code: 11100)"* | Exact attribute filter by municipality/dataset |

### Category B. Get & Data Retrieval (詳細・データ取得系 - カード表示)

| # | MCP Tool | Standard Query (Japanese) | Standard Query (English) | Expected Behavior |
| :-: | :--- | :--- | :--- | :--- |
| 5 | `get_data` | `さいたま市役所をさらに詳しく` | *"More details on Saitama City Hall"* | 100% full attribute specifications & 3D links |
| 6 | `get_data_summary` | `さいたま市役所の概要` | *"Overview of Saitama City Hall"* | Lightweight title and record summary |
| 7 | `get_data_catalog` | `Project PLATEAU（mlit_plateau）カタログをさらに詳しく` | *"More details on Project PLATEAU (mlit_plateau) catalog"* | Schema, covered cities, and thematic datasets |
| 8 | `get_data_catalog_summary` | `利用可能なカタログ一覧` | *"Available data catalogs"* | Overview listing of all platform catalogs |
| 9 | `get_file_download_urls` | `さいたま市役所の3Dモデルダウンロード` | *"Download 3D model files for Saitama City Hall"* | Direct CityGML / 3D Tiles download URLs |
| 10 | `get_zipfile_download_url` | `さいたま市役所の3Dモデル一括ZIPダウンロード` | *"ZIP download of all 3D model files for Saitama City Hall"* | Bundled ZIP archive download URL |
| 11 | `get_thumbnail_urls` | `さいたま市役所のプレビュー画像` | *"Preview thumbnail images for Saitama City Hall"* | Visual preview thumbnail URLs |
| 12 | `get_all_data` | `さいたま市浦和区の公共施設データ全件` | *"All public facility records in Urawa-ku, Saitama City"* | Bulk batch extraction across region |
| 13 | `get_count_data` | `埼玉県内のPLATEAUデータ件数集計` | *"Count aggregation of PLATEAU data records in Saitama Prefecture"* | Statistical count aggregation |
| 14 | `get_mesh` | `地域メッシュコード533945の都市計画データ` | *"Urban planning mesh data for regional mesh code 533945"* | Regional mesh grid data extraction |

### Category C. Master & Utility (マスター & ユーティリティ系 - カード表示)

| # | MCP Tool | Standard Query (Japanese) | Standard Query (English) | Expected Behavior |
| :-: | :--- | :--- | :--- | :--- |
| 15 | `normalize_codes` | `さいたま市の自治体コード` | *"JIS municipality code for Saitama City"* | Normalizes region names to 5-digit JIS codes |
| 16 | `get_prefecture_data` | `全国の都道府県コード一覧` | *"Master list of all 47 Japanese prefecture codes"* | 47 prefecture codes & names master |
| 17 | `get_municipality_data` | `埼玉県（コード: 11）の市区町村一覧` | *"List of municipalities in Saitama Prefecture (Code: 11)"* | Municipality codes for target prefecture |
| 18 | `get_suggest` | `さいたま` | *"Saitama"* | Autocomplete keyword suggestions & counts |

---

## Interactive A2UI Experience & Benchmark Prompts

The agent delivers agent-driven dynamic UIs using the [A2UI (Agent-to-User Interface)](https://github.com/googlemaps/a2ui) specification, with UI components and catalog schemas adapted from the [A2UI Samples](https://github.com/googlemaps-samples/a2ui) repository.

### 1. Search系（複数対象・範囲検索）

1. **検索 (Search)**
   * 「**＜さいたま市役所、藤沢市役所、京都市役所、舞鶴市役所＞周辺**の**＜建築物、住所＞**」
   * *(English: "Buildings and addresses around <Saitama City Hall, Fujisawa City Hall, Kyoto City Hall, Maizuru City Hall>")*

2. **位置矩形による検索 (Search by Location Rectangle)**
   * ①「**＜さいたま市役所、藤沢市役所、京都市役所、舞鶴市役所＞から＜浦和駅、藤沢駅、京都駅、東舞鶴駅＞にかけてのエリア**の**＜建築物、住所＞**」
   * *(English: "Buildings and addresses in the area spanning from <Saitama City Hall, Fujisawa City Hall, Kyoto City Hall, Maizuru City Hall> to <Urawa Station, Fujisawa Station, Kyoto Station, Higashi-Maizuru Station>")*
   * ②（緯度経度指定時）「**＜さいたま市役所、藤沢市役所、京都市役所、舞鶴市役所＞周辺**の緯度経度範囲＜**北緯35.85〜35.87、東経139.64〜139.66**＞の**＜建築物、住所＞**」
   * *(English: "Buildings and addresses within coordinate bounding box <Lat 35.85-35.87, Lon 139.64-139.66> around <Saitama City Hall, Fujisawa City Hall, Kyoto City Hall, Maizuru City Hall>")*

3. **位置地点と距離による検索 (Search by Location Point Distance)**
   * 「**＜さいたま市役所、藤沢市役所、京都市役所、舞鶴市役所＞周辺**から半径＜**1km以内**＞の**＜建築物、住所＞**」
   * *(English: "Buildings and addresses within <1km radius> around <Saitama City Hall, Fujisawa City Hall, Kyoto City Hall, Maizuru City Hall>")*

4. **属性による検索 (Search by Attribute)**
   * ①「**＜さいたま市浦和区、藤沢市、京都市中京区、舞鶴市＞**の**＜建築物、住所＞**」
   * *(English: "Buildings and addresses in <Urawa Ward (Saitama), Fujisawa City, Nakagyo Ward (Kyoto), Maizuru City>")*
   * ②（施設種別指定時）「**＜さいたま市、藤沢市、京都市、舞鶴市＞**の＜**公共施設（庁舎、学校、避難施設）**＞の**建築物**」
   * *(English: "<Public facilities (city halls, schools, evacuation shelters)> in <Saitama City, Fujisawa City, Kyoto City, Maizuru City>")*

---

### 2. Get系（単一対象・詳細取得）

5. **データ取得 (Get Data)**
   * 「**＜さいたま市役所、藤沢市役所、京都市役所、舞鶴市役所＞**の**＜建築物、住所＞ さらに詳しく**」
   * *(English: "<buildings, addresses> of <Saitama City Hall, Fujisawa City Hall, Kyoto City Hall, Maizuru City Hall> Learn more")*

6. **データサマリー取得 (Get Data Summary)**
   * 「**＜さいたま市役所、藤沢市役所、京都市役所、舞鶴市役所＞**の**＜建築物、住所＞の基本情報 さらに詳しく**」
   * *(English: "Basic information on <buildings, addresses> of <Saitama City Hall, Fujisawa City Hall, Kyoto City Hall, Maizuru City Hall> Learn more")*

7. **データカタログ取得 (Get Data Catalog)**
   * 「**＜さいたま市、藤沢市、京都市、舞鶴市＞**の**データセット（カテゴリー） さらに詳しく**」
   * *(English: "Datasets (categories) of <Saitama City, Fujisawa City, Kyoto City, Maizuru City> Learn more")*

8. **データカタログサマリー取得 (Get Data Catalog Summary)**
   * 「**＜さいたま市、藤沢市、京都市、舞鶴市＞**の**データセット（カテゴリー）のサマリー さらに詳しく**」
   * *(English: "Summary of datasets (categories) of <Saitama City, Fujisawa City, Kyoto City, Maizuru City> Learn more")*

9. **ファイルダウンロードURL取得 (Get File Download URLs)**
   * 「**＜さいたま市役所、藤沢市役所、京都市役所、舞鶴市役所＞**の**＜建築物、住所＞のダウンロードURL さらに詳しく**」
   * *(English: "Download URLs for <buildings, addresses> of <Saitama City Hall, Fujisawa City Hall, Kyoto City Hall, Maizuru City Hall> Learn more")*

10. **ZIPファイルダウンロードURL取得 (Get Zipfile Download URL)**
    * 「**＜さいたま市役所、藤沢市役所、京都市役所、舞鶴市役所＞**の**＜建築物、住所＞のZIPダウンロードURL さらに詳しく**」
    * *(English: "ZIP download URL for <buildings, addresses> of <Saitama City Hall, Fujisawa City Hall, Kyoto City Hall, Maizuru City Hall> Learn more")*

11. **サムネイルURL取得 (Get Thumbnail URLs)**
    * 「**＜さいたま市役所、藤沢市役所、京都市役所、舞鶴市役所＞**の**建築物のサムネイルURL さらに詳しく**」
    * *(English: "Thumbnail URLs for buildings of <Saitama City Hall, Fujisawa City Hall, Kyoto City Hall, Maizuru City Hall> Learn more")*

12. **全データ取得 (Get All Data)**
    * 「**＜さいたま市、藤沢市、京都市、舞鶴市＞**の**＜建築物、住所＞の全件データ さらに詳しく**」
    * *(English: "All data records for <buildings, addresses> of <Saitama City, Fujisawa City, Kyoto City, Maizuru City> Learn more")*

13. **カウントデータ取得 (Get Count Data)**
    * 「**＜さいたま市、藤沢市、京都市、舞鶴市＞**の**＜建築物、住所＞の登録件数 さらに詳しく**」
    * *(English: "Record counts of <buildings, addresses> in <Saitama City, Fujisawa City, Kyoto City, Maizuru City> Learn more")*

14. **サジェスト取得 (Get Suggest)**
    * 「『**＜さいたま市役所、藤沢市役所、京都市役所、舞鶴市役所＞**』の**＜建築物、住所＞のサジェスト候補 さらに詳しく**」
    * *(English: "Search suggestions for <buildings, addresses> of '<Saitama City Hall, Fujisawa City Hall, Kyoto City Hall, Maizuru City Hall>' Learn more")*

15. **都道府県データ取得 (Get Prefecture Data)**
    * 「**＜埼玉県、神奈川県、京都府＞**の**都道府県情報 さらに詳しく**」
    * *(English: "Prefecture information for <Saitama, Kanagawa, Kyoto> Learn more")*

16. **市区町村データ取得 (Get Municipality Data)**
    * 「**＜さいたま市、藤沢市、京都市、舞鶴市＞**の**市区町村情報 さらに詳しく**」
    * *(English: "Municipality information for <Saitama City, Fujisawa City, Kyoto City, Maizuru City> Learn more")*

17. **メッシュ取得 (Get Mesh)**
    * ①「**＜さいたま市役所、藤沢市役所、京都市役所、舞鶴市役所＞がある＜1kmメッシュ（地域区画）＞**の**＜建築物、住所＞ さらに詳しく**」
    * *(English: "<buildings, addresses> in the <1km regional mesh grid> of <Saitama City Hall, Fujisawa City Hall, Kyoto City Hall, Maizuru City Hall> Learn more")*
    * ②（メッシュコード指定時）「地域メッシュコード＜**53394523**＞内の**＜建築物、住所＞ さらに詳しく**」
    * *(English: "<buildings, addresses> within regional mesh code <53394523> Learn more")*

---

### 3. 正規化 (Normalization)

18. **コード正規化 (Normalize Codes)**
    * 「**＜埼玉県さいたま市、神奈川県藤沢市、京都府京都市、京都府舞鶴市＞**の**都道府県名と市区町村名 正規化**」
    * *(English: "Normalize prefecture and municipality names of <Saitama City (Saitama), Fujisawa City (Kanagawa), Kyoto City (Kyoto), Maizuru City (Kyoto)>")*

---

### 4. 統合系（自律エージェント・探索＆深掘り）

* **抽象バージョン (Abstract Baseline)**:
  * 「**＜さいたま市役所、藤沢市役所、京都市役所、舞鶴市役所＞周辺**の**＜データセット、建築物、住所＞ さらに詳しく**」
  * *(English: "<datasets, buildings, addresses> around <Saitama City Hall, Fujisawa City Hall, Kyoto City Hall, Maizuru City Hall> Learn more")*

* **具体バージョン (Concrete Scenario: 洪水データ・避難所・住所)**:
  * 「**＜さいたま市役所、藤沢市役所、京都市役所、舞鶴市役所＞周辺**の**＜洪水データ、避難所、住所＞ さらに詳しく**」
  * *(English: "<flood data, evacuation shelters, addresses> around <Saitama City Hall, Fujisawa City Hall, Kyoto City Hall, Maizuru City Hall> Learn more")*

---

### UI Experience Screenshots

#### 1. 3D Spatial Intelligence with PlateauView & Hazard Overlay (Satellite View)

* **English Query Experience**:
![Deep-Dive Spatial Intelligence (English)](assets/satellite_map.png)

* **Japanese Query Experience**:
![Deep-Dive Spatial Intelligence (Japanese)](assets/satellite_map_jp.png)

#### 2. 3D Spatial Intelligence with PlateauView & Hazard Overlay (Vector Map View)

* **English Query Experience**:
![Vector Map View (English)](assets/white_map.png)

* **Japanese Query Experience**:
![Vector Map View (Japanese)](assets/white_map_jp.png)

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

Update the Cloud Run service with the deployed MCP server URL, set the active skill, and enable public access:

```bash
# Configure MCP Server URL on Cloud Run
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

## Known Limitations & Design Decisions (既知の制約事項と設計判断)

* **PlateauView 3D Localization & URL Deep Linking**:
  * **No Multi-language Support**: The official [PlateauView 3D](https://plateauview.mlit.go.jp/) platform is currently provided in Japanese only. When queries are made in English or other languages, the agent automatically supplies the exact official Japanese address/keyword in parentheses (e.g., `(Search with "埼玉県さいたま市浦和区常盤6-4-4")`) to facilitate 3D model search.
  * **No URL Query Parameters**: Since PlateauView 3D does not currently support direct coordinate parameters via URL query strings, the agent links to the top portal while instructing users with the precise search keyword.

---

> 💡 **Learn more about A2UI:**  
> For the core protocol and Web Components library, visit the [googlemaps/a2ui](https://github.com/googlemaps/a2ui) repository.  
> For reference design patterns and full-stack integration examples, visit [googlemaps-samples/a2ui](https://github.com/googlemaps-samples/a2ui).

---

## License

Apache License 2.0
