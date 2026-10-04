# Taipei Trail Finder

大台北步道探索與登山行前規劃。保留原有跑步／健行距離、時間、出發地篩選，新增右側聊天 sidebar，以 **LangChain JS `createAgent` + OpenAI API** 回答路線、裝備、飲水、食物份量與交通問題。手機用右下角按鈕開啟聊天。

## 本機啟動

需要 Node.js 22 以上。

```sh
npm install
cp .env.example .env
# 在 .env 填入 OPENAI_API_KEY
npm start
```

開啟 http://127.0.0.1:3000。`OPENAI_MODEL` 預設 `gpt-4.1-mini`，可改成帳戶可用且支援 tool calling 的 OpenAI 模型。`npm run dev` 啟用 Node watch；`npm test` 執行不消耗 API 額度的測試。

API key 只在 Node.js 伺服器讀取；靜態檔案採白名單，不提供 `.env`、伺服器程式或依賴目錄。聊天需要後端，因此 GitHub Pages 單獨託管不能執行 AI。

## 語言切換

頁面頂部的「語言／Language」下拉選單提供 **繁體中文（預設）** 與 **English**。切換會立即更新介面、18 條步道的顯示名稱／說明、捷運提示、聊天快捷問題與錯誤訊息，並以 `ttf-locale` 保存於 localStorage。篩選條件、出發地與聊天內容會保留；既有使用者／AI 訊息維持原文，後續 AI 回覆預設使用當次送出時的介面語言。

翻譯集中於 `locales/zh-Hant.js`、`locales/en.js` 與 `locales/trails-zh-Hant.js`，`i18n.js` 管理切換與格式化。`POST /api/chat` 可傳入 `locale: "zh-Hant" | "en"`，未傳入時使用繁體中文；API 錯誤包含可供前端翻譯的 `code`。

## 使用

1. 設定出發地、距離與時間，在 sidebar 選擇新手／熟手／專家。
2. 在步道卡片按「與 AI 討論」，或直接輸入「我是新手，想去北投，三公里以內」。
3. 追問「兩個人要帶多少水與食物？」「裝備各帶多少？」「搭大眾運輸怎麼去？」。
4. sidebar 的推薦卡可選為對話中的步道；「新對話」清除聊天與路線選取。

每次請求傳送最多最近 20 則訊息與目前路線／篩選條件。聊天暫存在頁面記憶體，重新整理會清除；原有出發地與篩選設定仍保存於 localStorage。

## AI 實作

- `server/chat.js`：LangChain agent，每次請求建立獨立工具狀態。工具為 `search_trails`、`get_trail`、`plan_preparation`、`plan_transport`。
- `server/planning.js`：以程式執行區域、能力、距離／時間上限查詢和份量計算；模型負責理解問題與解釋結果。
- `trails.js`：前後端共用的 18 條原有示範路線。包含跑步路線；AI 登山推薦只使用 hike/both 路線。
- `server/contracts.js`：Zod 驗證 HTTP 邊界。
- `chat-ui.js`：聊天、多輪對話、路線上下文、安全文字與連結呈現。
- `server/index.js`：本機 Node HTTP 伺服器，`POST /api/chat`、`GET /api/health`。

聊天路線查詢的距離／時間是嚴格上限，能力不符的路線不會回傳。原有主清單仍使用原本的距離容許範圍、時間公式與出發地粗估排序；sidebar 的推薦與主清單不一定一致。

可選的 Langfuse tracing 需填入 `.env.example` 中三個 `LANGFUSE_*` 設定。後端啟用 OpenTelemetry，為每次 agent invocation 建立獨立 Langfuse callback。預設不傳送 tracing；啟用後對話與工具資料會送到所設定的 Langfuse 專案。

## 資料與目前限制

- 原有距離、爬升、座標沒有官方來源逐條核對；新加的行政區、能力分級是初版專案標籤，非官方評級。步道覆蓋以台北市為主，新北仍很少。
- 健行時間依距離、爬升粗估，未包含休息。專家不自動獲得更快的時間估算。
- 飲水攜帶量以每小時 0.5 公升作為起點，炎熱／天氣未知用 0.5～1 公升範圍，加 0.5 公升備用水後進位。點心與餐食份數是專案打包估算，非營養處方。會依時長與人數提供每人與團體數量。
- 行前準備參考 [NPS Hiking Safety](https://www.nps.gov/grsm/planyourvisit/hikingsafety.htm) 與 [NPS Ten Essentials](https://www.nps.gov/articles/10essentials.htm)。美國公園建議僅作為一般規劃參考，不能代表某條台灣步道的即時情況。
- 交通只提供既有附近捷運／轉乘提示與 Google Maps 導航，沒有即時班次、車資、停車資料。
- 尚未實作大台北互動地圖、實際路線軌跡、官方路況／封閉公告、即時天氣、持久化聊天、登入和線上部署。
- 原有飯店名稱查詢仍依賴 Claude 環境的 `window.claude.use`；一般瀏覽器請用座標、包含座標的 Google Maps 網址或捷運站。尚不支援短網址解析或正式地理編碼 API。

伺服器預設僅綁定 `127.0.0.1`。公開部署前仍需要身分驗證／用量限制與 HTTPS。

## 文件

目前需求完成狀態見 [docs/status.md](docs/status.md)。
