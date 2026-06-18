-- Phase 6.5: Human-in-the-Loop Transcript Review

ALTER TABLE reports
ADD COLUMN original_transcript TEXT;

ALTER TABLE reports
ADD COLUMN corrected_transcript TEXT;

-- Notify postgREST to reload schema
NOTIFY pgrst, 'reload schema';
