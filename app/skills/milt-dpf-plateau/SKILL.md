---
name: mlit-dpf-plateau
description: Specialist skill for Project PLATEAU 3D City Models. Automatically interprets natural language requests (e.g. buildings, cityscapes, flood hazards) without requiring technical terms like "PLATEAU" or "3D", exploring LOD1/LOD2/LOD3 models and urban layers from MLIT DPF to output interactive A2UI surfaces with GSI Map and PlateauView links.
---

# Project PLATEAU 3D City Model Skill

## 1. Language Mandate
1. **English Queries**:
   - Translate English terms internally (e.g., "Saitama City Hall" -> "さいたま市役所", "buildings / cityscape" -> "建築物", "flood hazard" -> "洪水浸水想定区域") when querying MLIT MCP tools.
   - Output all UI labels and `cardText` metadata in English (`Address:`, `Coordinates:`, `Level of Detail (LOD):`, `Format:`, `Category:`, `Year:`, `Dataset:`, `[GSI Map](...)`, `[PlateauView 3D](...)`, `*Source: Project PLATEAU / MLIT Japan*`).
2. **Japanese Queries**:
   - Output Japanese labels in `cardText` (`所在地:`, `座標:`, `詳細度(LOD):`, `データ形式:`, `種別:`, `登録年:`, `データセット:`, `[地理院地図](...)`, `[PlateauView 3D](...)`, `*出典: Project PLATEAU / 国土交通データプラットフォーム*`).

---

## 2. 8 MCP Tool Prompt Catalog (Prompt Templates & Strategies)

The agent strictly routes user queries into Project PLATEAU 3D datasets (`catalog_id="mlit_plateau"` / `catalog_name="3D都市モデル"`), automatically mapping both natural language inquiries and formal templates tailored for the 4 hackathon partner city halls (**Saitama, Fujisawa, Kyoto, Maizuru**):

### 4-Core Exploration Prompt Patterns (Core Navigation)
1. **自治体データセット**: `＜さいたま市、藤沢市、京都市、舞鶴市＞のデータセットをおしえて`  
   *(EN: "Show datasets for `<Saitama / Fujisawa / Kyoto / Maizuru>` City")*
   - *Output*: **All 12 thematic datasets** across the full PlateauView catalog.

2. **周辺データセット**: `＜さいたま市役所、藤沢市役所、京都市役所、舞鶴市役所＞の周辺のデータセット（カテゴリー）を知りたい`  
   *(EN: "Show datasets and categories around `<Saitama / Fujisawa / Kyoto / Maizuru>` City Hall")*
   - *Output*: **All 12 thematic datasets** around the target city hall.

3. **周辺建築物（施設・建築物 - Top 5）**: `＜さいたま市役所、藤沢市役所、京都市役所、舞鶴市役所＞の周辺の建築物を知りたい`  
   *(EN: "Show buildings around `<Saitama / Fujisawa / Kyoto / Maizuru>` City Hall")*
   - *Output*: **Top 5 prominent buildings** (本庁舎, 消防署, 小学校等) ordered by **proximity from City Hall**.

4. **周辺住所（町丁目・カバレッジ）**: `＜さいたま市役所、藤沢市役所、京都市役所、舞鶴市役所＞の周辺の住所を知りたい`  
   *(EN: "Show covered addresses around `<Saitama / Fujisawa / Kyoto / Maizuru>` City Hall")*
   - *Output*: **Town/Chome-level areas (町丁目・大字)** (常盤, 仲町, 高砂等) ordered by proximity.

---

### A. Search Methods (検索系)
1. **`search_by_location_point_distance` (Radius Proximity Search - Top 5 Nearest First)**
   - **Target**: Specific prominent buildings, public facilities, and structures within radius of a point, ordered by proximity.
   - **Proximity Rule**: Display **up to 5 records (Top 5)** ordered by **distance ascending (nearest to origin first)**. Output concrete building/facility names (本庁舎, 消防署, 小学校等) with their LOD1/LOD2 specifications.
   - **Prompt Template (JA)**: `＜さいたま市役所、藤沢市役所、京都市役所、舞鶴市役所＞の周辺の建築物を知りたい`
   - **Prompt Template (EN)**: *"Show buildings around `<Saitama / Fujisawa / Kyoto / Maizuru>` City Hall"*
   - **Parameters**: `location_lat` (float), `location_lon` (float), `location_distance` (integer, e.g. 1000~2000), `term="建築物"`.
   - **When to Use**: "Nearby / Proximity" queries around specific landmarks or natural language requests for buildings/structures.

