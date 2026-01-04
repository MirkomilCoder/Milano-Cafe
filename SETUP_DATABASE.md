# Database Setup Instructions

## Online Users Feature

To enable the online users tracking feature, you need to create a `user_sessions` table in your Supabase database.

### Step 1: Go to Supabase SQL Editor

1. Open your Supabase dashboard
2. Go to **SQL Editor**
3. Click **New Query**

### Step 2: Copy and Run the SQL Script

Copy the following SQL and paste it into the SQL editor:

```sql
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_last_activity ON user_sessions(last_activity);

-- Enable RLS (Row Level Security)
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "admins_can_view_all_sessions" ON user_sessions
  FOR SELECT USING (
    (auth.jwt()->>'role' = 'authenticated' AND 
     (auth.jwt()->'user_metadata'->>'is_admin')::boolean = true)
    OR auth.uid() = user_id
  );

CREATE POLICY "users_can_view_own_session" ON user_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "system_can_insert_sessions" ON user_sessions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "system_can_update_sessions" ON user_sessions
  FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "system_can_delete_sessions" ON user_sessions
  FOR DELETE USING (true);
```

### Step 3: Execute the Query

Click **RUN** to execute the SQL script.

### If you get an error with RLS policies:

Use this simpler version that allows all authenticated users:

```sql
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_last_activity ON user_sessions(last_activity);

-- Enable RLS (Row Level Security)
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- Simple RLS Policies (Allow all authenticated users)
CREATE POLICY "all_users_can_view_all_sessions" ON user_sessions
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "all_users_can_insert_sessions" ON user_sessions
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "all_users_can_update_sessions" ON user_sessions
  FOR UPDATE USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "all_users_can_delete_sessions" ON user_sessions
  FOR DELETE USING (auth.role() = 'authenticated');
```

### Step 4: Verify

You should see "user_sessions" table in the **Tables** section of your Supabase dashboard.

## Features After Setup

Once the table is created, the application will automatically:

1. **Track User Sessions**: When a user logs in, their session is recorded in the database
2. **Update Activity**: User activity is updated every 30 seconds
3. **Show Online Users**: Admin dashboard will show:
   - "Barcha foydalanuvchilar" (All users) - list of all registered users
   - "Online" tab - real-time list of currently online users
4. **Real-time Updates**: The online users list updates in real-time using Supabase subscriptions
5. **Automatic Cleanup**: When a user logs out, their session is automatically deleted

## Troubleshooting

### Table not appearing?
- Make sure you ran the SQL script
- Check that the table name is `user_sessions`
- Verify RLS policies are enabled
- Try running the "Simple RLS Policies" version if the first one fails

### Online users not showing?
- Check browser console for errors
- Verify the user_sessions table was created
- Make sure user has a valid session
- Check that Supabase realtime subscriptions are enabled
- Try logging in again after creating the table

### Users not appearing in online list?
- Refresh the page after logging in
- Wait a few seconds for the session to be created
- Check the "All Users" tab to verify the user account exists
- Check browser Network tab for Supabase API errors

### Error: "column users.user_metadata does not exist"
- Use the **Simple RLS Policies** version instead
- This is a Supabase version/configuration difference

### Error: CREATE TABLE already exists
- This is normal if you already ran the script
- The `IF NOT EXISTS` clause prevents errors on re-runs
- You can continue, the table is already created

## How It Works

1. **User Logs In** → `createUserSession()` action runs → Session record created in `user_sessions` table
2. **User is Active** → `useUserPresence()` hook → Every 30 seconds `updateUserActivity()` updates the timestamp
3. **User Views Admin Panel** → Real-time subscription to `user_sessions` table → Shows online users
4. **User Logs Out** → `deleteUserSession()` action runs → Session record deleted → User disappears from online list
5. **5+ Minutes Inactive** → Admin dashboard auto-filters out sessions (only shows last 5 minutes of activity)

## Testing the Feature

1. **Create admin user** (set `is_admin: true` in user metadata)
2. **Login as regular user** on one browser
3. **Login as admin** on another browser
4. **Go to Admin Panel → Foydalanuvchilar (Users)**
5. **Click "Online" tab** → Should see the logged-in user
6. **User logs out** → User disappears from online list in real-time

## Performance Tips

- The indexes on `user_id` and `last_activity` improve query performance
- Sessions older than 5 minutes are automatically hidden in the admin panel
- Increase the heartbeat interval (currently 30 seconds) if you want less database writes
- Decrease it if you want more real-time accuracy
