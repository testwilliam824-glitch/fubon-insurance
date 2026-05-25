# 富邦保單智能推薦系統 - 設定指南

## 📋 系統說明

這是一個完整的富邦保單智能推薦系統，包含：
1. **QR Code 問卷頁面** - 15題需求分析問卷
2. **智能推薦引擎** - 自動分析並生成保單推薦
3. **Google 表單整合** - 自動上傳客戶資料
4. **推薦結果頁面** - 顯示客製化保單建議

---

## 🚀 快速部署步驟

### Step 1: 建立 Google 表單

1. 前往 [Google Forms](https://forms.google.com)
2. 建立新表單，標題：「富邦保單智能推薦 - 客戶資料收集」
3. 新增以下欄位：

| 欄位名稱 | 類型 | 必填 |
|----------|------|------|
| 姓名 | 簡答 | ✓ |
| 電話 | 簡答 | ✓ |
| Email | 簡答 | |
| 年齡區間 | 單選 | ✓ |
| 性別 | 單選 | ✓ |
| 職業類別 | 單選 | ✓ |
| 年收入 | 單選 | ✓ |
| 資產規模 | 單選 | ✓ |
| 規劃目標 | 核取方塊 | |
| 方便聯絡時間 | 單選 | |
| 時間戳記 | 自動 | |

4. 取得表單欄位 ID：
   - 在表單預覽模式下，按 F12 開啟開發者工具
   - 點選各個欄位，查看 HTML 中的 `name="entry.xxxxx"`
   - 記錄這些 ID

### Step 2: 部署網頁

#### 方案 A：GitHub Pages（免費推薦）

1. 在 GitHub 建立新 Repository（例如：`fubon-insurance-recommender`）
2. 上傳 `index.html`
3. 前往 Settings > Pages > 選擇 main branch
4. 網站網址：`https://你的帳號.github.io/fubon-insurance-recommender`

#### 方案 B：Netlify（免費推薦）

1. 前往 [Netlify](https://www.netlify.com/)
2. 拖放 `index.html` 到部署區域
3. 立即獲得網址（例如：`https://xxxx.netlify.app`）

#### 方案 C：Vercel（免費）

1. 前往 [Vercel](https://vercel.com/)
2. 上傳 `index.html`
3. 自動部署並獲得網址

### Step 3: 設定 Google Apps Script（自動發送郵件通知）

1. 前往 [Google Apps Script](https://script.google.com)
2. 建立新專案
3. 貼上 `google-apps-script.gs` 的程式碼
4. 修改設定：
   - 你的 Email 地址
   - 欄位對應
5. 設定觸發條件：
   - 選擇函數：`onFormSubmit`
   - 選擇活動來源：`從表單`
   - 選擇表單：你的富邦保單表單

### Step 4: 產生 QR Code

1. 前往 [QR Code Generator](https://www.qr-code-generator.com/)
2. 輸入你的網站網址
3. 下載 QR Code 圖片
4. 印製在名片、傳單、社群分享

---

## ⚙️ 修改 index.html 設定

### 1. 更新 Google Form 網址

找到這行程式碼：
```javascript
const GOOGLE_FORM_URL = 'https://docs.google.com/forms/d/e/你的表單ID/formResponse';
```

替換為你的 Google Form 網址（取得方式如下）。

### 2. 更新欄位對應

找到 `submitToGoogleForm` 函數中的 `fields` 物件：
```javascript
const fields = {
    'entry.1000000': answers.name,  // 改成你的欄位ID
    // ... 其他欄位
};
```

**取得欄位 ID 的方法：**
1. 開啟 Google Form 預覽
2. 按 F12 開啟開發者工具
3. 選取任意欄位
4. 查看 `name="entry.xxxxx"` 的值

---

## 📱 問卷流程

```
QR Code → 15題問卷 → 智能分析 → 顯示推薦 → 提交Google表單
            ↓
    [年齡、性別、職業、收入、資產、家庭、預算、目標...]
```

### 15題內容：

1. 年齡區間
2. 性別
3. 職業類別
4. 年收入
5. 家庭狀況
6. 每月保費預算
7. 既有保單
8. 規劃目標
9. 資產規模
10. 節稅需求
11. 傳承規劃
12. 債務風險
13. 投資風險偏好
14. 外幣需求
15. 聯絡資訊

---

## 🤖 推薦邏輯

系統會根據以下條件自動推薦富邦保單：

### 基礎推薦（根據年齡）
- **0-18歲**：金來寶小額壽險 + 平安意外險
- **19-30歲**：安心好漾定期險 / 珍吉利增額壽險
- **31-50歲**：新富享人生還本壽險 + 金享福健康險
- **51-65歲**：金萬利終身保險 + 金鑽豐利還本壽險
- **66歲以上**：長照險 + 年金險

### 高資產推薦（年收入500萬以上 或 資產3000萬以上）
- 節稅需求 → 新吉好利 / 珍吉利增額壽險
- 債務隔離 → 金好運萬能壽險 / 吉鑽利還本壽險
- 傳承規劃 → 金來寶小額壽險 / 新富享人生還本壽險

### 特殊需求
- 外幣配置 → 加美利外幣增額壽險
- 儲蓄理財 → 月月吉利還本壽險
- 退休規劃 → 金萬利終身保險

---

## 📊 Google Sheet 自動化

### 安裝 Apps Script 後，每次有新回應會自動：

1. ✅ 發送 Email 通知給你
2. ✅ 在 Sheet 中標記推薦保單
3. ✅ 可擴充：發送客戶感謝信、建立 CRM 記錄

---

## 🔧 進階自訂

### 修改推薦規則

在 `index.html` 中找到 `generateRecommendations` 函數，可以：
- 新增推薦條件
- 調整保單組合
- 修改推薦優先順序

### 新增題目

1. 在 HTML 中新增 `.question` div
2. 更新 `totalQuestions` 變數
3. 在 `generateRecommendations` 中使用新答案

### 整合 LINE / Messenger

可以將網站網址：
- 設定為 LINE 官方帳號的選單連結
- 放在 Messenger 自動回覆中
- 嵌入 Facebook 粉絲頁

---

## 🎨 品牌客製化

### 修改顏色

在 CSS 中找到：
```css
.header, .btn-primary {
    background: linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%);
}
```

替換為富邦品牌色：
- 富邦藍：`#004098` 或 `#0056b3`
- 富邦金：`#c9a227`

### 新增 Logo

在 header 中加入：
```html
<img src="fubon-logo.png" alt="富邦人壽" style="width: 100px; margin-bottom: 15px;">
```

---

## 📝 注意事項

1. **法規遵循**：
   - 確保符合保險相關法規
   - 問卷結尾需加免責聲明
   - 個資收集需符合個資法

2. **資料安全**：
   - Google Form 設定為「限知道連結者」
   - 定期下載備份回應資料

3. **測試**：
   - 正式上線前務必完整測試
   - 確認推薦邏輯正確
   - 測試 Google Form 提交

---

## 📞 支援

如有技術問題，可以：
1. 檢查瀏覽器主控台錯誤訊息
2. 確認 Google Form URL 正確
3. 驗證 entry ID 是否正確

---

**系統版本：v1.0**
**建立日期：2026-05-22**
