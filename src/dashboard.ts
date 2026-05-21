import type { ReportItem } from './types';

export function dashboardHtml(items: ReportItem[]): string {
  const rows = items.map((item) => `
    <tr>
      <td>${escapeHtml(item.scenario)}</td>
      <td>${escapeHtml(item.title)}</td>
      <td><span class="score">${item.score}</span></td>
      <td>${escapeHtml(item.summary)}</td>
    </tr>`).join('');

  return `<!doctype html>
<html lang="ja">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Autonomous Business Automation</title>
  <style>
    body{font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f8fafc;color:#0f172a;margin:0}
    header{background:#0f172a;color:white;padding:28px 36px}.wrap{max-width:1100px;margin:0 auto;padding:28px}
    .cards{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px;margin:20px 0}.card{background:white;border:1px solid #e2e8f0;border-radius:16px;padding:18px;box-shadow:0 8px 22px #0f172a12}
    button,a.button{background:#2563eb;color:white;border:0;border-radius:10px;padding:10px 14px;text-decoration:none;cursor:pointer;display:inline-block;margin-right:8px}
    button.secondary{background:#475569}table{width:100%;border-collapse:collapse;background:white;border-radius:16px;overflow:hidden;box-shadow:0 8px 22px #0f172a12}th,td{border-bottom:1px solid #e2e8f0;text-align:left;padding:13px;vertical-align:top}th{background:#f1f5f9}.score{font-weight:700;color:#059669}.note{color:#475569;font-size:14px}.log{white-space:pre-wrap;background:#0f172a;color:#d1fae5;border-radius:12px;padding:14px;margin-top:16px;min-height:60px}
    @media(max-width:800px){.cards{grid-template-columns:1fr}.wrap{padding:18px}}
  </style>
</head>
<body>
  <header><div class="wrap"><h1>Autonomous Business Automation</h1><p>Custom GPT / GitHub Actions / Cloudflare による全自動化テンプレート</p></div></header>
  <main class="wrap">
    <section class="cards">
      <div class="card"><h2>不動産</h2><p class="note">物件候補、利回り、相場差分を整理します。</p><button data-scenario="real_estate">更新</button></div>
      <div class="card"><h2>物販</h2><p class="note">粗利、手数料、在庫リスクを整理します。</p><button data-scenario="resale">更新</button></div>
      <div class="card"><h2>投資シミュレーション</h2><p class="note">株式・暗号資産のバックテスト結果を整理します。</p><button data-scenario="trading_sim">更新</button></div>
    </section>
    <p><button class="secondary" data-scenario="all">全部更新</button><a class="button" href="/api/export.csv">Excel用CSV</a></p>
    <h2>最新レポート</h2>
    <table aria-label="latest reports"><thead><tr><th>種類</th><th>タイトル</th><th>スコア</th><th>概要</th></tr></thead><tbody>${rows}</tbody></table>
    <div id="log" class="log">Ready.</div>
  </main>
  <script>
    const log = document.querySelector('#log');
    document.querySelectorAll('button[data-scenario]').forEach((button) => {
      button.addEventListener('click', async () => {
        const scenario = button.dataset.scenario;
        log.textContent = 'Running ' + scenario + ' ...';
        const res = await fetch('/api/run', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ scenario, dryRun: true }) });
        const json = await res.json();
        log.textContent = JSON.stringify(json, null, 2) + '\nReloading in 1s...';
        setTimeout(() => location.reload(), 1000);
      });
    });
  </script>
</body>
</html>`;
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char] || char));
}
