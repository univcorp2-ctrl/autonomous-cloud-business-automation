# Custom GPT 側の設定

Custom GPT から一括実行したい場合は、GPT Actions を使って Cloudflare Worker の API を呼び出します。

## 1. 事前に必要なもの

- デプロイ済み Cloudflare Worker の URL
- `GPT_ACTION_TOKEN` として使うランダムな長いトークン
- `docs/custom-gpt/openapi.yaml` の `servers.url` を自分の Worker URL に変更したもの
- Custom GPT に貼り付ける Instructions: `docs/custom-gpt/instructions.md`

## 2. Cloudflare に Action 用トークンを登録

```bash
npx wrangler secret put GPT_ACTION_TOKEN
```

プロンプトが出たら、ランダムな長い文字列を貼り付けます。

## 3. Custom GPT の作成・設定

1. ChatGPT で GPT 作成画面を開く。
2. Instructions に `docs/custom-gpt/instructions.md` の内容を貼り付ける。
3. Actions を追加する。
4. Authentication は API Key / Bearer Token 方式にする。
5. Schema に `docs/custom-gpt/openapi.yaml` を貼り付ける。
6. `servers.url` を本番 Worker URL に差し替える。
7. テスト実行で `/api/health` または `/api/report` を呼び、接続を確認する。

## 4. Custom GPT でできる操作

| 指示例 | 実行されること |
|---|---|
| 不動産分析を更新して | `/api/run` に `scenario=real_estate` を送る |
| 物販候補を更新して | `/api/run` に `scenario=resale` を送る |
| 投資シミュレーションを回して | `/api/run` に `scenario=trading_sim` を送る |
| 全部更新して | `/api/run` に `scenario=all` を送る |
| 最新レポートを見せて | `/api/report` を呼ぶ |
| Excel用CSVを出して | `/api/export.csv` を案内する |

## 5. 自動修正までやる場合

Custom GPT から直接コードを書き換えるには、GitHub 側に別の Action API、または安全な中継 API が必要です。標準案は次のどちらかです。

### A案: GitHub App / GitHub Actions dispatch 方式

- Custom GPT Action が「修正内容」を中継 API に送る。
- 中継 API が GitHub の `repository_dispatch` または GitHub App 経由で workflow を起動する。
- GitHub Actions がブランチ作成、コード生成、テスト、PR作成、本番デプロイを行う。

### B案: 専用バックエンド方式

- Cloudflare Worker ではなく、Cloud Run / ECS / Fly.io などの長時間実行できるバックエンドに依頼する。
- そこでコード生成、テスト、Git push、PR、デプロイまで行う。

このテンプレートは A案を想定し、`.github/workflows/autopilot.yml` を用意しています。

## 6. ライブ取引・本番発注の扱い

初期状態では Custom GPT からライブ取引や本番発注はできません。解禁する場合でも、最低限以下が必要です。

- `ALLOW_LIVE_TRADING=true`
- 証券会社・取引所の正式 API キー
- 1回あたり発注上限
- 1日あたり損失上限
- 強制停止ボタン
- 監査ログ
- 人間の明示承認

運用ミスを避けるため、最初は必ず `dryRun=true` と paper trading / simulation で始めます。
