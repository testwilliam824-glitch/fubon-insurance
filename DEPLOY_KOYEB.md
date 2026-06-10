# Koyeb 部署教學（取代 Render）

Render 帳號被誤判為「suspicious activity」暫停，改用 Koyeb（免費、不冷啟動）。

## 前置作業

1. GitHub 帳號（已有：`testwilliam824-glitch/fubon-insurance`）
2. 註冊 Koyeb：https://www.koyeb.com → 用 GitHub 登入（免綁信用卡）

## Step 1：建立 Web Service

1. 登入 Koyeb → 點 **Create Web Service**
2. 選 **GitHub** → 授權 → 選 `fubon-insurance` repo
3. Branch：`main`

## Step 2：Build 設定

| 欄位 | 值 |
|---|---|
| **Builder** | Dockerfile |
| **Dockerfile location** | `Dockerfile`（repo 根目錄，已備好）|
| **Work directory** | 留空（根目錄）|

## Step 3：環境變數（Environment variables）

| Key | Value |
|---|---|
| `ADMIN_USER` | `admin` |
| `ADMIN_PASS` | 自訂強密碼 |
| `LINK_SECRET` | 任意長字串 |
| `DATABASE_URL` | （見 Step 4，先留空用 JSON 檔也可）|
| `PUBLIC_URL` | （部署後填回 Koyeb 網址）|

> 註：不設 `DATABASE_URL` 時會用 JSON 檔（容器重啟會清空）。要永久保存看 Step 4。

## Step 4：資料庫（二選一）

### 選項 A：先用 JSON 檔（快速上線、測試用）
不設 `DATABASE_URL`，直接部署。⚠️ 容器重啟資料會清空。

### 選項 B：接免費 PostgreSQL（建議）
Koyeb 本身沒有免費 DB，可用外部免費 Postgres：
- **Neon**（https://neon.tech）免費 0.5GB，不會過期 ⭐ 推薦
- **Supabase**（https://supabase.com）免費 500MB

1. 到 Neon 註冊 → 建立 project → 複製 **Connection string**
   （格式：`postgresql://user:pass@xxx.neon.tech/dbname?sslmode=require`）
2. 貼到 Koyeb 環境變數 `DATABASE_URL`
3. 重新部署 → 自動建表

## Step 5：Instance / Region

| 欄位 | 建議值 |
|---|---|
| **Instance type** | Free（eco / nano）|
| **Region** | Singapore / Washington（看哪個免費）|
| **Port** | `8000`（Dockerfile 已 EXPOSE 8000）|
| **Health check path** | `/` |

## Step 6：部署

點 **Deploy** → 等 2-4 分鐘 build → 拿到網址
（格式：`https://fubon-insurance-xxxx.koyeb.app`）

部署完成後：
1. 回環境變數填 `PUBLIC_URL` = 你的 Koyeb 網址
2. Redeploy 一次

## 與 Render 的差異

| 項目 | Render 免費 | Koyeb 免費 |
|---|---|---|
| 冷啟動 | 15 分鐘睡 | ✅ 不睡 |
| 執行時數 | 750 hr/月 | ✅ 1 個服務常駐 |
| 資料庫 | 內建（90 天）| 需外接 Neon |

## 疑難排解

- **Build 失敗** → 確認 Dockerfile location 是 `Dockerfile`、Builder 選 Dockerfile
- **502 / 無法連線** → Port 要設 `8000`
- **資料消失** → 沒設 `DATABASE_URL`，改用 Neon（選項 B）
