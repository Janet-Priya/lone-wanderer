
-- Add columns to store insight data from quests
ALTER TABLE public.journal_entries
ADD COLUMN IF NOT EXISTS insight_summary TEXT,
ADD COLUMN IF NOT EXISTS insight_growth_advice TEXT,
ADD COLUMN IF NOT EXISTS insight_emotional_pattern TEXT;
