---
name: mlit-dpf
description: Specialist skill for retrieving Japanese public open data and geospatial facilities from the MLIT (Ministry of Land, Infrastructure, Transport and Tourism) Data Platform and formatting interactive A2UI outputs.
---

# MLIT DPF Geospatial Skill

## Language Mandate
1. **English Queries**:
   - Translate English terms internally (e.g. "Saitama City Hall" -> "さいたま市役所", "evacuation shelter" -> "避難場所") when querying MLIT MCP tools.
   - Output all UI labels and `cardText` metadata in English (`Address:`, `Coordinates:`, `Category:`, `Year:`, `Dataset:`, `[GSI Map](...)`, `[PlateauView 3D](...) (Search with "<Address>")`, `*Source: National Land Numerical Information (MLIT Japan)*`).
2. **Japanese Queries**:
   - Output Japanese labels in `cardText` (`所在地:`, `座標:`, `種別:`, `登録年:`, `データセット:`, `[地理院地図](...)`, `[PlateauView 3D](...)（「<住所>」で検索）`, `*出典: 国土数値情報（国土交通省）*`).

---

## 2. 8 MCP Tool Prompt Catalog (Prompt Templates & Strategies)

The agent strictly routes user queries into corresponding MLIT DPF MCP tools using standardized prompt templates tailored for the 4 hackathon partner city halls (**Saitama, Fujisawa, Kyoto, Maizuru**):

### 4-Core Exploration Prompt Patterns (Core Navigation)
1. **自治体データセット**: `＜さいたま市、藤沢市、京都市、舞鶴市＞のデータセットをおしえて`  
   *(EN: "Show datasets for `<Saitama / Fujisawa / Kyoto / Maizuru>` City")*
   - *Output*: **All available thematic layers** (公共施設, 避難所, 医療施設, 学校等).

2. **周辺データセット**: `＜さいたま市役所、藤沢市役所、京都市役所、舞鶴市役所＞の周辺のデータセット（カテゴリー）を知りたい`  
   *(EN: "Show datasets and categories around `<Saitama / Fujisawa / Kyoto / Maizuru>` City Hall")*
   - *Output*: **All available thematic layers** around the target city hall.

3. **周辺建築物（公共施設・構造物 - Top 5）**: `＜さいたま市役所、藤沢市役所、京都市役所、舞鶴市役所＞の周辺の建築物を知りたい`  
   *(EN: "Show buildings and facilities around `<Saitama / Fujisawa / Kyoto / Maizuru>` City Hall")*
   - *Output*: **Top 5 specific facilities** (本庁舎, 消防署, 小学校等) ordered by **proximity from City Hall**.

4. **周辺住所（町丁目・カバレッジ）**: `＜さいたま市役所、藤沢市役所、京都市役所、舞鶴市役所＞の周辺の住所を知りたい`  
   *(EN: "Show covered addresses around `<Saitama / Fujisawa / Kyoto / Maizuru>` City Hall")*
   - *Output*: **Town/Chome-level areas (町丁目・大字)** (常盤, 仲町, 高砂等) ordered by proximity.

---

### A. Search Methods (検索系)
1. **`search_by_location_point_distance` (Radius Proximity Search)**
   - **Target**: Public facilities, evacuation shelters, and geospatial assets within radius of a point.
   - **Prompt Template (JA)**: `＜さいたま市役所、藤沢市役所、京都市役所、舞鶴市役所＞の周辺の避難所を教えて` / `[地名/駅]近くの公共施設`
   - **Prompt Template (EN)**: *"Show evacuation shelters near `<Saitama / Fujisawa / Kyoto / Maizuru>` City Hall"* / *"Public facilities near [Location]"*
   - **Parameters**: `location_lat` (float), `location_lon` (float), `location_distance` (integer, e.g. 1000~2000), `term` (e.g. "避難場所", "小学校", "病院").
   - **When to Use**: "Nearby / Proximity" queries (e.g. 「〇〇の周辺」「〇〇の近く」「〇〇付近」).

2. **`search_by_location_rectangle` (Bounding Box Search)**
   - **Target**: Public facilities and regional features intersecting a bounding box rectangle.
   - **Prompt Template (JA)**: `＜さいたま市役所、藤沢市役所、京都市役所、舞鶴市役所＞周辺の矩形エリア内の公共施設を検索して`
   - **Prompt Template (EN)**: *"Search public facilities in bounding box around `<Saitama / Fujisawa / Kyoto / Maizuru>` City Hall"*
   - **Parameters**: `location_rectangle_top_left_lat`, `location_rectangle_top_left_lon`, `location_rectangle_bottom_right_lat`, `location_rectangle_bottom_right_lon`, `term`.
   - **When to Use**: Bounding box queries for map viewport areas or rectangular regional zones.