2. **`search_by_location_rectangle` (Bounding Box Search)**
   - **Target**: Buildings and datasets intersecting a bounding box rectangle or map viewport.
   - **Prompt Template (JA)**: `＜さいたま市役所、藤沢市役所、京都市役所、舞鶴市役所＞周辺のエリア一帯の建築物を探して`
   - **Prompt Template (EN)**: *"Search buildings in area around `<Saitama / Fujisawa / Kyoto / Maizuru>` City Hall"*
   - **Parameters**: `location_rectangle_top_left_lat`, `location_rectangle_top_left_lon`, `location_rectangle_bottom_right_lat`, `location_rectangle_bottom_right_lon`, `term="建築物"`.
   - **When to Use**: Bounding box queries for viewport or rectangular urban zones.

3. **`search_by_attribute` (Municipality & Thematic Attribute Filter)**
   - **Target**: Filter datasets by municipality code and thematic keywords (flood hazard, urban planning, land use).
   - **Parameters**: `catalog_name="3D都市モデル"` (or `catalog_id="mlit_plateau"`), `prefecture_code`, `municipality_code`, `keyword`.
   - **When to Use**: Internal attribute filtering for specific municipality and thematic layers.

4. **`search` (Full-Text & Landmark Lookup)**
   - **Target**: Find landmark coordinates or discover datasets via keyword search.
   - **Prompt Template (JA)**: `＜さいたま市役所、藤沢市役所、京都市役所、舞鶴市役所＞の建築物を探して`
   - **Prompt Template (EN)**: *"Find buildings for `<Saitama / Fujisawa / Kyoto / Maizuru>` City Hall"*
   - **Parameters**: `term="さいたま市役所 建築物"`, `phrase_match=False`.
   - **When to Use**: Landmark coordinate lookup or fallback when attribute search yields no matches.

### B. Data & Catalog Retrieval Methods (詳細・カタログ取得系)
5. **`get_data` (Full Attribute & Specification Detail)**
   - **Target**: Retrieve 100% full attribute specifications, LOD, CRS, and download URLs for a specific record.
   - **Prompt Template (JA)**: `＜さいたま市役所、藤沢市役所、京都市役所、舞鶴市役所＞の建築物についてさらに詳しく`
   - **Prompt Template (EN)**: *"More details on buildings for `<Saitama / Fujisawa / Kyoto / Maizuru>` City Hall"*
   - **Parameters**: `dataset_id`, `data_id`.
   - **When to Use**: Deep detail inquiries regarding building specifications, attributes, and download URLs.

6. **`get_data_summary` (Record Overview Summary)**
   - **Target**: Lightweight retrieval of basic fields (ID, title, coordinates, LOD).
   - **Prompt Template (JA)**: `＜さいたま市役所、藤沢市役所、京都市役所、舞鶴市役所＞の建築物の概要`
   - **Prompt Template (EN)**: *"Overview of buildings for `<Saitama / Fujisawa / Kyoto / Maizuru>` City Hall"*
   - **Parameters**: `dataset_id`, `data_id`.
   - **When to Use**: Quick overview queries.

7. **`get_data_catalog` (Dataset Specification & Municipality Themes - ALL Datasets Display)**
   - **Target**: Retrieve full schema, covered municipalities, or thematic datasets (`bldg`, `tran`, `frn`, `veg`, `luse`, `dem`, `gen`, `fld`, `htd`, `tsu`, `lsld`, `urf`) for a specific municipality.
   - **All Datasets Display Rule**: When inquiries ask for datasets/categories, **display ALL available thematic datasets** across the full PlateauView catalog without omission.
   - **Prompt Template (JA)**:
     - `＜さいたま市、藤沢市、京都市、舞鶴市＞のデータセットをおしえて`
     - `＜さいたま市役所、藤沢市役所、京都市役所、舞鶴市役所＞の周辺のデータセット（カテゴリー）を知りたい`
     - `＜さいたま市役所、藤沢市役所、京都市役所、舞鶴市役所＞の周辺の住所を知りたい`
   - **Prompt Template (EN)**:
     - *"Show datasets for `<Saitama / Fujisawa / Kyoto / Maizuru>` City"*
     - *"Show datasets and categories around `<Saitama / Fujisawa / Kyoto / Maizuru>` City Hall"*
     - *"Show covered addresses around `<Saitama / Fujisawa / Kyoto / Maizuru>` City Hall"*
   - **Parameters**: `catalog_id="mlit_plateau"`, `dataset_id`.
   - **When to Use**: Inquiries regarding municipality-specific thematic datasets or covered address lists.

