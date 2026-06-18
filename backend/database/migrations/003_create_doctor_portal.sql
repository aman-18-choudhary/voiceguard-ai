CREATE TABLE IF NOT EXISTS alerts (
    id TEXT PRIMARY KEY,
    report_id TEXT REFERENCES reports(id),
    severity TEXT,
    alert_type TEXT,
    status TEXT DEFAULT 'PENDING',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS doctor_notes (
    id TEXT PRIMARY KEY,
    report_id TEXT REFERENCES reports(id),
    doctor_id TEXT,
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
