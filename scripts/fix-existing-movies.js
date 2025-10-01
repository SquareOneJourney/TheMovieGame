#!/usr/bin/env node

/**
 * Script to fix existing movies that only have 3 actors
 * This will update movies that are missing the new actor3, actor4, actor5 fields
 */

const fs = require('fs');
const path = require('path');

const MOVIES_DB_PATH = path.join(__dirname, '..', 'data', 'movies-database.json');
const BACKUP_PATH = path.join(__dirname, '..', 'data', 'movies-database-backup-fix.json');

async function fixExistingMovies() {
  try {
    console.log('🔧 Fixing existing movies with missing actor fields...');
    
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

    // Fix movies
    console.log('🔧 Fixing movies...');
    let fixedCount = 0;
    let alreadyFixedCount = 0;

    const fixedMovies = moviesData.map(movie => {
      // Check if movie is missing the new actor fields
      if (movie.actor3 === undefined || movie.actor4 === undefined || movie.actor5 === undefined) {
        console.log(`🔧 Fixing movie: ${movie.movie}`);
        
        const fixedMovie = {
          ...movie,
          actor3: movie.actor3 || null,
          actor4: movie.actor4 || null,
          actor5: movie.actor5 || null,
          actor3Photo: movie.actor3Photo || null,
          actor4Photo: movie.actor4Photo || null,
          actor5Photo: movie.actor5Photo || null
        };

        fixedCount++;
        return fixedMovie;
      } else {
        alreadyFixedCount++;
        return movie;
      }
    });

    // Write fixed data
    console.log('💾 Writing fixed data...');
    fs.writeFileSync(MOVIES_DB_PATH, JSON.stringify(fixedMovies, null, 2));

    console.log('✅ Fix completed!');
    console.log(`📊 Statistics:`);
    console.log(`   - Fixed: ${fixedCount} movies`);
    console.log(`   - Already fixed: ${alreadyFixedCount} movies`);
    console.log(`   - Total: ${moviesData.length} movies`);
    console.log(`📦 Backup saved at: ${BACKUP_PATH}`);

    // Show sample of fixed movies
    if (fixedCount > 0) {
      console.log('\n📋 Sample of fixed movies:');
      fixedMovies.slice(0, 3).forEach(movie => {
        console.log(`   - ${movie.movie}: ${movie.actor1}, ${movie.actor2}, ${movie.actor3 || 'null'}, ${movie.actor4 || 'null'}, ${movie.actor5 || 'null'}`);
      });
    }

  } catch (error) {
    console.error('❌ Fix failed:', error);
    process.exit(1);
  }
}

// Run fix
fixExistingMovies();
