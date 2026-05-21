import type { ReportItem } from './types';

export function toCsv(items: ReportItem[]): string {
  const header = ['createdAt', 'scenario', 'title', 'score', 'summary', 'metrics'];
  const rows = items.map((item) => [
    item.createdAt,
    item.scenario,
    item.title,
    String(item.score),
    item.summary,
    JSON.stringify(item.metrics)
  ]);

  return [header, ...rows].map((row) => row.map(escapeCell).join(',')).join('\n') + '\n';
}

function escapeCell(value: string): string {
  const escaped = value.replaceAll('"', '""');
  return /[",\n]/.test(escaped) ? `"${escaped}"` : escaped;
}
