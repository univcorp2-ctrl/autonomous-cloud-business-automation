# Cloudflare 側の設定

## 1. Cloudflare アカウントを準備

Cloudflare Workers を使います。ローカルから操作する場合は Wrangler を使います。

```bash
npm install
npx wrangler login
```

## 2. D1 データベース作成

```bash
npx wrangler d1 create business_automation
```

出力された `database_id` を `wrangler.toml` の `database_id` に貼り付けます。

マイグレーション:

```bash
npm run db:migrate:prod
```

## 3. R2 バケット作成

```bash
npx wrangler r2 bucket create business-automation-reports
```

レポート、CSV、スクリーンショット、生データを保存する想定です。

## 4. Queue 作成

```bash
npx wrangler queues create automation-jobs
```

大量収集や分析処理を非同期にしたい場合に使います。

## 5. Secrets 登録

```bash
npx wrangler secret put GPT_ACTION_TOKEN
npx wrangler secret put OPENAI_API_KEY
```

`OPENAI_API_KEY` は AIレビューを実際に使う場合のみ必要です。

## 6. デプロイ

```bash
npm run deploy
```

デプロイ後、表示された workers.dev URL またはカスタムドメインで `/api/health` を確認します。

## 7. Cron Triggers

`wrangler.toml` の `crons` で定期実行を定義しています。

```toml
[triggers]
crons = ["0 */6 * * *"]
```

初期設定では 6 時間ごとの更新を想定しています。

## 8. 本格運用で検討すること

- 大量データ収集は Queues に分散する。
- 生データやCSVは R2 に保存する。
- 検索・集計が必要なデータは D1 に保存する。
- 長時間処理や重い分析は、Cloud Run / ECS / Batch などに逃がす。
- 本番 URL は Custom GPT の OpenAPI schema に反映する。
