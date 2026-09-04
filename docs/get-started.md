# 「PLATEAU に相談」を使ってみる

PLATEAU に相談では、国土交通データプラットフォーム（MLIT DPF）のPLATEAUの地理空間データを自然言語で検索、分析、可視化できます。

## エージェントの起動とチャット インターフェースの有効化

PLATEAUの対話機能をテストするには、次の操作を行います。

1. パソコンで、ウェブブラウザで PLATEAU VIEW を開きます。URLは非公開です。

2.  [Ask PLATEAU] をクリックして、チャット インターフェースを有効にします。メニューバーの [New Chat] をクリックして、チャットを開始します。

3. プロンプトを入力します。

4. 回答カードの **[PlateauView] の横にあるキーワード** をコピーし、PLATEAU VIEW の検索ボックスに入力すると、種別に応じて3Dデータが表示・重畳されます。
   - **データセット カード**: 洪水浸水想定や建築物モデルなどのデータレイヤーを3Dマップ上に重畳（例: `洪水浸水想定区域モデル 埼玉県 さいたま市`）
   - **建築物 カード**: 該当施設へ3Dカメラがジャンプし、LOD2詳細建築物を表示（例: `埼玉県さいたま市浦和区常盤`）
   - **住所 カード**: 対象の町丁目エリアへ移動し、周辺街区の3D都市空間を表示（例: `埼玉県さいたま市浦和区高砂`）

5. （オプション）作成したカスタム3Dマップは、PLATEAU VIEW の共有機能でURLを発行して公開・シェアできます。


## 地理空間データセットを分析する

PLATEAUに相談すると、地理空間データセットを探索・分析できます。空間的な関係や条件に基づいて、または指定した地域・フィーチャーのコンテキスト内でプロンプトを送信できます。

### 1. Search & Discovery (複数対象・範囲検索)

1. **Search (検索)**
   - 「**＜さいたま市役所、藤沢市役所、京都市役所、舞鶴市役所＞周辺**の**＜建築物、住所＞**」
   - *(English: "Buildings and addresses around <Saitama City Hall, Fujisawa City Hall, Kyoto City Hall, Maizuru City Hall>")*

2. **Search by Location Rectangle (位置矩形による検索)**
   - ①「**＜さいたま市役所、藤沢市役所、京都市役所、舞鶴市役所＞から＜浦和駅、藤沢駅、京都駅、東舞鶴駅＞にかけてのエリア**の**＜建築物、住所＞**」
     *(English: "Buildings and addresses in the area spanning from <City Hall> to <Station>")*
   - ②「**＜さいたま市役所、藤沢市役所、京都市役所、舞鶴市役所＞周辺**の緯度経度範囲＜**北緯35.85〜35.87、東経139.64〜139.66**＞の**＜建築物、住所＞**」
     *(English: "Buildings and addresses within coordinate bounding box <Lat 35.85-35.87, Lon 139.64-139.66> around <City Hall>")*

3. **Search by Location Point Distance (位置地点と距離による検索)**
   - 「**＜さいたま市役所、藤沢市役所、京都市役所、舞鶴市役所＞周辺**から半径＜**1km以内**＞の**＜建築物、住所＞**」
   - *(English: "Buildings and addresses within <1km radius> around <City Hall>")*

4. **Search by Attribute (属性による検索)**
   - ①「**＜さいたま市浦和区、藤沢市、京都市中京区、舞鶴市＞**の**＜建築物、住所＞**」
     *(English: "Buildings and addresses in <Urawa Ward, Fujisawa City, Nakagyo Ward, Maizuru City>")*
   - ②「**＜さいたま市、藤沢市、京都市、舞鶴市＞**の＜**公共施設（庁舎、学校、避難施設）**＞の**建築物**」
     *(English: "Public facilities (city halls, schools, evacuation shelters) in <City>")*

### 2. Get & Data Retrieval (詳細・データ取得系)

5. **Get Data (データ取得)**
   - 「**＜さいたま市役所、藤沢市役所、京都市役所、舞鶴市役所＞**の**＜建築物、住所＞ さらに詳しく**」
   - *(English: "<buildings, addresses> of <City Hall> Learn more")*

6. **Get Data Summary (データサマリー取得)**
   - 「**＜さいたま市役所、藤沢市役所、京都市役所、舞鶴市役所＞**の**＜建築物、住所＞の基本情報 さらに詳しく**」
   - *(English: "Basic information on <buildings, addresses> of <City Hall> Learn more")*

