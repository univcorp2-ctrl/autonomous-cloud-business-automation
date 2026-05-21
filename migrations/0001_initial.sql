CREATE TABLE IF NOT EXISTS job_runs (
  id TEXT PRIMARY KEY,
  scenario TEXT NOT NULL,
  dry_run INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL,
  message TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS report_items (
  id TEXT PRIMARY KEY,
  job_id TEXT NOT NULL,
  scenario TEXT NOT NULL,
  title TEXT NOT NULL,
  score REAL NOT NULL,
  summary TEXT NOT NULL,
  metrics_json TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY(job_id) REFERENCES job_runs(id)
);

CREATE INDEX IF NOT EXISTS idx_report_items_created_at ON report_items(created_at);
CREATE INDEX IF NOT EXISTS idx_job_runs_created_at ON job_runs(created_at);
