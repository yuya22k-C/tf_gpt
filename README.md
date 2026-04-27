# Tomato Tracker

トマトの `開花数` `結実数` `開花日` `収穫開始日` `収穫終了日` を、`行=日付` `列=株` の一覧表で記録する Next.js アプリです。スマホとPCの両方から同じURLで使う前提です。

## セットアップ

1. 依存関係をインストールします。  
   `npm install`
2. `.env.example` を `.env` にコピーして値を設定します。
3. Postgres に `db/schema.sql` を適用します。
4. 開発サーバーを起動します。  
   `npm run dev`

## 環境変数

- `DATABASE_URL`: Postgres 接続文字列
- `APP_EDIT_SECRET`: 編集APIに送る秘密キー

## API

- `GET /api/plants`
- `POST /api/plants`
- `PATCH /api/plants/:id`
- `DELETE /api/plants/:id`
- `GET /api/dates`
- `POST /api/dates`
- `DELETE /api/dates/:date`
- `GET /api/records?from=YYYY-MM-DD&to=YYYY-MM-DD`
- `PUT /api/records/:date/:plantId`
- `DELETE /api/records/:date/:plantId`
- `GET /api/export.csv`

更新系APIは `x-app-secret` ヘッダーに `APP_EDIT_SECRET` を送る必要があります。

## 補足

- 日付行を空のまま保持するため、`plants` と `daily_records` に加えて `observation_dates` を追加しています。
- `開花日` `収穫開始日` `収穫終了日` は、その日の行でチェック入力する形です。
- 数値セルは空欄と `0` を区別します。
