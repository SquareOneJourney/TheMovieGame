-- Row Level Security (RLS) Policies for The Movie Game
-- Run these in your Supabase SQL Editor

-- Enable RLS on all tables
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Game" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Round" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Movie" ENABLE ROW LEVEL SECURITY;

-- User table policies
-- Users can only see and modify their own data
CREATE POLICY "Users can view own profile" ON "User"
    FOR SELECT USING (auth.uid()::text = id);

CREATE POLICY "Users can update own profile" ON "User"
    FOR UPDATE USING (auth.uid()::text = id);

-- Game table policies
-- Users can only see games they're part of
CREATE POLICY "Users can view games they participate in" ON "Game"
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM unnest(players) AS player_id 
            WHERE player_id = auth.uid()::text
        )
    );

-- Users can create games
CREATE POLICY "Users can create games" ON "Game"
    FOR INSERT WITH CHECK (true);

-- Users can update games they participate in
CREATE POLICY "Users can update games they participate in" ON "Game"
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM unnest(players) AS player_id 
            WHERE player_id = auth.uid()::text
        )
    );

-- Round table policies
-- Users can only see rounds from games they participate in
CREATE POLICY "Users can view rounds from their games" ON "Round"
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM "Game" 
            WHERE "Game".id = "Round"."gameId" 
            AND EXISTS (
                SELECT 1 FROM unnest("Game".players) AS player_id 
                WHERE player_id = auth.uid()::text
            )
        )
    );

-- Users can create rounds in games they participate in
CREATE POLICY "Users can create rounds in their games" ON "Round"
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM "Game" 
            WHERE "Game".id = "Round"."gameId" 
            AND EXISTS (
                SELECT 1 FROM unnest("Game".players) AS player_id 
                WHERE player_id = auth.uid()::text
            )
        )
    );

-- Users can update rounds in games they participate in
CREATE POLICY "Users can update rounds in their games" ON "Round"
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM "Game" 
            WHERE "Game".id = "Round"."gameId" 
            AND EXISTS (
                SELECT 1 FROM unnest("Game".players) AS player_id 
                WHERE player_id = auth.uid()::text
            )
        )
    );

-- Movie table policies
-- Movies are public (anyone can read)
CREATE POLICY "Movies are publicly readable" ON "Movie"
    FOR SELECT USING (true);

-- Only authenticated users can create movies
CREATE POLICY "Authenticated users can create movies" ON "Movie"
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

