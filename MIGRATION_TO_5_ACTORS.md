# Migration to 5 Actors - Implementation Guide

This document outlines the changes made to support 5 actors instead of 3, while maintaining the same UI experience (2 main actors + 1 hint actor).

## Overview

The system now fetches 5 actors from TMDB API but only displays 2 main actors + 1 hint actor in the game UI. This provides more flexibility for admins to choose which actors to display.

## Changes Made

### 1. Database Schema Updates
- **File**: `prisma/schema.prisma`
- **Changes**: Added `actor3`, `actor4`, `actor5` fields and their corresponding photo fields to both `Round` and `Movie` models
- **Fields Added**:
  - `actor3`, `actor4`, `actor5` (String?)
  - `actor3Photo`, `actor4Photo`, `actor5Photo` (String?)

### 2. TypeScript Interface Updates
- **File**: `lib/tmdb.ts`
- **Changes**: Updated `GameMovie` interface to include the new actor fields
- **Backward Compatibility**: Maintained existing fields for compatibility

### 3. TMDB API Updates
- **Files**: 
  - `app/api/tmdb/movie/[id]/route.ts`
  - `lib/tmdb.ts`
  - `app/api/movies/route.ts`
- **Changes**: Modified to fetch 5 actors instead of 3 from TMDB API
- **Backward Compatibility**: Kept `hintActor` field for compatibility

### 4. Admin UI Updates
- **File**: `app/admin/page.tsx`
- **Changes**:
  - Added 2 more actor selection spots (Actor 3, Actor 4, Actor 5)
  - Updated dropdown options to include all 5 actors
  - Added form fields for new actors
  - Updated role assignment logic to handle all 5 actors
  - Added visual indicators for each actor slot

### 5. Game Logic Updates
- **File**: `app/singleplayer/page.tsx`
- **Changes**:
  - Added `selectBestActors()` function to choose best 2 actors from 5 available
  - Updated clue passing to use selected actors
  - Maintained exact same UI experience for players

## Migration Steps

### 1. Run Database Migration
```bash
# Run Prisma migration
node scripts/run-prisma-migration.js

# Or manually:
npx prisma generate
npx prisma db push
```

### 2. Migrate Existing Data
```bash
# Migrate movies database
node scripts/migrate-to-5-actors.js
```

### 3. Verify Migration
- Check that existing movies still work
- Verify admin interface shows 5 actor slots
- Test that game UI still shows 2 main actors + 1 hint

## Backward Compatibility

- **Database**: New fields are optional (nullable)
- **API**: Existing endpoints continue to work
- **UI**: Game experience remains exactly the same
- **Data**: Existing movies are preserved and migrated

## Admin Workflow

1. **Adding Movies**: TMDB integration now fetches 5 actors
2. **Editing Movies**: Admins can now choose which 5 actors to display
3. **Role Assignment**: Admins can assign any of the 5 actors to:
   - Actor 1 (main)
   - Actor 2 (main) 
   - Actor 3 (main)
   - Actor 4 (main)
   - Actor 5 (main)
   - Hint Actor
   - Extra

## Game Logic

The game automatically selects the best 2 actors for display:
1. **Priority Order**: actor1 > actor2 > actor3 > actor4 > actor5
2. **Selection**: First 2 actors with names become main actors
3. **Hint Actor**: 3rd actor becomes hint actor (if available)
4. **Fallback**: Falls back to existing `hintActor` field if needed

## Testing

1. **Admin Interface**:
   - Add new movie from TMDB
   - Verify 5 actors are loaded
   - Test role assignment dropdown
   - Test actor swapping functionality

2. **Game Interface**:
   - Verify only 2 main actors are displayed
   - Test hint functionality
   - Ensure game experience is unchanged

3. **Data Migration**:
   - Verify existing movies still work
   - Check that new fields are properly initialized

## Rollback Plan

If issues occur, you can rollback by:
1. Restore database from backup
2. Revert code changes
3. Run: `node scripts/migrate-to-5-actors.js` (restores from backup)

## Files Modified

- `prisma/schema.prisma`
- `lib/tmdb.ts`
- `app/api/tmdb/movie/[id]/route.ts`
- `lib/tmdb.ts`
- `app/api/movies/route.ts`
- `app/admin/page.tsx`
- `app/singleplayer/page.tsx`

## New Files Created

- `scripts/migrate-to-5-actors.js`
- `scripts/run-prisma-migration.js`
- `MIGRATION_TO_5_ACTORS.md`
