# Supabase Row Level Security (RLS) Setup

## What is RLS?
Row Level Security ensures that users can only access data they're authorized to see. Without RLS, anyone could potentially access all user data in your database.

## How to Set Up RLS

### Step 1: Open Supabase SQL Editor
1. Go to your Supabase project dashboard
2. Click on **SQL Editor** in the left sidebar
3. Click **New query**

### Step 2: Run the RLS Policies
1. Copy the contents of `supabase-rls-policies.sql`
2. Paste it into the SQL Editor
3. Click **Run** to execute the policies

### Step 3: Verify RLS is Enabled
1. Go to **Table Editor** in the left sidebar
2. Click on any table (e.g., "User")
3. You should now see **"RLS enabled"** instead of "unrestricted"

## What These Policies Do

### User Table
- ✅ Users can only see their own profile
- ✅ Users can only update their own profile

### Game Table  
- ✅ Users can only see games they participate in
- ✅ Users can create new games
- ✅ Users can update games they're part of

### Round Table
- ✅ Users can only see rounds from their games
- ✅ Users can create/update rounds in their games

### Friend System
- ✅ Users can only see friend requests they sent/received
- ✅ Users can only see their own friendships

### Game Invites
- ✅ Users can only see invites they sent/received
- ✅ Users can create/update/delete their own invites

## Testing RLS

After setting up RLS, test that it works:

1. **Create a test user** in your app
2. **Check Supabase Auth** - Go to Authentication → Users
3. **Check Table Editor** - Try viewing the User table
4. **Verify data isolation** - Each user should only see their own data

## Troubleshooting

If you get permission errors:
1. Make sure you're logged in as a user
2. Check that the user ID matches the data you're trying to access
3. Verify the RLS policies were applied correctly

## Security Benefits

With RLS enabled:
- 🔒 **Data Privacy** - Users can't see other users' data
- 🔒 **Secure API** - Database enforces security at the data level
- 🔒 **Production Ready** - Safe for real users and sensitive data