3. **`search_by_attribute` (Municipality & Attribute Filter)**
   - **Target**: Filter datasets by administrative code, municipality name, or metadata attributes.
   - **Parameters**: `dataset_id` (e.g. `nlni_ksj-p20`), `prefecture_code`, `city_code`, `keyword`.
   - **When to Use**: Internal attribute filtering for specific municipality and administrative datasets.

4. **`search` (Full-Text & Landmark Lookup)**
   - **Target**: Find landmark coordinates or discover dataset records via keywords.
   - **Prompt Template (JA)**: `＜さいたま市役所、藤沢市役所、京都市役所、舞鶴市役所＞を探して`
   - **Prompt Template (EN)**: *"Find `<Saitama / Fujisawa / Kyoto / Maizuru>` City Hall"*
   - **Parameters**: `term` (e.g. "さいたま市役所", "京都市役所", `phrase_match=False`).
   - **When to Use**: Landmark geocoding and name resolution.

### B. Data & Catalog Retrieval Methods (詳細・カタログ取得系)
5. **`get_data` (Full Attribute Specification)**
   - **Target**: Retrieve 100% full attribute specifications for a specific record.
   - **Prompt Template (JA)**: `＜さいたま市役所、藤沢市役所、京都市役所、舞鶴市役所＞についてさらに詳しく`
   - **Prompt Template (EN)**: *"More details on `<Saitama / Fujisawa / Kyoto / Maizuru>` City Hall"*
   - **Parameters**: `dataset_id`, `data_id`.
   - **When to Use**: Deep detail inquiries regarding a single facility or dataset record.

6. **`get_data_summary` (Record Overview Summary)**
   - **Target**: Lightweight retrieval of basic fields (ID, title, coordinates).
   - **Prompt Template (JA)**: `＜さいたま市役所、藤沢市役所、京都市役所、舞鶴市役所＞の概要`
   - **Prompt Template (EN)**: *"Overview of `<Saitama / Fujisawa / Kyoto / Maizuru>` City Hall"*
   - **Parameters**: `dataset_id`, `data_id`.
   - **When to Use**: Quick overview queries.

7. **`get_data_catalog` (Dataset Specification & Municipality Datasets)**
   - **Target**: Retrieve detailed schema, covered municipalities, and definitions of a catalog for a specific municipality.
   - **Prompt Template (JA)**:
     - `＜さいたま市、藤沢市、京都市、舞鶴市＞のデータセットをおしえて`
     - `＜さいたま市役所、藤沢市役所、京都市役所、舞鶴市役所＞の周辺のデータセット（カテゴリー）を知りたい`
     - `＜さいたま市役所、藤沢市役所、京都市役所、舞鶴市役所＞の周辺の住所を知りたい`
   - **Prompt Template (EN)**:
     - *"Show datasets for `<Saitama / Fujisawa / Kyoto / Maizuru>` City"*
     - *"Show datasets around `<Saitama / Fujisawa / Kyoto / Maizuru>` City Hall"*
     - *"Show covered addresses around `<Saitama / Fujisawa / Kyoto / Maizuru>` City Hall"*
   - **Parameters**: `catalog_id` (e.g. `nlni_ksj`, `mlit_plateau`), `dataset_id`.
   - **When to Use**: Inquiries regarding catalog/dataset definitions and covered area lists.

8. **`get_data_catalog_summary` (All Available Catalogs Listing - Global Scope)**
   - **Target**: Retrieve summary listings of available national data catalogs across the platform.
   - **Prompt Template (JA)**:
     - `すべてのデータセットをおしえて`
     - `利用可能なデータカタログ一覧を見せて`
     - `どんなデータセットが公開されている？`
   - **Prompt Template (EN)**:
     - *"Show all datasets"*
     - *"Show all available national data catalogs"*
     - *"What datasets are available?"*
   - **Parameters**: None.
   - **When to Use**: Inquiries regarding available dataset lists and system-wide coverage.

---

## 3. Tool Selection & Resolution Strategy
- **All Models Display Rule (Mandatory for Datasets/Categories)**:
  - When inquiries ask for datasets/categories, output individual cards for all available thematic layers without omitting any layer.
- **Top 5 Nearest Records Rule (Mandatory for Nearby Facilities/Buildings)**:
  - When users ask about nearby facilities or buildings (e.g. 「さいたま市役所の周辺の建築物を知りたい」), output **up to 5 specific facility cards (Top 5)** ordered by **distance ascending (nearest to origin first)**.
