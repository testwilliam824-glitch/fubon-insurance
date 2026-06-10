# Vercel + Neon 部署教學（免信用卡、不冷啟動）

Render 帳號被誤封、Koyeb / Railway 要綁卡，改用 **Vercel（前端 + API）+ Neon（免費 PostgreSQL）**，兩者都免信用卡。

## 架構

```
Vercel (免卡)
├── public/        → 靜態檔（HTML/CSS/JS/icons）
└── api/index.js   → Express serverless function
        ↓ DATABASE_URL
Neon (免卡) PostgreSQL
```

---

## Step 1：申請 Neon 免費 PostgreSQL

1. 打開 https://neon.tech → **Sign up** → 用 **GitHub 登入**（免卡）
2. 建立 Project（名稱隨意，例如 `fubon`）
3. 建立後會顯示 **Connection string**，格式：
   ```
   postgresql://user:pass@ep-xxx.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
   ```
4. **複製這串**（待會貼到 Vercel）

---

## Step 2：部署到 Vercel

1. 打開 https://vercel.com → **Sign up** → 用 **GitHub 登入**（免卡）
2. **Add New** → **Project**
3. 選 `fubon-insurance` repo → **Import**
4. **Root Directory** 設為 `web` ⚠️ 重要（因為 vercel.json 在 web/ 下）
5. **Framework Preset**：Other
6. 展開 **Environment Variables**，加入：

| Key | Value |
|---|---|
| `DATABASE_URL` | （貼上 Step 1 的 Neon connection string）|
| `ADMIN_USER` | `admin` |
| `ADMIN_PASS` | 自訂強密碼 |
| `LINK_SECRET` | 任意長字串 |
| `PUBLIC_URL` | （部署後填回 Vercel 網址）|

7. 點 **Deploy** → 等 1-2 分鐘

---

## Step 3：取得網址 + 回填 PUBLIC_URL

部署完成 → 拿到網址（格式 `https://fubon-insurance-xxx.vercel.app`）

1. Settings → Environment Variables → 編輯 `PUBLIC_URL` = 你的 Vercel 網址
2. Deployments → 最新一筆 → **Redeploy**

---

## 與其他平台比較

| 項目 | Render | Koyeb | **Vercel + Neon** |
|---|---|---|---|
| 信用卡 | 免 | ❌ 要 | ✅ 免 |
| 冷啟動 | 😴 15 分睡 | 不睡 | ✅ 幾乎無感 |
| 資料持久 | 內建（90 天）| 需外接 | ✅ Neon 永久 |
| 帳號封鎖 | ❌ 你遇到了 | — | 寬鬆 |

---

## 疑難排解

- **Build 失敗 "Cannot find module"** → Root Directory 要設 `web`
- **API 500 / DB 錯誤** → `DATABASE_URL` 沒設或 Neon 字串錯，確認結尾有 `?sslmode=require`
- **靜態檔 404** → vercel.json 的 routes 已處理，確認 Root Directory = `web`
- **資料消失** → 沒設 `DATABASE_URL`，serverless 不能存 JSON 檔，一定要接 Neon

---

## 本地開發（不變）

```bash
cd web/server && npm install && npm start
# 沒設 DATABASE_URL → 用 JSON 檔
# http://localhost:3000/
```
