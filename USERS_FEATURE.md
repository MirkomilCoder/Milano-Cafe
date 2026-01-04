# 👥 Online Users Feature - Complete Guide

## What Was Built

A complete real-time online users tracking system for the admin dashboard with:
- **Real database integration** (Supabase `user_sessions` table)
- **Real-time updates** using Supabase subscriptions
- **User presence tracking** (automatic login/logout detection)
- **Admin dashboard** showing online & all users with detailed profiles

## Files Created/Modified

### New Files:
1. `app/auth/session-actions.ts` - Server actions for session management
2. `hooks/use-user-presence.ts` - Hook for tracking user presence
3. `lib/database-setup.sql` - SQL script for database setup
4. `SETUP_DATABASE.md` - Database setup instructions

### Modified Files:
1. `app/admin/users/users-management.tsx` - Real-time online users display
2. `app/profile/profile-content.tsx` - User presence tracking & profile editing

## Features

### Admin Dashboard Features:
✅ **"Barcha foydalanuvchilar" Tab**
- Shows all registered users from Supabase Auth
- Each user card shows:
  - Email address
  - Registration date
  - Last login time
  - Admin/User badge
  - Ban status
  - Action buttons (Make Admin, Ban, Delete, View Details)

✅ **"Online" Tab**
- Real-time list of currently active users
- Updates instantly when users login/logout
- Shows last activity timestamp
- Green "Online" badge

✅ **User Details Modal**
Shows complete user information:
- Email
- Full Name
- Phone
- Address
- Location
- Registration date
- Last login
- Current status (online/offline)
- Ban reason (if banned)

### User Profile Features:
✅ **Edit Profile**
Users can update their own information:
- Full name
- Phone number
- Address
- Location

✅ **Automatic Presence Tracking**
- Automatically tracked when user logs in
- Activity updated every 30 seconds
- Automatically cleaned up on logout

## Database Schema

```sql
user_sessions table:
- id (UUID, Primary Key)
- user_id (UUID, FK to auth.users)
- user_email (TEXT)
- user_metadata (JSONB)
- last_activity (TIMESTAMP)
- created_at (TIMESTAMP)
```

## How to Set Up

### 1. Create Database Table
Go to Supabase SQL Editor and run the script from `SETUP_DATABASE.md`

### 2. Environment Variables
No additional env vars needed - uses existing Supabase config

### 3. Deploy Changes
Just deploy the updated code - everything else is automatic

## User Flow

```
User Logs In
    ↓
useUserPresence() Hook Activates
    ↓
createUserSession() - Record added to DB
    ↓
Heartbeat Every 30 Seconds
    ↓
updateUserActivity() - Timestamp updated
    ↓
Real-time Subscription Triggers
    ↓
Admin Dashboard Updates Instantly
    ↓
User Logs Out
    ↓
deleteUserSession() - Record deleted
    ↓
Admin Dashboard Updates (User Removed)
```

## Key Functions

### Server Actions (session-actions.ts)
- `createUserSession()` - Create session on login
- `updateUserActivity()` - Update last activity
- `deleteUserSession()` - Delete session on logout
- `getAllUserSessions()` - Get active sessions for admin

### Hooks (use-user-presence.ts)
- `useUserPresence()` - Automatic presence tracking hook

## Real-time Updates

The system uses Supabase Postgres Changes to get instant updates:

```typescript
.on("postgres_changes", {
  event: "*",
  schema: "public",
  table: "user_sessions",
}, (payload) => {
  // Handle INSERT, UPDATE, DELETE events
})
```

## Performance Considerations

- Sessions older than 5 minutes are hidden from the online list
- Database indexes on `user_id` and `last_activity` for fast queries
- Heartbeat every 30 seconds (configurable in hook)
- Minimal database writes compared to presence-only solutions

## Testing

1. Create admin account
2. Open admin panel in one browser
3. Login as regular user in another browser
4. Click Admin → Users → Online tab
5. See the user appear in real-time
6. User logs out → Disappears from online list

## Troubleshooting

### Users not showing in admin panel?
- Check that user_sessions table was created
- Verify RLS policies are enabled
- Check browser console for errors
- Try refreshing the admin page

### Online users not updating in real-time?
- Verify Supabase realtime is enabled
- Check that the user_sessions subscription is active
- Look at browser Network tab for API calls

### Session action errors?
- Verify user is authenticated
- Check that user_sessions table exists
- Review browser console and server logs

## Advanced Customization

### Change Heartbeat Interval
Edit `hooks/use-user-presence.ts`:
```typescript
}, 30000)  // 30 seconds - change this value
```

### Filter Online Users by Duration
Edit `app/admin/users/users-management.tsx`:
```typescript
.gt("last_activity", new Date(Date.now() - 5 * 60 * 1000).toISOString())
// 5 * 60 * 1000 = 5 minutes - adjust as needed
```

### Add More User Metadata
Edit user metadata structure in profile editing form

## Support & Debugging

Enable debug logs by checking browser console:
- ✅ User Presence Setup
- ✅ Session Created/Updated
- 📡 Real-time Subscription Updates
- 👋 User Logout Cleanup
