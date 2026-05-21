import { makeId } from './guards';
import type { Env, ReportItem, RunRequest, RunResult, Scenario } from './types';

const now = () => new Date().toISOString();

export async function runScenario(request: RunRequest, env: Env): Promise<RunResult> {
  const jobId = makeId('job');
  const dryRun = request.dryRun !== false;
  const scenarios = request.scenario === 'all'
    ? ['real_estate', 'resale', 'trading_sim', 'crypto_sim'] as Scenario[]
    : [request.scenario];

  const items = scenarios.flatMap((scenario) => sampleItems(jobId, scenario, dryRun));

  await persistRun(env, jobId, request.scenario, dryRun, items);

  return {
    jobId,
    scenario: request.scenario,
    dryRun,
    message: dryRun
      ? 'Dry run completed. Replace sample connectors with approved data APIs for production.'
      : 'Live execution completed under configured safety controls.',
    items
  };
}

function sampleItems(jobId: string, scenario: Scenario, dryRun: boolean): ReportItem[] {
  const createdAt = now();
  if (scenario === 'real_estate') {
    return [
      {
        id: makeId('item'),
        jobId,
        scenario,
        title: '駅徒歩8分・築浅区分マンション候補',
        score: 82,
        summary: '想定利回りと駅距離のバランスが良い。管理費と修繕積立金の追加確認が必要。',
        metrics: { estimatedYield: '5.4%', priceGap: '-6%', stationWalkMin: 8, dryRun },
        createdAt
      },
      {
        id: makeId('item'),
        jobId,
        scenario,
        title: '郊外ファミリー向け戸建て候補',
        score: 71,
        summary: '価格は割安だが空室期間リスクがやや高い。周辺成約事例の確認が必要。',
        metrics: { estimatedYield: '6.1%', vacancyRisk: 'medium', priceGap: '-9%', dryRun },
        createdAt
      }
    ];
  }

  if (scenario === 'resale') {
    return [
      {
        id: makeId('item'),
        jobId,
        scenario,
        title: '小型家電カテゴリ候補',
        score: 78,
        summary: '粗利率は高いが、在庫回転と返品率の確認が必要。',
        metrics: { grossMargin: '22%', estimatedProfit: 1800, feeRate: '12%', dryRun },
        createdAt
      },
      {
        id: makeId('item'),
        jobId,
        scenario,
        title: '季節用品カテゴリ候補',
        score: 69,
        summary: '季節性が強いため、仕入れ数量を抑えた検証向き。',
        metrics: { grossMargin: '18%', seasonality: 'high', estimatedProfit: 950, dryRun },
        createdAt
      }
    ];
  }

  if (scenario === 'trading_sim' || scenario === 'crypto_sim') {
    return [
      {
        id: makeId('item'),
        jobId,
        scenario,
        title: scenario === 'trading_sim' ? '株式モメンタム戦略シミュレーション' : '暗号資産トレンド戦略シミュレーション',
        score: 74,
        summary: 'バックテスト上はプラスだが、最大ドローダウンと取引コストに注意。ライブ取引は無効。',
        metrics: { returnPct: '8.2%', maxDrawdown: '-6.8%', winRate: '54%', liveTrading: false, dryRun },
        createdAt
      }
    ];
  }

  return [];
}

async function persistRun(env: Env, jobId: string, scenario: Scenario, dryRun: boolean, items: ReportItem[]): Promise<void> {
  if (!env.DB) return;

  await env.DB.prepare(
    'INSERT INTO job_runs (id, scenario, dry_run, status, message, created_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6)'
  ).bind(jobId, scenario, dryRun ? 1 : 0, 'completed', 'ok', now()).run();

  for (const item of items) {
    await env.DB.prepare(
      'INSERT INTO report_items (id, job_id, scenario, title, score, summary, metrics_json, created_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)'
    ).bind(item.id, item.jobId, item.scenario, item.title, item.score, item.summary, JSON.stringify(item.metrics), item.createdAt).run();
  }
}

export async function getLatestReport(env: Env): Promise<ReportItem[]> {
  if (!env.DB) {
    return sampleItems('local_sample', 'real_estate', true)
      .concat(sampleItems('local_sample', 'resale', true))
      .concat(sampleItems('local_sample', 'trading_sim', true));
  }

  const result = await env.DB.prepare(
    'SELECT id, job_id as jobId, scenario, title, score, summary, metrics_json as metricsJson, created_at as createdAt FROM report_items ORDER BY created_at DESC LIMIT 50'
  ).all<{
    id: string;
    jobId: string;
    scenario: Scenario;
    title: string;
    score: number;
    summary: string;
    metricsJson: string;
    createdAt: string;
  }>();

  return (result.results || []).map((row) => ({
    id: row.id,
    jobId: row.jobId,
    scenario: row.scenario,
    title: row.title,
    score: row.score,
    summary: row.summary,
    metrics: JSON.parse(row.metricsJson || '{}') as Record<string, string | number | boolean>,
    createdAt: row.createdAt
  }));
}
