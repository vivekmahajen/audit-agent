-- Add trial tracking to profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS trial_started_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'free'; -- already exists, safe with IF NOT EXISTS pattern above

-- Update plan column to support 'trial' | 'free' | 'pro' | 'business'
-- (existing 'free' rows stay valid; 'trial' is the new registered-but-not-paid state)

-- Daily usage tracking
CREATE TABLE IF NOT EXISTS daily_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  audit_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

ALTER TABLE daily_usage ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users see own usage" ON daily_usage FOR ALL USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Set trial_started_at for all existing free users who haven't been set yet
UPDATE profiles
SET trial_started_at = created_at
WHERE plan = 'free' AND trial_started_at IS NULL;
