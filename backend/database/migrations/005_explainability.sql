CREATE TABLE IF NOT EXISTS report_explanations (
    report_id TEXT PRIMARY KEY REFERENCES reports(id),
    severity_reason TEXT,
    confidence_reason TEXT,
    timeline_reason TEXT,
    evidence JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notify postgREST to reload schema
NOTIFY pgrst, 'reload schema';
