# 🚀 Quick Start - Online Users Feature

## Step 1: Create Database Table (2 minutes)

1. Open **Supabase Dashboard** → **SQL Editor**
2. Copy-paste SQL from **SETUP_DATABASE.md**
3. Click **RUN**

**If you get an error:** Use the **"Simple RLS Policies"** version in the same file.

## Step 2: Verify Table Created (1 minute)

1. Go to **Supabase Dashboard** → **Tables**
2. Look for **`user_sessions`** table
3. You should see 5 columns: `id`, `user_id`, `user_email`, `user_metadata`, `last_activity`, `created_at`

## Step 3: Test the Feature (5 minutes)

### On Computer 1 (Admin Browser):
```
1. Go to website
2. Login as ADMIN (user with is_admin: true)
3. Go to Admin Panel (if not visible, you're not admin)
4. Click "Foydalanuvchilar" (Users)
5. Click "Online" tab
6. It should be empty (you'll see yourself here if you use the app)
```

### On Computer 2 (or New Tab):
```
1. Go to website in INCOGNITO/PRIVATE mode
2. Login as REGULAR USER
3. After login, you'll automatically tracked
4. Go back to Computer 1 Admin Panel
5. Click "Online" tab
6. You should see the user there NOW! ✨
```

### Continue Testing:
```
7. Computer 2 User closes browser OR clicks Logout
8. Go back to Computer 1 Admin Panel
9. Refresh the page
10. User disappears from "Online" tab ✨
```

## What's Working

| Feature | Status |
|---------|--------|
| Register new user | ✅ Works |
| Login creates session | ✅ Works (auto) |
| Admin sees all users | ✅ Works |
| Admin sees online users | ✅ Real-time |
| User details popup | ✅ Works |
| Make/remove admin | ✅ Works |
| Ban/unban user | ✅ Works |
| Delete user | ✅ Works |
| User edits profile | ✅ Works |
| Logout removes session | ✅ Auto |

## Common Issues & Fixes

### ❌ "Online" tab is empty even after login
**Fix:** 
- Refresh admin page after user logs in
- Wait 5 seconds for session to create
- Check browser console (F12) for errors

### ❌ "Online" tab shows error
**Fix:**
- Go to Supabase Dashboard
- Check if `user_sessions` table exists
- Run the SQL script again if needed

### ❌ User details don't show phone/address
**Fix:**
- This is normal - user needs to edit their profile first
- User goes to "Profilim" (My Profile) → Click "Tahrirlash" (Edit)
- Fill in phone/address and click "Saqlash" (Save)

### ❌ Can't see "Online" users even though table exists
**Fix:**
- Make sure you're logged in as ADMIN
- Check browser console for real-time subscription errors
- Try logging out and logging back in

## Next Steps

After setup is working:

1. **User Experience:** Test with multiple users logging in/out
2. **Performance:** Check if database queries are fast (should be instant)
3. **Customization:** 
   - Change heartbeat from 30 seconds to 60 seconds (less DB writes)
   - Adjust "online duration" from 5 minutes to 10 minutes
   - See USERS_FEATURE.md for details

## File Locations

All new code is in these files:
- Backend: `app/auth/session-actions.ts`
- Frontend: `hooks/use-user-presence.ts`
- Admin Panel: `app/admin/users/users-management.tsx`
- Profile: `app/profile/profile-content.tsx`

## Emergency Reset

If something breaks completely:

1. Go to Supabase SQL Editor
2. Run: `DROP TABLE user_sessions CASCADE;`
3. Redo Step 1 (Create Database Table)

## Getting Help

Check these files for detailed info:
- `SETUP_DATABASE.md` - Database setup & troubleshooting
- `USERS_FEATURE.md` - Complete feature documentation
- Browser console (F12) - Debug logs during testing

---

**Done!** Your online users feature is ready. 🎉
