# 運用・修正・自動テストの流れ

## 1. 通常運用

1. Custom GPT に「全データ更新して」と指示。
2. Custom GPT が `/api/run` を呼ぶ。
3. Worker がジョブを作成。
4. Queue / Cron / 外部 API 経由でデータを更新。
5. Web ダッシュボードと CSV に結果が反映される。

## 2. コード修正時

1. Custom GPT または開発者が修正内容を作る。
2. 新しいブランチに commit。
3. Pull Request 作成。
4. GitHub Actions が build / unit test / E2E を実行。
5. 成功したら main に merge。
6. deploy workflow が Cloudflare に本番デプロイ。
7. 本番 health check と E2E を実行。

## 3. 完全自動に近づける段階

### Phase 1: 安全な自動化

- データ収集、分析、画面表示、CSV出力を自動化。
- デプロイは人間承認あり。
- 取引・発注はシミュレーションのみ。

### Phase 2: 修正も半自動化

- Custom GPT が修正案を作る。
- GitHub Actions がテストする。
- PR は人間が確認して merge。

### Phase 3: 本番反映も自動化

- 軽微な修正は自動 merge / deploy。
- 重大変更は approval 必須。
- ライブ取引・本番発注は別承認。

## 4. 障害時の基本対応

| 症状 | 見る場所 |
|---|---|
| Web が表示されない | Cloudflare Workers Logs / GitHub Actions deploy ログ |
| データが更新されない | Queue、Cron、外部 API のレスポンス |
| CSV が空 | `/api/report` と D1 のデータ |
| E2E が落ちる | Playwright report / screenshot / trace |
| Custom GPT から呼べない | OpenAPI schema、Bearer Token、Worker URL |

## 5. ロールバック

- GitHub の過去 commit に revert する。
- GitHub Actions で再デプロイする。
- Cloudflare 側の直近 deployment を確認する。

## 6. 監視の追加候補

- Cloudflare Workers Logs
- GitHub Actions 通知
- Slack / Discord / Email 通知
- Sentry 等のエラー監視
- 毎朝 CSV / レポートを自動生成して R2 に保存