7. **Get Data Catalog (データカタログ取得)**
   - 「**＜さいたま市、藤沢市、京都市、舞鶴市＞**の**データセット（カテゴリー） さらに詳しく**」
   - *(English: "Datasets (categories) of <City> Learn more")*

8. **Get Data Catalog Summary (データカタログサマリー取得)**
   - 「**＜さいたま市、藤沢市、京都市、舞鶴市＞**の**データセット（カテゴリー）のサマリー さらに詳しく**」
   - *(English: "Summary of datasets (categories) of <City> Learn more")*

9. **Get File Download URLs (ファイルダウンロードURL取得)**
   - 「**＜さいたま市役所、藤沢市役所、京都市役所、舞鶴市役所＞**の**＜建築物、住所＞のダウンロードURL さらに詳しく**」
   - *(English: "Download URLs for <buildings, addresses> of <City Hall> Learn more")*

10. **Get Zipfile Download URL (ZIPファイルダウンロードURL取得)**
    - 「**＜さいたま市役所、藤沢市役所、京都市役所、舞鶴市役所＞**の**＜建築物、住所＞のZIPダウンロードURL さらに詳しく**」
    - *(English: "ZIP download URL for <buildings, addresses> of <City Hall> Learn more")*

11. **Get Thumbnail URLs (サムネイルURL取得)**
    - 「**＜さいたま市役所、藤沢市役所、京都市役所、舞鶴市役所＞**の**建築物のサムネイルURL さらに詳しく**」
    - *(English: "Thumbnail URLs for buildings of <City Hall> Learn more")*

12. **Get All Data (全データ取得)**
    - 「**＜さいたま市、藤沢市、京都市、舞鶴市＞**の**＜建築物、住所＞の全件データ さらに詳しく**」
    - *(English: "All data records for <buildings, addresses> of <City> Learn more")*

13. **Get Count Data (カウントデータ取得)**
    - 「**＜さいたま市、藤沢市、京都市、舞鶴市＞**の**＜建築物、住所＞の登録件数 さらに詳しく**」
    - *(English: "Record counts of <buildings, addresses> in <City> Learn more")*

14. **Get Suggest (サジェスト取得)**
    - 「『**＜さいたま市役所、藤沢市役所、京都市役所、舞鶴市役所＞**』の**＜建築物、住所＞のサジェスト候補 さらに詳しく**」
    - *(English: "Search suggestions for <buildings, addresses> of '<City Hall>' Learn more")*

15. **Get Prefecture Data (都道府県データ取得)**
    - 「**＜埼玉県、神奈川県、京都府＞**の**都道府県情報 さらに詳しく**」
    - *(English: "Prefecture information for <Saitama, Kanagawa, Kyoto> Learn more")*

16. **Get Municipality Data (市区町村データ取得)**
    - 「**＜さいたま市、藤沢市、京都市、舞鶴市＞**の**市区町村情報 さらに詳しく**」
    - *(English: "Municipality information for <Saitama City, Fujisawa City, Kyoto City, Maizuru City> Learn more")*

17. **Get Mesh (メッシュ取得)**
    - ①「**＜さいたま市役所、藤沢市役所、京都市役所、舞鶴市役所＞がある＜1kmメッシュ（地域区画）＞**の**＜建築物、住所＞ さらに詳しく**」
      *(English: "Buildings and addresses in the <1km regional mesh grid> of <City Hall> Learn more")*
    - ②「地域メッシュコード＜**53394523**＞内の**＜建築物、住所＞ さらに詳しく**」
      *(English: "<buildings, addresses> within regional mesh code <53394523> Learn more")*

18. **Normalize Codes (コード正規化)**
    - 「**＜埼玉県さいたま市、神奈川県藤沢市、京都府京都市、京都府舞鶴市＞**の**都道府県名と市区町村名 正規化**」
    - *(English: "Normalize prefecture and municipality names of <Saitama City, Fujisawa City, Kyoto City, Maizuru City>")*

### 3. Integrated Autonomous Exploration (統合系 - 探索＆深掘り)

19. **Integrated Autonomous Exploration (統合自律探索)**:
  - 「**＜さいたま市役所、藤沢市役所、京都市役所、舞鶴市役所＞周辺**の**＜洪水浸水想定、避難所、住所＞ をさらに詳しく**」
  - *(English: "<flood inundation scenarios, evacuation shelters, addresses> around <Saitama City Hall, Fujisawa City Hall, Kyoto City Hall, Maizuru City Hall> Learn more")*