- **Chome/Oaza Address Resolution (Mandatory for Nearby Addresses)**:
  - When users ask about nearby addresses, enumerate detailed town/chome-level areas (町丁目・大字レベル, e.g. 浦和区常盤, 仲町, 高砂) rather than just broad municipality names.
- **Multi-Location Rule**: If multiple origins are given (e.g. 「さいたま市役所と舞鶴市役所の近く」), execute search tools once per origin.

---

## 4. Execution & Efficiency Policy
- **Fast Mode for Lists**: When a search method returns a list, do NOT call `get_data` in individual loops. Generate the A2UI output directly from the search result list.
- **Single-Step & No Loops**: Do not retry in loops with mutated keywords if 0 records are found. State clearly that no official records were found.

---

## 5. A2UI Output & Card Formatting Rules
- **Pure A2UI Output**: Output ONLY the single `<a2ui-json>[ createSurface, updateComponents, updateDataModel ]</a2ui-json>` block. Never output conversational text or summaries outside the JSON.
- **Surface & Catalog**: Always use `surfaceId: "mlit-search-surface"` and `catalogId: "a2ui://maps-agentic-ui-catalog.json"`.
- **Standard Component Architecture**:
  - `root`: `Column` with children `["map", "list"]` (or `["map", "detail-card"]` for single facility).
  - `map`: `GoogleMap` (renders GSI 2D Map on client) with:
    - `center`: `{ "lat": <Center Lat>, "lng": <Center Lng> }`
    - `zoom`: `15`
    - `anchorMarker`: `{ "lat": <Origin Lat>, "lng": <Origin Lng>, "label": "<Origin Name>" }` (if origin exists)
    - `markers`: `[ { "lat": <Lat>, "lng": <Lng>, "label": "<Name>" }, ... ]`
  - `list`: `List` with `direction: "vertical"`, `children: { "componentId": "place-card", "path": "/places" }`
  - `place-card`: `Card` with `child: "card-content"`
  - `card-content`: `Text` with `variant: "body"`, `text: { "path": "cardText" }`
- **Data Model Binding**:
  - For lists: `updateDataModel` with `path: "/"`, `value: { "places": [ { "cardText": "...", "lat": ..., "lng": ... } ] }`.
  - For single facility (`get_data`): `updateDataModel` with `path: "/"`, `value: { "cardText": "...", "lat": ..., "lng": ... }` (bound to `/cardText`).
- **Unified `cardText` & 100% Attribute Display**:
  - Always start with bold title `**<Facility Name / Record Title>**`.
  - Display **100% of ALL key-value items and attributes** returned by the API without omitting or summarizing any fields.
  - Translate raw API keys into human-friendly labels using the **Glossary Table** below based on the query language (Japanese for Japanese queries, English for English queries).

## Field Name Translation Glossary (8 API Methods)

| Raw API Key | 日本語ラベル (Japanese) | English Label |
| :--- | :--- | :--- |
| `id`, `DPF:id` | **データID** | Data ID |
| `title`, `DPF:title`, `NLNI:meishou` | **施設名 / 名称** | Facility Name / Title |
| `lat`, `DPF:latitude` | **緯度** | Latitude |
| `lon`, `DPF:longitude` | **経度** | Longitude |
| `year`, `DPF:year` | **登録年 / 年度** | Year |
| `dataset_id`, `DPF:dataset_id` | **データセットID** | Dataset ID |
| `catalog_id`, `DPF:catalog_id` | **カタログID** | Catalog ID |
| `prefecture_code`, `DPF:prefecture_code` | **都道府県コード** | Prefecture Code |
| `city_code`, `DPF:municipality_code` | **市区町村コード** | Municipality Code |
| `DPF:prefecture_name` | **都道府県** | Prefecture |
| `DPF:municipality_name` | **市区町村** | Municipality |
| `NLNI:shozaichi`, `address` | **所在地** | Address |
| `NLNI:kanrisha_code` | **管理者区分** | Administrator Code |
| `NLNI:gyousei_kuiki_code` | **行政区域コード** | Administrative District Code |
| `NLNI:koukyou_shisetsu_daibunrui` | **施設大分類** | Facility Major Category |
| `NLNI:koukyou_shisetsu_shoubunrui` | **施設小分類** | Facility Minor Category |
| `NLNI:genten_shiryou_mei` | **原典資料名** | Source Material Name |
| `NLNI:crs` | **座標参照系** | Spatial Reference (CRS) |
| `NLNI:shitei_hinan_basho_shubetsu` | **避難施設種別** | Shelter Facility Type |
| `NLNI:taiou_saigai_shubetsu` | **対応災害種別** | Applicable Disaster Types |
| `DPF:dataURLs` | **仕様書URL** | Documentation URL |
| `DPF:downloadURLs` | **ダウンロードURL** | Download URL |
| `DPF:last_update_datetime` | **最終更新日時** | Last Updated |
| `DPF:dpf_update_date` | **DPF更新日** | DPF Update Date |
| `DPF:theme` | **テーマ分類** | Theme |
| `DPF:dataset_keywords` | **キーワード** | Keywords |
| `DPF:catalog_title` | **カタログ名** | Catalog Title |
| `DPF:dataset_title` | **データセット名** | Dataset Title |
| `description` | **概要説明** | Description |
| `publisher` | **提供機関 / 発行者** | Publisher |
| `modified` | **更新日** | Modified Date |
| `datasets` | **収録データセット一覧** | Datasets List |
| `license` | **利用規約・ライセンス** | License |
| `spatial` | **対象空間範囲** | Spatial Coverage |
| `temporal` | **対象期間** | Temporal Coverage |
| `record_count` | **総レコード件数** | Total Record Count |

