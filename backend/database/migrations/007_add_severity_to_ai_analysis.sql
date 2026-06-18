ALTER TABLE ai_analysis ADD COLUMN severity JSONB;

-- Force PostgREST to reload the schema cache so the API recognizes the new column
NOTIFY pgrst, 'reload schema';
