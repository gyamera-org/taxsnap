-- Create reminder_settings table
CREATE TABLE IF NOT EXISTS reminder_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reminder_type TEXT NOT NULL CHECK (reminder_type IN ('daily_supplements', 'water_intake', 'exercise_reminder', 'meal_logging')),
  is_enabled BOOLEAN NOT NULL DEFAULT false,
  reminder_time TIME,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure one setting per user per reminder type
  UNIQUE(user_id, reminder_type)
);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_reminder_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER reminder_settings_updated_at
  BEFORE UPDATE ON reminder_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_reminder_settings_updated_at();

-- Enable RLS
ALTER TABLE reminder_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own reminder settings" ON reminder_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own reminder settings" ON reminder_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reminder settings" ON reminder_settings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reminder settings" ON reminder_settings
  FOR DELETE USING (auth.uid() = user_id);

-- Insert default reminder settings for existing users
INSERT INTO reminder_settings (user_id, reminder_type, is_enabled, reminder_time)
SELECT 
  id as user_id,
  reminder_type,
  false as is_enabled,
  default_time as reminder_time
FROM auth.users
CROSS JOIN (
  VALUES 
    ('daily_supplements', '08:00:00'::time),
    ('water_intake', '09:00:00'::time),
    ('exercise_reminder', '18:00:00'::time),
    ('meal_logging', '12:00:00'::time)
) AS defaults(reminder_type, default_time)
ON CONFLICT (user_id, reminder_type) DO NOTHING;

-- Create function to initialize reminder settings for new users
CREATE OR REPLACE FUNCTION initialize_reminder_settings_for_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert default reminder settings for the new user
  INSERT INTO reminder_settings (user_id, reminder_type, is_enabled, reminder_time)
  VALUES 
    (NEW.id, 'daily_supplements', false, '08:00:00'::time),
    (NEW.id, 'water_intake', false, '09:00:00'::time),
    (NEW.id, 'exercise_reminder', false, '18:00:00'::time),
    (NEW.id, 'meal_logging', false, '12:00:00'::time);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created_initialize_reminders
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION initialize_reminder_settings_for_new_user();
