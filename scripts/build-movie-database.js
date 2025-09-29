const fs = require('fs');
const path = require('path');

// TMDB API configuration
const TMDB_BEARER_TOKEN = process.env.TMDB_BEARER_TOKEN || "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJlMjU2NzhhNjcyNWY4YTE5YWY3ODgxOTBlNzlmN2U1NyIsIm5iZiI6MTc1ODk1NzE5MS41OTM5OTk5LCJzdWIiOiI2OGQ3OGU4N2ViMjE0ZjUxMzRlMWJjOTciLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.EIEPw0yQpcgxYToSTXxyUuLlR4d5i6Sbw37s98Coaas";
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

// Mainstream genres only (exclude animation, horror, niche genres)
const MAINSTREAM_GENRES = [
  '28', // Action
  '12', // Adventure  
  '35', // Comedy
  '18', // Drama
  '878', // Sci-Fi
  '53', // Thriller
  '10751', // Family
  '80', // Crime
  '9648', // Mystery
  '14', // Fantasy
  '10749', // Romance
  '36' // History
];

// Year ranges with weights (only released movies)
const YEAR_RANGES = [
  { gte: '2020', lte: '2024', name: 'Recent', weight: 3 },
  { gte: '2010', lte: '2019', name: '2010s', weight: 3 },
  { gte: '2000', lte: '2009', name: '2000s', weight: 2 },
  { gte: '1990', lte: '1999', name: '1990s', weight: 2 },
  { gte: '1980', lte: '1989', name: '1980s', weight: 1 }
];

