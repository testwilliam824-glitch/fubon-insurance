# LINE / Messenger 整合教學

> 讓智能推薦系統自動回覆 LINE / Messenger 訊息

---

## 📱 LINE 官方帳號整合

### 第一部分：建立 LINE 官方帳號

#### Step 1: 註冊 LINE 官方帳號

1. 前往 [LINE Official Account Manager](https://manager.line.biz/)
2. 使用 LINE 帳號登入
3. 點擊「建立帳號」
4. 選擇帳號類型：
   - 企業用戶：選「公司或組織」
   - 個人用戶：選「個人」
5. 填寫基本資料：
   - 帳號名稱：「富邦保單智能諮詢」（或其他名稱）
   - 類別：金融保險
   - 地區：台灣

#### Step 2: 啟用 Messaging API

1. 在帳號管理頁面，點擊「設定」
2. 左側選單選擇「Messaging API」
3. 點擊「啟用 Messaging API」
4. 選擇方案：
   - 免費版：每月 1000 則免費訊息
   - 輕用量版：每月 500 則免費，超出 0.022 元/則
5. 確認 LINE Official Account Manager 和 LINE Developers 帳號連結

#### Step 3: 取得 Channel 資訊

1. 前往 [LINE Developers](https://developers.line.biz/console/)
2. 選擇 Provider（你的帳號）
3. 點擊「Create a new channel」→「Messaging API」
4. 填寫資訊：
   - Channel name: FubonInsuranceBot
   - Channel description: 富邦保單智能推薦機器人
5. 建立後進入 Channel 頁面
6. 記錄以下資訊（非常重要）：
   - **Channel ID**: 數字 ID
   - **Channel Secret**: 點擊顯示後複製
   - **Channel Access Token**: 點擊「Issue」產生後複製

---

### 第二部分：建立 Webhook 伺服器

我們需要一個伺服器接收 LINE 訊息並回覆。使用 Google Apps Script（免費）

#### Step 1: 建立新的 Apps Script 專案

1. 前往 [Google Apps Script](https://script.google.com)
2. 點擊「New project」
3. 刪除預設的 `myFunction`，貼上以下程式碼：

```javascript
// LINE Bot 設定
const LINE_CHANNEL_ACCESS_TOKEN = '你的_Channel_Access_Token';
const LINE_CHANNEL_SECRET = '你的_Channel_Secret';

// 問卷網址
const SURVEY_URL = 'https://你的帳號.github.io/fubon-insurance-recommender/';

// Webhook 入口
function doPost(e) {
  const events = JSON.parse(e.postData.contents).events;
  
  events.forEach(event => {
    if (event.type === 'message' && event.message.type === 'text') {
      handleMessage(event.replyToken, event.message.text, event.source.userId);
    }
    
    // 處理加入好友事件
    if (event.type === 'follow') {
      sendWelcomeMessage(event.replyToken);
    }
  });
  
  return ContentService.createTextOutput(JSON.stringify({ 'content': 'post ok' }))
    .setMimeType(ContentService.MimeType.JSON);
}

// 處理訊息
function handleMessage(replyToken, message, userId) {
  const text = message.trim().toLowerCase();
  
  // 關鍵字回覆
  if (text.includes('保單') || text.includes('推薦') || text.includes('諮詢')) {
    sendSurveyLink(replyToken);
  } else if (text.includes('節稅') || text.includes('遺產')) {
    sendTaxPlanningInfo(replyToken);
  } else if (text.includes('聯絡') || text.includes('電話')) {
    sendContactInfo(replyToken);
  } else if (text === 'hi' || text === '你好' || text === '您好') {
    sendWelcomeMessage(replyToken);
  } else {
    sendDefaultReply(replyToken);
  }
}

// 發送問卷連結
function sendSurveyLink(replyToken) {
  const message = {
    type: 'template',
    altText: '富邦保單智能推薦',
    template: {
      type: 'buttons',
      title: '🏦 富邦保單智能推薦',
      text: '點擊下方按鈕填寫問卷，為您量身推薦最適合的保單！',
      actions: [
        {
          type: 'uri',
          label: '📝 開始填寫問卷',
          uri: SURVEY_URL
        },
        {
          type: 'message',
          label: '📞 聯絡專員',
          text: '聯絡專員'
        }
      ]
    }
  };
  
  replyMessage(replyToken, message);
}

// 發送歡迎訊息
function sendWelcomeMessage(replyToken) {
  const messages = [
    {
      type: 'text',
      text: '👋 歡迎使用富邦保單智能推薦系統！\n\n我是您的 AI 保險顧問，可以幫您：\n\n🏦 分析保險需求\n💰 推薦適合富邦保單\n📊 節稅規劃建議\n🔄 資產傳承規劃\n\n請點擊「開始問卷」或輸入「保單推薦」開始！'
    },
    {
      type: 'template',
      altText: '選擇服務',
      template: {
        type: 'buttons',
        title: '請選擇服務',
        text: '您想了解哪方面的保險規劃呢？',
        actions: [
          {
            type: 'uri',
            label: '📝 開始問卷',
            uri: SURVEY_URL
          },
          {
            type: 'message',
            label: '💰 節稅規劃',
            text: '節稅規劃'
          },
          {
            type: 'message',
            label: '📞 聯絡專員',
            text: '聯絡專員'
          }
        ]
      }
    }
  ];
  
  replyMessage(replyToken, messages);
}

// 發送節稅規劃資訊
function sendTaxPlanningInfo(replyToken) {
  const message = {
    type: 'text',
    text: '💰 高資產節稅傳承規劃\n\n透過富邦保單，您可以：\n\n✅ 保險給付免計入遺產（遺贈稅法第16條）\n✅ 每人每年333萬免稅額度\n✅ 直接指定受益人，不經繼承程序\n✅ 債權隔離，保護家族資產\n\n推薦保單：\n• 新吉好利增額壽險\n• 珍吉利增額壽險\n• 加美利外幣增額壽險\n\n📝 輸入「問卷」取得個人化推薦！'
  };
  
  replyMessage(replyToken, message);
}

// 發送聯絡資訊
function sendContactInfo(replyToken) {
  const message = {
    type: 'text',
    text: '📞 聯絡我們\n\n專業顧問將為您提供一對一服務：\n\n🏦 富邦人壽\n📱 LINE: @fubon-advisor（範例）\n☎️ 電話：02-1234-5678（範例）\n📧 Email：service@fubon.com（範例）\n\n⏰ 服務時間：\n週一至週五 09:00-18:00\n\n📝 您也可以直接填寫問卷，我們會盡快與您聯繫！'
  };
  
  replyMessage(replyToken, message);
}

// 預設回覆
function sendDefaultReply(replyToken) {
  const message = {
    type: 'text',
    text: '抱歉，我不太明白您的意思 😅\n\n您可以輸入以下關鍵字：\n\n📝 「保單」或「推薦」- 開始問卷\n💰 「節稅」- 節稅規劃資訊\n📞 「聯絡」- 聯絡專員\n\n或直接點擊選單按鈕！'
  };
  
  replyMessage(replyToken, message);
}

// 回覆訊息
function replyMessage(replyToken, messages) {
  const url = 'https://api.line.me/v2/bot/message/reply';
  
  // 確保 messages 是陣列
  const messageArray = Array.isArray(messages) ? messages : [messages];
  
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + LINE_CHANNEL_ACCESS_TOKEN
    },
    payload: JSON.stringify({
      replyToken: replyToken,
      messages: messageArray
    })
  };
  
  try {
    UrlFetchApp.fetch(url, options);
  } catch (e) {
    console.error('發送訊息失敗：', e);
  }
}

// 驗證簽名（進階安全）
function validateSignature(body, signature) {
  const crypto = require('crypto');
  const hash = crypto.createHmac('sha256', LINE_CHANNEL_SECRET)
    .update(body).digest('base64');
  return hash === signature;
}
```

#### Step 2: 部署 Webhook

1. 點擊「Deploy」→「New deployment」
2. 點擊「齒輪圖示」→選擇「Web app」
3. 設定：
   - Description: LINE Bot Webhook
   - Execute as: Me
   - Who has access: Anyone
4. 點擊「Deploy」
5. 授權存取（第一次會跳出授權視窗）
6. 複製 Web URL（格式：`https://script.google.com/macros/s/xxxxxxxx/exec`）

#### Step 3: 設定 LINE Webhook

1. 回到 [LINE Developers](https://developers.line.biz/console/)
2. 進入你的 Channel
3. 在「Webhook settings」區塊：
   - Webhook URL: 貼上 Apps Script Web URL
   - 開啟「Use webhook」
4. 點擊「Verify」驗證連線
5. 在「Auto-reply messages」關閉自動回覆（讓我們的程式處理）

#### Step 4: 設定選單（Rich Menu）

1. 在 LINE Developers，進入 Channel →「Messaging API」→「Channel settings」
2. 前往 [LINE Official Account Manager](https://manager.line.biz/)
3. 點擊「首頁」→「聊天室相關設定」→「圖文選單」
4. 點擊「建立」
5. 設定選單：

```
┌─────────────┬─────────────┐
│   📝 開始   │   💰 節稅   │
│   問卷     │   規劃     │
├─────────────┼─────────────┤
│   📞 聯絡   │   ℹ️ 更多   │
│   專員     │   資訊     │
└─────────────┴─────────────┘
```

6. 每個按鈕設定：
   - 開始問卷：連結到問卷網址
   - 節稅規劃：發送文字「節稅規劃」
   - 聯絡專員：發送文字「聯絡專員」
   - 更多資訊：發送文字「更多資訊」

#### Step 5: 測試 LINE Bot

1. 在 LINE Official Account Manager 取得「加入好友連結」
2. 掃描 QR Code 加入好友
3. 發送訊息測試：
   - 「你好」→ 應該收到歡迎訊息
   - 「保單推薦」→ 應該收到問卷連結
   - 「節稅」→ 應該收到節稅資訊

---

## 📱 Messenger 整合（Facebook）

### 第一部分：建立 Facebook 粉絲頁

#### Step 1: 建立粉絲頁

1. 前往 [Facebook](https://facebook.com)
2. 點擊選單 →「粉絲專頁」→「建立粉絲專頁」
3. 選擇類別：「公司或組織」→「金融服務」
4. 填寶資料：
   - 粉絲專頁名稱：「富邦保單智能諮詢」
   - 類別：保險公司

#### Step 2: 啟用 Messenger

1. 在粉絲頁，點擊「設定」→「訊息」
2. 開啟「允許透過訊息與粉絲專頁聯絡」
3. 設定歡迎訊息（可選）

### 第二部分：建立 Messenger Bot

#### Step 1: 建立 Facebook App

1. 前往 [Meta for Developers](https://developers.facebook.com/)
2. 登入 Facebook 帳號
3. 點擊「我的應用程式」→「建立應用程式」
4. 選擇「其他」→「下一步」
5. 填寶資料：
   - 應用程式顯示名稱：FubonInsuranceBot
   - 聯絡電子郵件：你的 Email

#### Step 2: 設定 Messenger 產品

1. 在 App 頁面，點擊「+ 新增產品」
2. 找到「Messenger」→ 點擊「設定」
3. 在「存取權杖」區塊：
   - 點擊「新增或移除粉絲專頁」
   - 選擇你的粉絲頁
   - 產生存取權杖（複製保存）

#### Step 3: 設定 Webhook

使用同一個 Google Apps Script：

1. 在 Apps Script 新增 Messenger 處理：

```javascript
// Messenger 設定
const FB_PAGE_ACCESS_TOKEN = '你的_Page_Access_Token';
const FB_VERIFY_TOKEN = '你的_Verify_Token'（任意字串，例如 'fubon2026'）;

// Messenger Webhook 驗證（GET）
function doGet(e) {
  const mode = e.parameter['hub.mode'];
  const token = e.parameter['hub.verify_token'];
  const challenge = e.parameter['hub.challenge'];
  
  if (mode === 'subscribe' && token === FB_VERIFY_TOKEN) {
    return ContentService.createTextOutput(challenge);
  }
  
  return ContentService.createTextOutput('Error');
}

// 修改 doPost 同時支援 LINE 和 Messenger
function doPost(e) {
  const contents = e.postData.contents;
  
  // 嘗試解析為 LINE 格式
  try {
    const lineData = JSON.parse(contents);
    if (lineData.events) {
      return handleLineEvents(lineData.events);
    }
  } catch (e) {
    // 不是 LINE 格式
  }
  
  // 嘗試解析為 Messenger 格式
  try {
    const fbData = JSON.parse(contents);
    if (fbData.object === 'page') {
      return handleMessengerEvents(fbData.entry);
    }
  } catch (e) {
    // 不是 Messenger 格式
  }
  
  return ContentService.createTextOutput('OK');
}

// 處理 Messenger 事件
function handleMessengerEvents(entries) {
  entries.forEach(entry => {
    entry.messaging.forEach(event => {
      if (event.message && event.message.text) {
        handleMessengerMessage(event.sender.id, event.message.text);
      }
    });
  });
  
  return ContentService.createTextOutput('OK');
}

// 處理 Messenger 訊息
function handleMessengerMessage(senderId, message) {
  const text = message.trim().toLowerCase();
  
  if (text.includes('保單') || text.includes('推薦')) {
    sendMessengerSurveyLink(senderId);
  } else if (text.includes('hi') || text === '你好') {
    sendMessengerWelcome(senderId);
  } else {
    sendMessengerDefault(senderId);
  }
}

// 發送 Messenger 訊息
function sendMessengerMessage(recipientId, message) {
  const url = `https://graph.facebook.com/v18.0/me/messages?access_token=${FB_PAGE_ACCESS_TOKEN}`;
  
  const payload = {
    recipient: { id: recipientId },
    message: message
  };
  
  const options = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    payload: JSON.stringify(payload)
  };
  
  UrlFetchApp.fetch(url, options);
}

// 發送歡迎訊息
function sendMessengerWelcome(senderId) {
  const message = {
    text: '👋 歡迎使用富邦保單智能推薦！\n\n請點擊以下連結填寫問券：\n' + SURVEY_URL
  };
  
  sendMessengerMessage(senderId, message);
}

// 發送問卷連結
function sendMessengerSurveyLink(senderId) {
  const message = {
    attachment: {
      type: 'template',
      payload: {
        template_type: 'button',
        text: '🏦 為您推薦最適合的富邦保單',
        buttons: [
          {
            type: 'web_url',
            url: SURVEY_URL,
            title: '📝 填寫問券'
          },
          {
            type: 'postback',
            title: '📞 聯絡專員',
            payload: 'CONTACT'
          }
        ]
      }
    }
  };
  
  sendMessengerMessage(senderId, message);
}

// 預設回覆
function sendMessengerDefault(senderId) {
  const message = {
    text: '您可以輸入「保單推薦」開始問券，或點擊上方選單！'
  };
  
  sendMessengerMessage(senderId, message);
}
```

#### Step 4: 設定 Messenger Webhook

1. 重新部署 Apps Script（取得新的 Web URL）
2. 回到 Meta Developers → Messenger 設定
3. 在「Webhook」區塊：
   - Callback URL: 貼上 Apps Script Web URL
   - Verify Token: 輸入你設定的 FB_VERIFY_TOKEN
   - 點擊「驗證並儲存」
4. 訂閱頁面事件：勾選「messages」
5. 選擇你的粉絲頁 → 點擊「新增訂閱」

#### Step 5: 設定歡迎畫面

1. 在 Messenger 設定，找到「歡迎畫面」
2. 設定問候語：
   ```
   👋 歡迎使用富邦保單智能推薦！
   
   我是您的 AI 保險顧問 🤖
   點擊「開始使用」或輸入「保單推薦」
   為您量身推薦最適合的富邦保單！
   ```

#### Step 6: 設定固定選單

1. 使用 Graph API 或 Messenger 設定固定選單
2. 選單選項：
   - 問券調查 → 連結到問券網址
   - 節稅資訊 → 發送訊息「節稅」
   - 聯絡我們 → 發送訊息「聯絡」

---

## 🎯 進階功能

### 自動推播（Broadcast）

當有新保單或優惠時，主動推播給所有用戶：

```javascript
// LINE 廣播（免費版每月限額 1000）
function broadcastLINE(message) {
  const url = 'https://api.line.me/v2/bot/message/broadcast';
  
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + LINE_CHANNEL_ACCESS_TOKEN
    },
    payload: JSON.stringify({
      messages: [{ type: 'text', text: message }]
    })
  };
  
  UrlFetchApp.fetch(url, options);
}

// 使用範例
broadcastLINE('🎉 富邦新推出「吉鑽利」保單！\n\n立即填寫問券了解詳情：\n' + SURVEY_URL);
```

### 用戶資料儲存

將 LINE / Messenger 用戶 ID 儲存到 Google Sheet：

```javascript
function saveUser(userId, platform, timestamp) {
  const sheet = SpreadsheetApp.openById('你的_Sheet_ID').getSheetByName('Users');
  sheet.appendRow([timestamp, userId, platform]);
}
```

---

## ✅ 整合完成檢查清單

### LINE
- [ ] LINE 官方帳號建立完成
- [ ] Messaging API 已啟用
- [ ] Channel Access Token 已取得
- [ ] Webhook URL 設定完成
- [ ] Apps Script 部署完成
- [ ] 歡迎訊息測試成功
- [ ] 問卷連結測試成功
- [ ] 選單設定完成

### Messenger
- [ ] Facebook 粉絲頁建立完成
- [ ] Facebook App 建立完成
- [ ] Page Access Token 已取得
- [ ] Webhook 驗證成功
- [ ] Apps Script 更新完成
- [ ] 歡迎畫面設定完成
- [ ] 訊息測試成功

---

## 📱 使用場景

### 客戶加入 LINE 後的流程：

```
客戶掃描 QR Code 加入 LINE
    ↓
自動收到歡迎訊息
    ↓
客戶輸入「保單推薦」
    ↓
收到問卷連結
    ↓
點擊填寫問卷
    ↓
資料自動進入 Google Sheet
    ↓
你收到 Email / LINE 通知
    ↓
主動聯繫客戶提供服務
```

---

**文件版本：v1.0**
**建立日期：2026-05-22**
