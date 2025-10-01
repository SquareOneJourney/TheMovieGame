#!/usr/bin/env node

/**
 * Migration script to update existing movies to support 5 actors
 * This script will:
 * 1. Read the current movies database
 * 2. Update the schema to include actor3, actor4, actor5 fields
 * 3. Preserve existing data while adding new fields
 * 4. Create a backup before making changes
 */

const fs = require('fs');
const path = require('path');

const MOVIES_DB_PATH = path.join(__dirname, '..', 'data', 'movies-database.json');
const BACKUP_PATH = path.join(__dirname, '..', 'data', 'movies-database-backup-5-actors.json');

async function migrateMovies() {
  try {
    console.log('🔄 Starting migration to 5 actors...');
    
    // Check if movies database exists
    if (!fs.existsSync(MOVIES_DB_PATH)) {
      console.error('❌ Movies database not found at:', MOVIES_DB_PATH);
      process.exit(1);
    }

    // Create backup
    console.log('📦 Creating backup...');
    const moviesData = JSON.parse(fs.readFileSync(MOVIES_DB_PATH, 'utf8'));
    fs.writeFileSync(BACKUP_PATH, JSON.stringify(moviesData, null, 2));
    console.log('✅ Backup created at:', BACKUP_PATH);

    // Migrate movies
    console.log('🔄 Migrating movies...');
    let migratedCount = 0;
    let skippedCount = 0;

    const migratedMovies = moviesData.map(movie => {
      // Check if movie already has the new fields
      if (movie.actor3 !== undefined) {
        skippedCount++;
        return movie;
      }

      // Add new actor fields (empty by default)
      const migratedMovie = {
        ...movie,
        actor3: null,
        actor4: null,
        actor5: null,
        actor3Photo: null,
        actor4Photo: null,
        actor5Photo: null
      };

      migratedCount++;
      return migratedMovie;
    });

    // Write migrated data
    console.log('💾 Writing migrated data...');
    fs.writeFileSync(MOVIES_DB_PATH, JSON.stringify(migratedMovies, null, 2));

    console.log('✅ Migration completed!');
    console.log(`📊 Statistics:`);
    console.log(`   - Migrated: ${migratedCount} movies`);
    console.log(`   - Skipped: ${skippedCount} movies (already migrated)`);
    console.log(`   - Total: ${moviesData.length} movies`);
    console.log(`📦 Backup saved at: ${BACKUP_PATH}`);

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
migrateMovies();
