# Autonomous Cloud Business Automation

Custom GPT から一括指示を出し、GitHub / Cloudflare 上で「収集 → 分析 → Web表示 → CSV出力 → テスト → デプロイ」まで流すための標準テンプレートです。

初期状態では安全のため、株式・暗号資産の **ライブ自動売買は無効**、データ収集も **サンプルコネクタ / 正規API前提** です。実運用では、利用するサイト・API・証券会社・取引所・クラウドの規約、法令、リスク管理を確認してください。

![architecture](docs/assets/architecture.svg)

## 何が入っているか

- Cloudflare Workers ベースの Web ダッシュボード
- `/api/run` でジョブ実行、`/api/report` で結果確認、`/api/export.csv` で Excel 取り込み用 CSV 出力
- 不動産、物販、投資シミュレーションのサンプル分析ジョブ
- D1 / R2 / Queues / Cron Triggers を使う前提の構成ファイル
- GitHub Actions による CI、ユニットテスト、Playwright E2E、Cloudflare デプロイ
- Custom GPT Actions 用 OpenAPI スキーマと GPT Instructions 雛形
- 初心者向けの GitHub / Cloudflare / Custom GPT 設定ガイド

## 想定する運用フロー

1. Custom GPT に「不動産分析を更新して」「物販候補を集めて」「投資シミュレーションを回して」などを指示する。
2. Custom GPT Action が Cloudflare Worker の認証付き API を呼ぶ。
3. Worker がジョブを登録し、必要に応じて Queue / Cron / 外部 API コネクタを使って処理する。
4. 結果は D1 に構造化保存、R2 にレポートやスクリーンショットを保存する。
5. ユーザーは Web 画面または CSV / Excel で最終結果だけ確認する。
6. コード修正時は GitHub Actions が自動で build / unit test / E2E を実行し、成功したら本番へデプロイする。

## ローカルで動かす

```bash
npm install
npm run build
npm test
npm run dev
```

ブラウザで `http://127.0.0.1:8787` を開きます。

CSV は以下で確認できます。

```bash
curl http://127.0.0.1:8787/api/export.csv
```

## Cloudflare にデプロイする

```bash
npm run deploy
```

本番の自動デプロイは `.github/workflows/deploy.yml` を使います。GitHub Secrets に `CLOUDFLARE_API_TOKEN` と `CLOUDFLARE_ACCOUNT_ID` を設定してください。

## ドキュメント

- [全体アーキテクチャ](docs/architecture.md)
- [Custom GPT 側の設定](docs/setup-custom-gpt.md)
- [GitHub 側の設定](docs/setup-github.md)
- [Cloudflare 側の設定](docs/setup-cloudflare.md)
- [ユースケース別の実装方針](docs/use-cases.md)
- [運用・修正・自動テストの流れ](docs/operations.md)
- [安全性・規約・コンプライアンス](docs/security-and-compliance.md)

## 重要な安全設計

- ライブ取引は `ALLOW_LIVE_TRADING=false` が初期値です。
- いきなり本番売買や本番発注をしないため、`APPROVAL_REQUIRED=true` を初期値にしています。
- スクレイピングではなく、正規 API / 許諾済みデータソースを優先します。
- Custom GPT からの API 呼び出しは Bearer Token で保護します。
- 本番デプロイは GitHub Environments と Secrets を使って管理する前提です。
