-- Create weekly exercise plans table
CREATE TABLE IF NOT EXISTS weekly_exercise_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan_name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_duration_minutes INTEGER NOT NULL DEFAULT 0,
  estimated_calories INTEGER NOT NULL DEFAULT 0,
  plan_data JSONB NOT NULL, -- Complete plan structure
  is_active BOOLEAN DEFAULT true,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes for better performance
CREATE INDEX idx_weekly_exercise_plans_user_id ON weekly_exercise_plans(user_id);
CREATE INDEX idx_weekly_exercise_plans_start_date ON weekly_exercise_plans(start_date);
CREATE INDEX idx_weekly_exercise_plans_active ON weekly_exercise_plans(is_active);

-- Enable RLS
ALTER TABLE weekly_exercise_plans ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own weekly exercise plans"
  ON weekly_exercise_plans
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own weekly exercise plans"
  ON weekly_exercise_plans
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own weekly exercise plans"
  ON weekly_exercise_plans
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own weekly exercise plans"
  ON weekly_exercise_plans
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_weekly_exercise_plans_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_weekly_exercise_plans_updated_at
  BEFORE UPDATE ON weekly_exercise_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_weekly_exercise_plans_updated_at();
