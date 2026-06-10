# 富邦保險智能推薦系統 - Koyeb / Docker 部署
FROM node:20-alpine

# 保持與專案相同的目錄結構：/app/server + /app/public
WORKDIR /app/server

# 安裝相依套件（先複製 package 檔利用 layer cache）
COPY web/server/package*.json ./
RUN npm install --omit=dev

# 複製後端（到 /app/server）與前端（到 /app/public）
COPY web/server ./
COPY web/public /app/public

ENV NODE_ENV=production
EXPOSE 8000

CMD ["node", "server.js"]
