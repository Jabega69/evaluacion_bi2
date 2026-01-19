-- Add google_tokens column to users table to store OAuth tokens
ALTER TABLE users ADD COLUMN IF NOT EXISTS google_tokens JSONB;
