-- Row Level Security (RLS) Policies for The Movie Game with NextAuth
-- Run these in your Supabase SQL Editor

-- First, disable RLS temporarily to fix the policies
ALTER TABLE "User" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "Game" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "Round" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "Movie" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "FriendRequest" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "Friendship" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "GameInvite" DISABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON "User";
DROP POLICY IF EXISTS "Users can update own profile" ON "User";
DROP POLICY IF EXISTS "Users can view games they participate in" ON "Game";
DROP POLICY IF EXISTS "Users can create games" ON "Game";
DROP POLICY IF EXISTS "Users can update games they participate in" ON "Game";
DROP POLICY IF EXISTS "Users can view rounds from their games" ON "Round";
DROP POLICY IF EXISTS "Users can create rounds in their games" ON "Round";
DROP POLICY IF EXISTS "Users can update rounds in their games" ON "Round";
DROP POLICY IF EXISTS "Movies are publicly readable" ON "Movie";
DROP POLICY IF EXISTS "Authenticated users can create movies" ON "Movie";
DROP POLICY IF EXISTS "Users can view their friend requests" ON "FriendRequest";
DROP POLICY IF EXISTS "Users can create friend requests" ON "FriendRequest";
DROP POLICY IF EXISTS "Users can update friend requests they received" ON "FriendRequest";
DROP POLICY IF EXISTS "Users can view their friendships" ON "Friendship";
DROP POLICY IF EXISTS "Users can create friendships" ON "Friendship";
DROP POLICY IF EXISTS "Users can delete their friendships" ON "Friendship";
DROP POLICY IF EXISTS "Users can view their game invites" ON "GameInvite";
DROP POLICY IF EXISTS "Users can create game invites" ON "GameInvite";
DROP POLICY IF EXISTS "Users can update game invites they received" ON "GameInvite";
DROP POLICY IF EXISTS "Users can delete their game invites" ON "GameInvite";

-- For NextAuth, we'll use a simpler approach:
-- 1. Disable RLS for now to allow NextAuth to work
-- 2. Handle authorization at the application level instead

-- Enable RLS but with permissive policies for NextAuth
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Game" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Round" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Movie" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "FriendRequest" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Friendship" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "GameInvite" ENABLE ROW LEVEL SECURITY;

-- Create permissive policies that allow all operations
-- (Authorization will be handled at the application level)

-- User table - allow all operations
CREATE POLICY "Allow all operations on User" ON "User" FOR ALL USING (true) WITH CHECK (true);

-- Game table - allow all operations
CREATE POLICY "Allow all operations on Game" ON "Game" FOR ALL USING (true) WITH CHECK (true);

-- Round table - allow all operations
CREATE POLICY "Allow all operations on Round" ON "Round" FOR ALL USING (true) WITH CHECK (true);

-- Movie table - allow all operations
CREATE POLICY "Allow all operations on Movie" ON "Movie" FOR ALL USING (true) WITH CHECK (true);

-- FriendRequest table - allow all operations
CREATE POLICY "Allow all operations on FriendRequest" ON "FriendRequest" FOR ALL USING (true) WITH CHECK (true);

-- Friendship table - allow all operations
CREATE POLICY "Allow all operations on Friendship" ON "Friendship" FOR ALL USING (true) WITH CHECK (true);

-- GameInvite table - allow all operations
CREATE POLICY "Allow all operations on GameInvite" ON "GameInvite" FOR ALL USING (true) WITH CHECK (true);

-- Note: In production, you should implement proper RLS policies
-- that work with NextAuth's JWT tokens, but for now this will allow the app to work
