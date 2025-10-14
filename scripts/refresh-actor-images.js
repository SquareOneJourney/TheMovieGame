#!/usr/bin/env node

/**
 * Script to refresh actor images in movies.json using TMDB API
 * This will fetch current actor photos and update the movies.json file
 */

const fs = require('fs');
const path = require('path');

// TMDB API configuration
const TMDB_BEARER_TOKEN = process.env.TMDB_BEARER_TOKEN || "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJlMjU2NzhhNjcyNWY4YTE5YWY3ODgxOTBlNzlmN2U1NyIsIm5iZiI6MTc1ODk1NzE5MS41OTM5OTk5LCJzdWIiOiI2OGQ3OGU4N2ViMjE0ZjUxMzRlMWJjOTciLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.EIEPw0yQpcgxYToSTXxyUuLlR4d5i6Sbw37s98Coaas";
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

// Load current movies
const moviesPath = path.join(__dirname, '../data/movies.json');
const movies = JSON.parse(fs.readFileSync(moviesPath, 'utf8'));

console.log(`🎬 Found ${movies.length} movies to update`);

// Function to search for actor on TMDB
async function searchActor(actorName) {
  try {
    const response = await fetch(`${TMDB_BASE_URL}/search/person?query=${encodeURIComponent(actorName)}&page=1`, {
      headers: {
        'Authorization': `Bearer ${TMDB_BEARER_TOKEN}`,
        'accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }

    const data = await response.json();
    return data.results[0]; // Return first result (most likely match)
  } catch (error) {
    console.error(`❌ Error searching for actor "${actorName}":`, error.message);
    return null;
  }
}

// Function to get actor details with profile image
async function getActorDetails(actorId) {
  try {
    const response = await fetch(`${TMDB_BASE_URL}/person/${actorId}`, {
      headers: {
        'Authorization': `Bearer ${TMDB_BEARER_TOKEN}`,
        'accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`❌ Error getting actor details for ID ${actorId}:`, error.message);
    return null;
  }
}

// Function to update a single movie
async function updateMovieImages(movie, index) {
  console.log(`\n🎭 Updating movie ${index + 1}/${movies.length}: "${movie.movie}"`);
  
  const updatedMovie = { ...movie };
  let hasUpdates = false;

  // Update actor1 photo
  if (movie.actor1) {
    console.log(`  🔍 Searching for "${movie.actor1}"...`);
    const actor1Result = await searchActor(movie.actor1);
    if (actor1Result) {
      const actor1Details = await getActorDetails(actor1Result.id);
      if (actor1Details && actor1Details.profile_path) {
        const newPhoto = `https://image.tmdb.org/t/p/w185${actor1Details.profile_path}`;
        if (newPhoto !== movie.actor1Photo) {
          updatedMovie.actor1Photo = newPhoto;
          hasUpdates = true;
          console.log(`  ✅ Updated ${movie.actor1} photo`);
        } else {
          console.log(`  ⏭️  ${movie.actor1} photo already current`);
        }
      } else {
        console.log(`  ⚠️  No photo found for ${movie.actor1}`);
      }
    } else {
      console.log(`  ❌ Could not find ${movie.actor1} on TMDB`);
    }
  }

  // Update actor2 photo
  if (movie.actor2) {
    console.log(`  🔍 Searching for "${movie.actor2}"...`);
    const actor2Result = await searchActor(movie.actor2);
    if (actor2Result) {
      const actor2Details = await getActorDetails(actor2Result.id);
      if (actor2Details && actor2Details.profile_path) {
        const newPhoto = `https://image.tmdb.org/t/p/w185${actor2Details.profile_path}`;
        if (newPhoto !== movie.actor2Photo) {
          updatedMovie.actor2Photo = newPhoto;
          hasUpdates = true;
          console.log(`  ✅ Updated ${movie.actor2} photo`);
        } else {
          console.log(`  ⏭️  ${movie.actor2} photo already current`);
        }
      } else {
        console.log(`  ⚠️  No photo found for ${movie.actor2}`);
      }
    } else {
      console.log(`  ❌ Could not find ${movie.actor2} on TMDB`);
    }
  }

  // Update hint actor photo
  if (movie.hintActor) {
    console.log(`  🔍 Searching for "${movie.hintActor}"...`);
    const hintActorResult = await searchActor(movie.hintActor);
    if (hintActorResult) {
      const hintActorDetails = await getActorDetails(hintActorResult.id);
      if (hintActorDetails && hintActorDetails.profile_path) {
        const newPhoto = `https://image.tmdb.org/t/p/w185${hintActorDetails.profile_path}`;
        if (newPhoto !== movie.hintActorPhoto) {
          updatedMovie.hintActorPhoto = newPhoto;
          hasUpdates = true;
          console.log(`  ✅ Updated ${movie.hintActor} photo`);
        } else {
          console.log(`  ⏭️  ${movie.hintActor} photo already current`);
        }
      } else {
        console.log(`  ⚠️  No photo found for ${movie.hintActor}`);
      }
    } else {
      console.log(`  ❌ Could not find ${movie.hintActor} on TMDB`);
    }
  }

  return hasUpdates ? updatedMovie : movie;
}

// Main function to update all movies
async function refreshAllImages() {
  console.log('🚀 Starting actor image refresh...\n');
  
  const updatedMovies = [];
  let totalUpdates = 0;

  for (let i = 0; i < movies.length; i++) {
    const updatedMovie = await updateMovieImages(movies[i], i);
    updatedMovies.push(updatedMovie);
    
    if (updatedMovie !== movies[i]) {
      totalUpdates++;
    }

    // Add a small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  // Save updated movies
  if (totalUpdates > 0) {
    // Create backup
    const backupPath = path.join(__dirname, `../data/movies-backup-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
    fs.writeFileSync(backupPath, JSON.stringify(movies, null, 2));
    console.log(`\n💾 Created backup: ${backupPath}`);

    // Save updated movies
    fs.writeFileSync(moviesPath, JSON.stringify(updatedMovies, null, 2));
    console.log(`\n✅ Updated ${totalUpdates} movies with fresh actor images!`);
    console.log(`📁 Saved to: ${moviesPath}`);
  } else {
    console.log(`\n✨ All actor images are already up to date!`);
  }
}

// Run the script
refreshAllImages().catch(console.error);