async function fetchFromTMDB(endpoint) {
  const url = `${TMDB_BASE_URL}${endpoint}`;
  console.log(`🌐 Fetching: ${url}`);
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${TMDB_BEARER_TOKEN}`,
      'accept': 'application/json'
    }
  });
  
  if (!response.ok) {
    throw new Error(`TMDB API error: ${response.status} ${response.statusText}`);
  }
  
  return await response.json();
}

async function fetchMovies() {
  console.log('🎬 Starting movie database build...');
  const allMovies = [];
  const existingIds = new Set();
  
  // Fetch from discover endpoint with mainstream filtering
  for (const genre of MAINSTREAM_GENRES) {
    for (const yearRange of YEAR_RANGES) {
      const pagesToFetch = Math.min(3, yearRange.weight);
      for (let page = 1; page <= pagesToFetch; page++) {
        try {
          const discoverUrl = `${TMDB_BASE_URL}/discover/movie?` + new URLSearchParams({
            'sort_by': 'popularity.desc',
            'with_genres': genre,
            'primary_release_date.gte': yearRange.gte,
            'primary_release_date.lte': yearRange.lte,
            'vote_average.gte': '6.0',
            'vote_count.gte': '400',
            'with_original_language': 'en',
            'with_runtime.gte': '60',
            'certification_country': 'US',
            'page': page.toString()
          });
          
          const data = await fetchFromTMDB(discoverUrl);
          data.results.forEach(movie => {
            if (!existingIds.has(movie.id)) {
              allMovies.push(movie);
              existingIds.add(movie.id);
            }
          });
          
          console.log(`✅ Fetched ${data.results.length} movies for ${genre} ${yearRange.name} page ${page}`);
        } catch (error) {
          console.warn(`⚠️ Failed to fetch movies for genre ${genre}, year ${yearRange.name}:`, error.message);
        }
      }
    }
  }
  
  // Also fetch from popular sources - get more movies
  const additionalSources = [
    { url: '/movie/popular', pages: 20 },
    { url: '/movie/top_rated', pages: 20 },
    { url: '/movie/now_playing', pages: 10 }
  ];
  
  for (const source of additionalSources) {
    for (let page = 1; page <= source.pages; page++) {
      try {
        const data = await fetchFromTMDB(`${source.url}?page=${page}`);
        data.results.forEach(movie => {
          if (!existingIds.has(movie.id)) {
            allMovies.push(movie);
            existingIds.add(movie.id);
          }
        });
        console.log(`✅ Fetched ${data.results.length} movies from ${source.url} page ${page}`);
      } catch (error) {
        console.warn(`⚠️ Failed to fetch from ${source.url}:`, error.message);
      }
    }
  }
  
  console.log(`🎬 Total movies fetched: ${allMovies.length}`);
  return allMovies;
}

async function processMoviesWithCast(movies) {
  console.log('🎭 Processing movies with cast data...');
  const gameMovies = [];
  const maxMovies = Math.min(500, movies.length);
  const targetCount = 200;
  
  for (let i = 0; i < maxMovies && gameMovies.length < targetCount; i++) {
    const movie = movies[i];
    try {
      const details = await fetchFromTMDB(`/movie/${movie.id}?append_to_response=credits`);
      const cast = details.credits?.cast || details.cast || [];
      
      // Filter movies from 1980 onwards and exclude future movies
      const releaseYear = details.release_date ? new Date(details.release_date).getFullYear() : 0;
      const currentYear = new Date().getFullYear();
      
      if (releaseYear < 1980) {
        console.log(`⚠️ Skipped ${details.title}: Too old (${releaseYear})`);
        continue;
      }
      
      if (releaseYear > currentYear) {
        console.log(`⚠️ Skipped ${details.title}: Future release (${releaseYear})`);
        continue;
      }
      
      // Additional checks
      if (details.vote_count < 400) {
        console.log(`⚠️ Skipped ${details.title}: Not enough votes (${details.vote_count})`);
        continue;
      }
      
      // Get only the top 2 main actors
      const mainActors = cast
        .filter(actor => actor.order < 5)
        .slice(0, 2);
      
      if (mainActors.length >= 2) {
        // Get a third actor for hints
        const hintActor = cast
          .filter(actor => actor.order >= 2 && actor.order < 5)
          .slice(0, 1)[0];

        const gameMovie = {
          actor1: mainActors[0].name,
          actor2: mainActors[1].name,
          movie: details.title,
          year: details.release_date ? new Date(details.release_date).getFullYear().toString() : undefined,
          poster: details.poster_path ? `https://image.tmdb.org/t/p/w500${details.poster_path}` : undefined,
          hintActor: hintActor?.name,
          actor1Photo: mainActors[0].profile_path ? `https://image.tmdb.org/t/p/w185${mainActors[0].profile_path}` : undefined,
          actor2Photo: mainActors[1].profile_path ? `https://image.tmdb.org/t/p/w185${mainActors[1].profile_path}` : undefined,
          hintActorPhoto: hintActor?.profile_path ? `https://image.tmdb.org/t/p/w185${hintActor.profile_path}` : undefined
        };
        
        gameMovies.push(gameMovie);
        console.log(`✅ Added: ${gameMovie.movie} (${gameMovie.actor1}, ${gameMovie.actor2})`);
      }
    } catch (error) {
      console.warn(`⚠️ Failed to process movie ${movie.id}:`, error.message);
    }
  }
  
  console.log(`🎬 Processed ${gameMovies.length} movies with cast data`);
  return gameMovies;
}

async function buildDatabase() {
  try {
    console.log('🚀 Building movie database...');
    
    // Fetch movies
    const movies = await fetchMovies();
    
    // Process with cast data
    const gameMovies = await processMoviesWithCast(movies);
    
    // Filter out movies without photos
    const validGameMovies = gameMovies.filter(movie => 
      movie.actor1Photo && movie.actor2Photo
    );
    
    console.log(`🎬 Filtered to ${validGameMovies.length} movies with photos`);
    
    // Use only TMDB movies with photos
    const allGameMovies = validGameMovies;
    
    // Shuffle the array
    const shuffled = allGameMovies.sort(() => Math.random() - 0.5);
    
    // Save to file
    const outputPath = path.join(__dirname, '..', 'data', 'movies-database.json');
    fs.writeFileSync(outputPath, JSON.stringify(shuffled, null, 2));
    
    console.log(`✅ Database built successfully!`);
    console.log(`📁 Saved ${allGameMovies.length} movies to ${outputPath}`);
    console.log(`🎬 Sample movies:`);
    shuffled.slice(0, 5).forEach((movie, i) => {
      console.log(`  ${i + 1}. ${movie.movie} (${movie.actor1}, ${movie.actor2})`);
    });
    
  } catch (error) {
    console.error('❌ Error building database:', error);
    process.exit(1);
  }
}

// Run the build
buildDatabase();