8. **`get_data_catalog_summary` (All Available Catalogs Listing - Global Scope)**
   - **Target**: Retrieve summary listings of all available catalogs across the entire platform.
   - **Prompt Template (JA)**: `すべてのデータセットをおしえて`
   - **Prompt Template (EN)**: *"Show all datasets"*
   - **Parameters**: None.
   - **When to Use**: Inquiries regarding platform-wide dataset lists without specifying a single municipality.

---

## 3. Tool Selection & Resolution Strategy
- **All Datasets Display Rule (Mandatory for Datasets/Categories)**:
  - When users ask about available datasets or categories (e.g. 「さいたま市のデータセットをおしえて」「さいたま市役所の周辺のデータセットを知りたい」), **output individual cards for ALL available thematic datasets** across the full PlateauView catalog without omitting any layer:
    1. **建築物 (`bldg`)**: 3D building structures (LOD1 / LOD2 / LOD3).
    2. **道路 (`tran`)**: Road network and surface structures.
    3. **都市設備 (`frn`)**: City furniture (streetlights, signals, benches, signs).
    4. **植生 (`veg`)**: Urban vegetation, roadside trees, and park forests.
    5. **土地利用 (`luse`)**: Land use zoning classifications.
    6. **数値地形 (`dem`)**: Digital elevation and terrain mesh.
    7. **汎用都市オブジェクト (`gen`)**: Bridges, monuments, and structures.
    8. **洪水浸水想定区域 (`fld`)**: River flood hazard risk layers.
    9. **内水浸水想定区域 (`htd`)**: Inundation and pluvial flood layers.
    10. **高潮・津波浸水想定区域 (`tsu` / `tnm`)**: Storm surge and tsunami hazard layers.
    11. **土砂災害警戒区域 (`lsld`)**: Landslide disaster risk layers.
    12. **都市計画決定情報 (`urf`)**: Urban planning, zoning, and use districts.
- **Top 5 Nearest Buildings Rule (Mandatory for Nearby Buildings)**:
  - When users ask about nearby buildings (e.g. 「さいたま市役所の周辺の建築物を知りたい」), output **up to 5 specific building cards (Top 5)** ordered by **distance ascending (nearest first)** with concrete facility names (本庁舎, 消防署, 小学校, 公民館等).
- **Chome/Oaza Address Resolution (Mandatory for Nearby Addresses)**:
  - When users ask about nearby addresses (e.g. 「さいたま市役所の周辺の住所を知りたい」), enumerate **detailed town/chome-level areas (町丁目・大字レベル, e.g. 浦和区常盤1〜10丁目, 仲町, 高砂, 北浦和)** rather than just municipality-level names.
- **Natural Language Resolution**: When natural language mentions buildings ("建物", "ビル", "街並み"), hazard risks ("水害", "浸水"), or urban zoning ("用途地域"), automatically translate to the respective thematic keywords.
- **Landmark Geocoding**: For landmark/station queries (e.g. 「新宿駅周辺」), resolve coordinates and execute `search_by_location_point_distance(term="建築物")`.
- **Municipality Scoping**: For city-level queries (e.g. 「さいたま市」), execute `search_by_attribute(catalog_name="3D都市モデル", keyword="建築物")`.

---

## 4. Execution & Efficiency Policy
- **Fast Mode for Lists**: When a search method returns a list, do NOT call `get_data` in individual loops. Generate the A2UI output directly from the search result list.
- **Single-Step & No Loops**: Do not retry in loops with mutated keywords if 0 records are found. State clearly that no official records were found.

---

## 5. A2UI Output & Card Formatting Rules
- **Pure A2UI Output**: Output ONLY the single `<a2ui-json>[ createSurface, updateComponents, updateDataModel ]</a2ui-json>` block. Never output conversational text or summaries outside the JSON.
- **Surface & Catalog**: Always use `surfaceId: "mlit-search-surface"` and `catalogId: "a2ui://maps-agentic-ui-catalog.json"`.
- **Standard Component Architecture**:
  - `root`: `Column` with children `["map", "list"]` (or `["map", "detail-card"]` for single facility/model).
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
  - For single model/facility (`get_data`): `updateDataModel` with `path: "/"`, `value: { "cardText": "...", "lat": ..., "lng": ... }` (bound to `/cardText`).
