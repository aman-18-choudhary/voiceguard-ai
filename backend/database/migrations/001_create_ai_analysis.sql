CREATE TABLE IF NOT EXISTS ai_analysis (
    report_id TEXT PRIMARY KEY REFERENCES reports(id),
    drugs JSONB,
    symptoms JSONB,
    timeline JSONB,
    summary TEXT,
    confidence INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
