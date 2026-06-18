-- Migration: 006_auth_schema.sql
-- Description: Rename patient_id to user_id in the reports table and create an index

ALTER TABLE reports RENAME COLUMN patient_id TO user_id;

CREATE INDEX IF NOT EXISTS idx_reports_user_id ON reports(user_id);

-- Reload schema cache
NOTIFY pgrst, 'reload schema';
