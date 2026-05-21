# GitHub 側の設定

## 1. Repository Secrets

GitHub のリポジトリ画面で `Settings > Secrets and variables > Actions` を開き、以下を登録します。

| Secret | 用途 |
|---|---|
| `CLOUDFLARE_API_TOKEN` | GitHub Actions から Cloudflare にデプロイするため |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare アカウント指定 |
| `WORKER_BASE_URL` | デプロイ済み Worker URL。E2E や本番確認で使用 |
| `GPT_ACTION_TOKEN` | 必要に応じて本番 API の疎通テストで使用 |
| `OPENAI_API_KEY` | AIレビューを実際に使う場合のみ |

## 2. Environment

`Settings > Environments` で `production` を作成します。

推奨設定:

- main ブランチだけデプロイ可能にする。
- 最初は Required reviewers を 1 名以上にする。
- 完全自動に移行する場合も、ライブ取引や本番発注は別の承認フローを残す。

## 3. Branch protection

`Settings > Branches` で `main` を保護します。

推奨設定:

- Pull Request 必須
- CI 成功必須
- 直接 push 禁止
- 管理者にも適用

## 4. GitHub Actions の流れ

### `.github/workflows/ci.yml`

PR / push で以下を実行します。

1. `npm ci`
2. TypeScript build
3. Unit test
4. Cloudflare Worker local 起動
5. Playwright E2E
6. レポートを artifact として保存

### `.github/workflows/deploy.yml`

main に push されたら以下を実行します。

1. build
2. unit test
3. Cloudflare deploy
4. 本番 URL に対する軽い health check

### `.github/workflows/autopilot.yml`

Custom GPT や手動実行から、修正・検証・デプロイの自動化を拡張するための入口です。

## 5. 最初の動作確認

```bash
npm install
npm run build
npm test
npm run dev
```

GitHub に push したら Actions タブで CI が通るか確認します。
