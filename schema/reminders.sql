-- Create a table for reminder settings
CREATE TABLE IF NOT EXISTS reminder_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  expiry_reminder_enabled BOOLEAN NOT NULL DEFAULT true,
  dosage_reminder_enabled BOOLEAN NOT NULL DEFAULT true,
  reminder_time TIME NOT NULL DEFAULT '08:00:00',
  reminder_days_before_expiry INTEGER NOT NULL DEFAULT 7,
  notification_channels TEXT[] NOT NULL DEFAULT '{app,email}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create a table for scheduled reminders
CREATE TABLE IF NOT EXISTS scheduled_reminders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  medicine_id UUID NOT NULL REFERENCES medicines(id) ON DELETE CASCADE,
  reminder_type TEXT NOT NULL CHECK (reminder_type IN ('expiry', 'dosage')),
  scheduled_time TIMESTAMP WITH TIME ZONE NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_sent BOOLEAN NOT NULL DEFAULT false,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS policies
ALTER TABLE reminder_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_reminders ENABLE ROW LEVEL SECURITY;

-- Policies for reminder_settings
CREATE POLICY "Users can view their own reminder settings" 
ON reminder_settings FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own reminder settings" 
ON reminder_settings FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own reminder settings" 
ON reminder_settings FOR UPDATE 
USING (user_id = auth.uid());

-- Policies for scheduled_reminders
CREATE POLICY "Users can view their own scheduled reminders" 
ON scheduled_reminders FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can update their own scheduled reminders" 
ON scheduled_reminders FOR UPDATE 
USING (user_id = auth.uid());

-- Create an index for faster queries
CREATE INDEX IF NOT EXISTS idx_scheduled_reminders_user_id ON scheduled_reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_reminders_scheduled_time ON scheduled_reminders(scheduled_time);
CREATE INDEX IF NOT EXISTS idx_scheduled_reminders_is_sent ON scheduled_reminders(is_sent);
