CREATE TABLE IF NOT EXISTS stress_analysis (
    report_id TEXT PRIMARY KEY REFERENCES reports(id),
    stress_score INTEGER,
    stress_level TEXT,
    pitch_mean FLOAT,
    pitch_variance FLOAT,
    speech_rate FLOAT,
    rms_energy FLOAT,
    shap_explanation JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
