-- Create user_sessions table to track online users
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  user_metadata JSONB,
  last_activity TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_last_activity ON user_sessions(last_activity);

-- Enable RLS
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- RLS policies - allow admins to view all sessions
CREATE POLICY "admins_can_view_all_sessions" ON user_sessions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.user_metadata->>'is_admin' = 'true'
    )
  );

-- Allow users to view their own session
CREATE POLICY "users_can_view_own_session" ON user_sessions
  FOR SELECT USING (auth.uid() = user_id);

-- Allow system to insert sessions
CREATE POLICY "system_can_insert_sessions" ON user_sessions
  FOR INSERT WITH CHECK (true);

-- Allow system to update sessions
CREATE POLICY "system_can_update_sessions" ON user_sessions
  FOR UPDATE USING (true) WITH CHECK (true);

-- Allow system to delete sessions
CREATE POLICY "system_can_delete_sessions" ON user_sessions
  FOR DELETE USING (true);