- **Fixed Map Links**:
  - For list searches (`search_*`, `get_data_summary`):
    ```markdown
    [地理院地図](https://maps.gsi.go.jp/?marker=<lat>,<lng>)
    [PlateauView 3D](https://plateauview.mlit.go.jp/)
    *出典: 国土数値情報（国土交通省）*
    ```
  - For single facility details (`get_data` with address):
    ```markdown
    [地理院地図](https://maps.gsi.go.jp/?marker=<lat>,<lng>)
    [PlateauView 3D](https://plateauview.mlit.go.jp/)（「<完全な所在地>」で検索）
    *出典: 国土数値情報（国土交通省）*
    ```
  - For English queries:
    ```markdown
    [GSI Map](https://maps.gsi.go.jp/?marker=<lat>,<lng>)
    [PlateauView 3D](https://plateauview.mlit.go.jp/)
    *Source: National Land Numerical Information (MLIT Japan)*
    ```
  - For catalog metadata (`get_data_catalog*`):
    ```markdown
    *出典: 国土交通データプラットフォーム*
    ```
- **NO Emojis**: Never use emoji icons in UI or cards.
- **Double Newlines**: Separate each line in `cardText` with `\n\n`.

---

## Canonical A2UI Output Example

```json
<a2ui-json>
[
  {
    "version": "v0.9",
    "createSurface": {
      "surfaceId": "mlit-search-surface",
      "catalogId": "a2ui://maps-agentic-ui-catalog.json"
    }
  },
  {
    "version": "v0.9",
    "updateComponents": {
      "surfaceId": "mlit-search-surface",
      "components": [
        {
          "id": "root",
          "component": "Column",
          "children": ["map", "list"]
        },
        {
          "id": "map",
          "component": "GoogleMap",
          "center": {
            "lat": 35.8616,
            "lng": 139.6454
          },
          "zoom": 15,
          "anchorMarker": {
            "lat": 35.8616,
            "lng": 139.6454,
            "label": "さいたま市役所"
          },
          "markers": [
            {
              "lat": 35.86136,
              "lng": 139.649857,
              "label": "仲町公民館"
            }
          ]
        },
        {
          "id": "list",
          "component": "List",
          "direction": "vertical",
          "children": {
            "componentId": "place-card",
            "path": "/places"
          }
        },
        {
          "id": "place-card",
          "component": "Card",
          "child": "card-content"
        },
        {
          "id": "card-content",
          "component": "Text",
          "variant": "body",
          "text": { "path": "cardText" }
        }
      ]
    }
  },
  {
    "version": "v0.9",
    "updateDataModel": {
      "surfaceId": "mlit-search-surface",
      "path": "/",
      "value": {
        "places": [
          {
            "cardText": "**仲町公民館**\n\nデータID: 11108_p20_00012\n\n施設名: 仲町公民館\n\n緯度: 35.86136\n\n経度: 139.649857\n\n登録年: 2020\n\nデータセットID: nlni_ksj-p20\n\nカタログID: nlni_ksj\n\n都道府県コード: 11\n\n市区町村コード: 11108\n\n[地理院地図](https://maps.gsi.go.jp/?marker=35.86136,139.649857)\n\n[PlateauView 3D](https://plateauview.mlit.go.jp/)\n\n*出典: 国土数値情報（国土交通省）*",
            "lat": 35.86136,
            "lng": 139.649857
          }
        ]
      }
    }
  }
]
</a2ui-json>
```
