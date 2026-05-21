export type Scenario = 'real_estate' | 'resale' | 'trading_sim' | 'crypto_sim' | 'all';

export interface Env {
  DB?: D1Database;
  REPORTS_BUCKET?: R2Bucket;
  JOB_QUEUE?: Queue<QueuePayload>;
  GPT_ACTION_TOKEN?: string;
  OPENAI_API_KEY?: string;
  APP_ENV?: string;
  ALLOW_LIVE_TRADING?: string;
  APPROVAL_REQUIRED?: string;
  WORKER_BASE_URL?: string;
}

export interface QueuePayload {
  jobId: string;
  scenario: Scenario;
  dryRun: boolean;
  notes?: string;
  filters?: Record<string, unknown>;
}

export interface RunRequest {
  scenario: Scenario;
  dryRun?: boolean;
  notes?: string;
  filters?: Record<string, unknown>;
  live?: boolean;
}

export interface ReportItem {
  id: string;
  jobId: string;
  scenario: Scenario;
  title: string;
  score: number;
  summary: string;
  metrics: Record<string, string | number | boolean>;
  createdAt: string;
}

export interface RunResult {
  jobId: string;
  scenario: Scenario;
  dryRun: boolean;
  message: string;
  items: ReportItem[];
}
