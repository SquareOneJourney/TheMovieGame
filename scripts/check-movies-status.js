#!/usr/bin/env node

/**
 * Script to check the current status of movies in the database
 * Shows how many movies have 3 actors vs 5 actors
 */

const fs = require('fs');
const path = require('path');

const MOVIES_DB_PATH = path.join(__dirname, '..', 'data', 'movies-database.json');

async function checkMoviesStatus() {
  try {
    console.log('📊 Checking movies database status...');
    
    // Check if movies database exists
    if (!fs.existsSync(MOVIES_DB_PATH)) {
      console.error('❌ Movies database not found at:', MOVIES_DB_PATH);
      process.exit(1);
    }

    const moviesData = JSON.parse(fs.readFileSync(MOVIES_DB_PATH, 'utf8'));
    
    let threeActorMovies = 0;
    let fiveActorMovies = 0;
    let otherMovies = 0;
    
    const threeActorList = [];
    const fiveActorList = [];

    moviesData.forEach(movie => {
      const hasActor3 = movie.actor3 !== undefined;
      const hasActor4 = movie.actor4 !== undefined;
      const hasActor5 = movie.actor5 !== undefined;
      
      if (hasActor3 && hasActor4 && hasActor5) {
        fiveActorMovies++;
        fiveActorList.push(movie.movie);
      } else if (!hasActor3 && !hasActor4 && !hasActor5) {
        threeActorMovies++;
        threeActorList.push(movie.movie);
      } else {
        otherMovies++;
      }
    });

    console.log('📊 Movies Database Status:');
    console.log(`   - Total movies: ${moviesData.length}`);
    console.log(`   - 3-actor movies: ${threeActorMovies}`);
    console.log(`   - 5-actor movies: ${fiveActorMovies}`);
    console.log(`   - Other (partial): ${otherMovies}`);
    
    if (threeActorMovies > 0) {
      console.log('\n🔍 Movies with only 3 actors:');
      threeActorList.slice(0, 10).forEach(movie => {
        console.log(`   - ${movie}`);
      });
      if (threeActorList.length > 10) {
        console.log(`   ... and ${threeActorList.length - 10} more`);
      }
    }
    
    if (fiveActorMovies > 0) {
      console.log('\n✅ Movies with 5 actors:');
      fiveActorList.slice(0, 5).forEach(movie => {
        console.log(`   - ${movie}`);
      });
      if (fiveActorList.length > 5) {
        console.log(`   ... and ${fiveActorList.length - 5} more`);
      }
    }

    console.log('\n💡 Recommendation:');
    if (threeActorMovies > 0) {
      console.log('   Run: node scripts/fix-existing-movies.js');
    } else {
      console.log('   All movies are up to date!');
    }

  } catch (error) {
    console.error('❌ Check failed:', error);
    process.exit(1);
  }
}

// Run check
checkMoviesStatus();
