-- Enable Row Level Security on all tables
ALTER TABLE medicines ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Policies for medicines table
CREATE POLICY "Users can view their own medicines" 
ON medicines FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own medicines" 
ON medicines FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own medicines" 
ON medicines FOR UPDATE 
USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own medicines" 
ON medicines FOR DELETE 
USING (user_id = auth.uid());

-- Policies for user_settings table
CREATE POLICY "Users can view their own settings" 
ON user_settings FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own settings" 
ON user_settings FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own settings" 
ON user_settings FOR UPDATE 
USING (user_id = auth.uid());