---

## UI 体験と自律エージェントの実行例

### 1. PlateauView 3D 空間インテリジェンスとハザード重畳表示（衛星マップ表示）

#### 🌐 英語プロンプト実行例

> **ユーザープロンプト**:
> `flood inundation scenarios, evacuation shelters, addresses around Saitama City Hall Learn more`
>
> **エージェント応答 ＆ A2UI サーフェス**:
> * **Flood Inundation Scenario Model (2022 Implementation)**
>   * Dataset: Flood Inundation Scenario Model (2022 Implementation)
>   * Address: Saitama City, Saitama Prefecture
>   * [[PlateauView]](https://plateauview.mlit.go.jp/) `洪水浸水想定区域モデル 埼玉県 さいたま市`
>   * *Source: MLIT Data Platform*
> * **3D Building Model (2022 Implementation)**
>   * Dataset: 3D Building Model (2022 Implementation)
>   * Address: Saitama City, Saitama Prefecture
>   * [[PlateauView]](https://plateauview.mlit.go.jp/) `建築物モデル 埼玉県 さいたま市`
>   * *Source: MLIT Data Platform*
> * **Urban Planning Decision Model (2022 Implementation)**
>   * Dataset: Urban Planning Decision Model (2022 Implementation)
>   * Address: Saitama City, Saitama Prefecture
>   * [[PlateauView]](https://plateauview.mlit.go.jp/) `都市計画決定情報モデル 埼玉県 さいたま市`
>   * *Source: MLIT Data Platform*
> * **Saitama City Hall Main Building**
>   * Building: Municipal Administrative Facility (LOD2)
>   * Address: 6-4-4 Tokiwa, Urawa Ward, Saitama City, Saitama Prefecture
>   * [[PlateauView]](https://plateauview.mlit.go.jp/) `埼玉県さいたま市浦和区常盤`
>   * *Source: MLIT Data Platform*
> * **Tokiwa Elementary School (Designated Emergency Evacuation Shelter)**
>   * Building: Educational Facility / Emergency Shelter (LOD2)
>   * Address: 6-1-9 Tokiwa, Urawa Ward, Saitama City, Saitama Prefecture
>   * [[PlateauView]](https://plateauview.mlit.go.jp/) `埼玉県さいたま市浦和区常盤`
>   * *Source: MLIT Data Platform*
> * **Tokiwa, Urawa Ward, Saitama City**
>   * Address: Tokiwa 1-chome to 10-chome, Urawa Ward, Saitama City, Saitama Prefecture
>   * [[PlateauView]](https://plateauview.mlit.go.jp/) `埼玉県さいたま市浦和区常盤`
>   * *Source: MLIT Data Platform*
>
> **Insights**:
> * **Spatial Suitability**: Saitama City Hall and Tokiwa Elementary School are modeled in LOD2 with structural height attributes, offering critical vertical capacity for municipal operations and designated emergency evacuation during major river flood events.
> * **Spatial Constraints & Risks**: Positioned along the Omiya Plateau margin, micro-topographical slope variations around Tokiwa present surface inundation bottlenecks and narrow access constraints along surrounding residential street networks.
> * **3D Spatial Simulation**: Overlaying the 2022 Flood Inundation Scenario Model with LOD2 building geometry in PlateauView enables accurate 3D depth simulation against facility thresholds to optimize evacuation routing and hazard preparedness.

![衛星マップ表示（英語）](../assets/satellite_map.png)
![ベクターマップ表示（英語）](../assets/white_map.png)

---

#### 🗾 日本語プロンプト実行例

> **ユーザープロンプト**:
> `さいたま市役所周辺の洪水浸水想定と避難所、住所をさらに詳しく`
>
> **エージェント応答 ＆ A2UI サーフェス**:
> * **洪水浸水想定区域モデル (2022年度整備)**
>   * データセット: 洪水浸水想定区域モデル (2022年度整備)
>   * 住所: 埼玉県さいたま市浦和区高砂
>   * [[PlateauView]](https://plateauview.mlit.go.jp/) `洪水浸水想定区域モデル 埼玉県 さいたま市`
>   * *出典: 国土交通データプラットフォーム*
> * **建築物モデル (2022年度整備)**
>   * データセット: 建築物モデル (2022年度整備)
>   * 住所: 埼玉県さいたま市浦和区高砂
>   * [[PlateauView]](https://plateauview.mlit.go.jp/) `建築物モデル 埼玉県 さいたま市`
>   * *出典: 国土交通データプラットフォーム*
> * **さいたま市役所本庁舎**
>   * 建築物: 庁舎・災害対策拠点 (LOD2)
>   * 住所: 埼玉県さいたま市浦和区高砂3-15-1
>   * [[PlateauView]](https://plateauview.mlit.go.jp/) `埼玉県さいたま市浦和区高砂`
>   * *出典: 国土交通データプラットフォーム*
> * **常盤小学校（指定緊急避難場所）**
>   * 建築物: 学校施設・指定緊急避難場所 (LOD2)
>   * 住所: 埼玉県さいたま市浦和区常盤9-30-9
>   * [[PlateauView]](https://plateauview.mlit.go.jp/) `埼玉県さいたま市浦和区常盤`
>   * *出典: 国土交通データプラットフォーム*
> * **埼玉県さいたま市浦和区高砂**
>   * 住所: 埼玉県さいたま市浦和区高砂（1〜4丁目）
>   * [[PlateauView]](https://plateauview.mlit.go.jp/) `埼玉県さいたま市浦和区高砂`
>   * *出典: 国土交通データプラットフォーム*
> * **埼玉県さいたま市浦和区常盤**
>   * 住所: 埼玉県さいたま市浦和区常盤（1〜10丁目）
>   * [[PlateauView]](https://plateauview.mlit.go.jp/) `埼玉県さいたま市浦和区常盤`
>   * *出典: 国土交通データプラットフォーム*
>
> **インサイト**:
> * **空間適性評価**: さいたま市役所本庁舎および周辺の主要避難施設（常盤小学校等）は、LOD2建築物モデルにより構造および高さ情報が立体的に整備されています。大宮台地上の拠点として災害対策および避難収容適性を備えています。
> * **空間的制約・リスク**: 荒川水系・芝川水系の洪水浸水想定区域モデルとの重畳により、想定浸水深や浸水エリアの境界が明確化されます。一部の低地部およびアクセス道路の冠水による避難ルート遮断リスクが空間的制約となります。
> * **3D空間活用・シミュレーション**: PlateauView上で洪水浸水想定モデルとLOD2建築物モデルを重ね合わせることで、各施設における2階以上の垂直避難可能スペースや周辺道路の浸水リスク状況を3D空間上で事前にシミュレーションし、防災計画の精度向上に活用可能です。

![衛星マップ表示（日本語）](../assets/satellite_map_jp.png)
![ベクターマップ表示（日本語）](../assets/white_map_jp.png)

---

## データを操作する

通常、クエリ処理は1分以内に完了しますが、検索対象のデータサイズや空間処理の複雑さによって異なる場合があります。複雑なクエリの場合は、完了までに数分かかることがあります。ただし、その間もPLATEAUで他の操作を行うことができます。


## 質問できるデータ

PLATEAUに相談すると、地理空間データセットを分析できます

- **データセット**: 建築物モデル（`bldg`）、洪水浸水想定区域（`fld`）、土砂災害警戒区域（`lsld`）、津波浸水想定（`tnm`）、都市計画決定情報（`urf`）、道路（`tran`）などの各種 PLATEAU / MLIT DPF 空間データカタログ
- **建築物**: 官公庁庁舎、学校・教育施設、指定緊急避難場所、医療機関、商業施設などの LOD1 / LOD2 3D建築物モデルおよび詳細施設属性
- **住所**: 都道府県、市区町村、町丁目・番地、代表緯度経度座標、地域メッシュコード（1kmメッシュ等）、および行政コード正規化情報


## ブレインストーミング、カスタムマップの作成、ニーズを明確にするための追加の質問を行う

- 「データセットをさらに詳しく」
  *(English: "Datasets Learn more")*
- 「建築物をさらに詳しく」
  *(English: "Buildings Learn more")*
- 「住所をさらに詳しく」
  *(English: "Addresses Learn more")*
- 「都道府県をさらに詳しく。市区町村をさらに詳しく。」
  *(English: "Prefectures Learn more. Municipalities Learn more.")*
- 「カテゴリーをさらに詳しく。」
  *(English: "Categories Learn more.")*