- **Unified `cardText` & 100% Attribute Display**:
  - Always start with bold title `**<Model / Facility Name>**`.
  - Display **100% of ALL key-value items and attributes** returned by the API without omitting or summarizing any fields.
  - Translate raw API keys using the **Glossary Table** below based on the query language.
- **Fixed Map Links**:
  - For Japanese queries (List & Details):
    ```markdown
    [地理院地図](https://maps.gsi.go.jp/?marker=<lat>,<lng>)
    [PlateauView 3D](https://plateauview.mlit.go.jp/)
    *出典: Project PLATEAU / 国土交通データプラットフォーム*
    ```
  - For English queries (List & Details):
    ```markdown
    [GSI Map](https://maps.gsi.go.jp/?marker=<lat>,<lng>)
    [PlateauView 3D](https://plateauview.mlit.go.jp/)
    *Source: Project PLATEAU / MLIT Japan*
    ```
  - For catalog metadata (`get_data_catalog*`):
    ```markdown
    *出典: Project PLATEAU / 国土交通データプラットフォーム*
    ```
- **NO Emojis**: Never use emoji icons in UI or cards.
- **Double Newlines**: Separate each line in `cardText` with `\n\n`.

---

## 6. Field Name Translation Glossary (PLATEAU & DPF)

| Raw API Key | 日本語ラベル (Japanese) | English Label |
| :--- | :--- | :--- |
| `id`, `DPF:id` | **データID** | Data ID |
| `title`, `DPF:title`, `NLNI:meishou` | **名称 / モデル名** | Title / Model Name |
| `lat`, `DPF:latitude` | **緯度** | Latitude |
| `lon`, `DPF:longitude` | **経度** | Longitude |
| `year`, `DPF:year` | **整備年度 / 登録年** | Fiscal Year |
| `dataset_id`, `DPF:dataset_id` | **データセットID** | Dataset ID |
| `catalog_id`, `DPF:catalog_id` | **カタログID** | Catalog ID |
| `prefecture_code`, `DPF:prefecture_code` | **都道府県コード** | Prefecture Code |
| `city_code`, `DPF:municipality_code` | **市区町村コード** | Municipality Code |
| `DPF:prefecture_name` | **都道府県** | Prefecture |
| `DPF:municipality_name` | **市区町村** | Municipality |
| `NLNI:shozaichi`, `address` | **所在地** | Address |
| `lod`, `DPF:lod` | **詳細度 (LOD)** | Level of Detail (LOD) |
| `format`, `DPF:format` | **データ形式** | Data Format |
| `NLNI:crs` | **座標参照系** | Spatial Reference (CRS) |
| `DPF:dataURLs` | **仕様書URL** | Documentation URL |
| `DPF:downloadURLs` | **ダウンロードURL** | Download URL |
| `DPF:last_update_datetime` | **最終更新日時** | Last Updated |
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
| `record_count` | **総レコード件数** | Total Record Count |

---

## 7. Canonical A2UI Output Example

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
              "lat": 35.8616,
              "lng": 139.6454,
              "label": "さいたま市 建築物モデル（LOD2）"
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
            "cardText": "**さいたま市 建築物モデル（LOD2）**\n\nデータID: 11100_bldg_lod2_2023\n\n名称: さいたま市 建築物モデル（LOD2）\n\n緯度: 35.8616\n\n経度: 139.6454\n\n整備年度: 2023\n\n詳細度(LOD): LOD2\n\nデータ形式: 3D Tiles / CityGML\n\nデータセットID: mlit_plateau_11100\n\nカタログID: mlit_plateau\n\n都道府県コード: 11\n\n市区町村コード: 11100\n\n都道府県: 埼玉県\n\n市区町村: さいたま市\n\n[地理院地図](https://maps.gsi.go.jp/?marker=35.8616,139.6454)\n\n[PlateauView 3D](https://plateauview.mlit.go.jp/)\n\n*出典: Project PLATEAU / 国土交通データプラットフォーム*",
            "lat": 35.8616,
            "lng": 139.6454
          }
        ]
      }
    }
  }
]
</a2ui-json>
```