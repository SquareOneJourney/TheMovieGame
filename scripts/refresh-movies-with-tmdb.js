#!/usr/bin/env node

/**
 * Script to refresh movies with fresh TMDB data to get all 5 actors
 * This will update movies that have null values for actor3, actor4, actor5
 */

const fs = require('fs');
const path = require('path');

const MOVIES_DB_PATH = path.join(__dirname, '..', 'data', 'movies-database.json');
const BACKUP_PATH = path.join(__dirname, '..', 'data', 'movies-database-backup-refresh.json');

// Function to search for movie on TMDB
async function searchMovieOnTMDB(movieTitle) {
  try {
    const response = await fetch(`/api/tmdb/search?query=${encodeURIComponent(movieTitle)}`);
    if (!response.ok) return null;
    
    const data = await response.json();
    return data.results?.[0] || null;
  } catch (error) {
    console.error(`Error searching for ${movieTitle}:`, error.message);
    return null;
  }
}

// Function to get movie details from TMDB
async function getMovieDetailsFromTMDB(tmdbId) {
  try {
    const response = await fetch(`/api/tmdb/movie/${tmdbId}`);
    if (!response.ok) return null;
    
    return await response.json();
  } catch (error) {
    console.error(`Error getting details for TMDB ID ${tmdbId}:`, error.message);
    return null;
  }
}

async function refreshMoviesWithTMDB() {
  try {
    console.log('🔄 Refreshing movies with TMDB data...');
    
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

    // Find movies that need refreshing (have null values for actor3, actor4, actor5)
    const moviesToRefresh = moviesData.filter(movie => 
      !movie.actor3 || !movie.actor4 || !movie.actor5
    );

    console.log(`🔍 Found ${moviesToRefresh.length} movies that need refreshing`);

    if (moviesToRefresh.length === 0) {
      console.log('✅ All movies already have 5 actors!');
      return;
    }

    let refreshedCount = 0;
    let failedCount = 0;

    // Process movies in batches to avoid overwhelming the API
    const batchSize = 5;
    for (let i = 0; i < moviesToRefresh.length; i += batchSize) {
      const batch = moviesToRefresh.slice(i, i + batchSize);
      
      console.log(`\n🔄 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(moviesToRefresh.length / batchSize)}`);
      
      const promises = batch.map(async (movie) => {
        try {
          console.log(`   🔍 Searching for: ${movie.movie}`);
          
          // Search for movie on TMDB
          const searchResult = await searchMovieOnTMDB(movie.movie);
          if (!searchResult) {
            console.log(`   ❌ No TMDB result for: ${movie.movie}`);
            return { movie, success: false };
          }

          // Get detailed movie information
          const movieDetails = await getMovieDetailsFromTMDB(searchResult.id);
          if (!movieDetails) {
            console.log(`   ❌ No details for: ${movie.movie}`);
            return { movie, success: false };
          }

          // Update movie with new actor data
          const updatedMovie = {
            ...movie,
            actor3: movieDetails.actor3 || null,
            actor4: movieDetails.actor4 || null,
            actor5: movieDetails.actor5 || null,
            actor3Photo: movieDetails.actor3Photo || null,
            actor4Photo: movieDetails.actor4Photo || null,
            actor5Photo: movieDetails.actor5Photo || null
          };

          console.log(`   ✅ Updated: ${movie.movie} - Actors: ${movieDetails.actor1}, ${movieDetails.actor2}, ${movieDetails.actor3 || 'null'}, ${movieDetails.actor4 || 'null'}, ${movieDetails.actor5 || 'null'}`);
          return { movie: updatedMovie, success: true };

        } catch (error) {
          console.error(`   ❌ Error processing ${movie.movie}:`, error.message);
          return { movie, success: false };
        }
      });

      const results = await Promise.all(promises);
      
      // Update the movies array with results
      results.forEach(({ movie, success }) => {
        const index = moviesData.findIndex(m => m.movie === movie.movie);
        if (index !== -1) {
          moviesData[index] = movie;
          if (success) refreshedCount++;
          else failedCount++;
        }
      });

      // Add delay between batches to be respectful to TMDB API
      if (i + batchSize < moviesToRefresh.length) {
        console.log('   ⏳ Waiting 2 seconds before next batch...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    // Write updated data
    console.log('\n💾 Writing updated data...');
    fs.writeFileSync(MOVIES_DB_PATH, JSON.stringify(moviesData, null, 2));

    console.log('✅ Refresh completed!');
    console.log(`📊 Statistics:`);
    console.log(`   - Refreshed: ${refreshedCount} movies`);
    console.log(`   - Failed: ${failedCount} movies`);
    console.log(`   - Total processed: ${refreshedCount + failedCount} movies`);
    console.log(`📦 Backup saved at: ${BACKUP_PATH}`);

  } catch (error) {
    console.error('❌ Refresh failed:', error);
    process.exit(1);
  }
}

// Note: This script requires the Next.js server to be running to access the TMDB API endpoints
console.log('⚠️  Note: Make sure your Next.js development server is running before executing this script');
console.log('   Run: npm run dev (in another terminal)');
console.log('   Then run this script\n');

// Run refresh
refreshMoviesWithTMDB();
