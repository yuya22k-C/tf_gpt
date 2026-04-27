# Flower App Monorepo

`/workspace/tf_gpt` 配下に、`frontend`（React + TypeScript + Vite）と `backend`（Node.js + Express + TypeScript）を作成しています。

## ディレクトリ構成

- `frontend/`: 一覧画面（`/`）を表示するフロントエンド
- `backend/`: `/api/flowers` を起点にした REST API
- `docker-compose.yml`: フロントエンドとバックエンドをローカルで一括起動（任意）

## Frontend 起動手順

```bash
cd frontend
npm install
npm run dev
```

- 既定URL: `http://localhost:5173`
- `vite.config.ts` で `/api` を `http://localhost:3001` へプロキシしています。

## Backend 起動手順

```bash
cd backend
npm install
npm run dev
```

- 既定URL: `http://localhost:3001`
- API エンドポイント:
  - `GET /api/flowers`
  - `GET /api/flowers/:id`
  - `POST /api/flowers`
  - `PUT /api/flowers/:id`
  - `DELETE /api/flowers/:id`

## CORS

`backend/src/index.ts` で CORS を有効化し、既定で `http://localhost:5173` を許可しています。

必要に応じて環境変数 `FRONTEND_ORIGIN` で変更できます。

## Docker Compose で一括起動（任意）

```bash
docker compose up
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3001`
