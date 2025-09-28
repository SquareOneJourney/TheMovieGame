import { NextResponse } from 'next/server';

const TMDB_BEARER_TOKEN = process.env.TMDB_BEARER_TOKEN || "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJlMjU2NzhhNjcyNWY4YTE5YWY3ODgxOTBlNzlmN2U1NyIsIm5iZiI6MTc1ODk1NzE5MS41OTM5OTk5LCJzdWIiOiI2OGQ3OGU4N2ViMjE0ZjUxMzRlMWJjOTciLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.EIEPw0yQpcgxYToSTXxyUuLlR4d5i6Sbw37s98Coaas";
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

export async function GET() {
  try {
    console.log('🔍 Server-side TMDB_BEARER_TOKEN:', TMDB_BEARER_TOKEN ? 'Set' : 'Not set');
    
    if (!TMDB_BEARER_TOKEN) {
      return NextResponse.json({ error: 'TMDB API key not configured' }, { status: 500 });
    }

    // Test authentication first
    const authResponse = await fetch(`${TMDB_BASE_URL}/authentication`, {
      headers: {
        Authorization: `Bearer ${TMDB_BEARER_TOKEN}`,
        accept: 'application/json',
      },
    });

    if (!authResponse.ok) {
      throw new Error(`TMDB API error: ${authResponse.status} ${authResponse.statusText}`);
    }

    const authData = await authResponse.json();
    console.log('✅ TMDB Authentication successful');

    // Get movies from multiple sources for maximum variety and popularity
    const allMovies: any[] = [];
    const existingIds = new Set<number>();
    
    // Define mainstream genres only (exclude niche genres, animation, and horror)
    const mainstreamGenres = [
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
    
    // Define year ranges prioritizing recent decades for mainstream recognition
    const yearRanges = [
      { gte: '2020', lte: '2025', name: 'Recent', weight: 3 },
      { gte: '2010', lte: '2019', name: '2010s', weight: 3 },
      { gte: '2000', lte: '2009', name: '2000s', weight: 2 },
      { gte: '1990', lte: '1999', name: '1990s', weight: 2 },
      { gte: '1980', lte: '1989', name: '1980s', weight: 1 }
    ];
    
    // Fetch movies from discover endpoint with strict mainstream filtering
    for (const genre of mainstreamGenres) {
      for (const yearRange of yearRanges) {
        const pagesToFetch = Math.min(3, yearRange.weight); // More pages for recent decades
        for (let page = 1; page <= pagesToFetch; page++) {
          try {
            const discoverUrl = `${TMDB_BASE_URL}/discover/movie?` + new URLSearchParams({
              'sort_by': 'popularity.desc',
              'with_genres': genre,
              'primary_release_date.gte': yearRange.gte,
              'primary_release_date.lte': yearRange.lte,
              'vote_average.gte': '6.0', // Only movies with decent ratings
              'vote_count.gte': '400', // Lowered threshold for mainstream recognition
              'with_original_language': 'en', // English language only
              'with_runtime.gte': '60', // At least 1 hour
              'certification_country': 'US', // US ratings for consistency
              'page': page.toString()
            });
            
            const response = await fetch(discoverUrl, {
              headers: {
                Authorization: `Bearer ${TMDB_BEARER_TOKEN}`,
                accept: 'application/json',
              },
            });
            
            if (response.ok) {
              const data = await response.json();
              data.results.forEach((movie: any) => {
                if (!existingIds.has(movie.id)) {
                  allMovies.push(movie);
                  existingIds.add(movie.id);
                }
              });
            }
          } catch (error) {
            console.warn(`Failed to fetch movies for genre ${genre}, year ${yearRange.name}:`, error);
          }
        }
      }
    }
    
    // Also fetch some additional popular movies from different sources with filtering
    const additionalSources = [
      { url: '/movie/popular', pages: 5, name: 'Popular' },
      { url: '/movie/top_rated', pages: 3, name: 'Top Rated' },
      { url: '/movie/now_playing', pages: 2, name: 'Now Playing' }
    ];
    
    for (const source of additionalSources) {
      for (let page = 1; page <= source.pages; page++) {
        try {
          const response = await fetch(`${TMDB_BASE_URL}${source.url}?page=${page}`, {
            headers: {
              Authorization: `Bearer ${TMDB_BEARER_TOKEN}`,
              accept: 'application/json',
            },
          });
          
          if (response.ok) {
            const data = await response.json();
            data.results.forEach((movie: any) => {
              if (!existingIds.has(movie.id)) {
                allMovies.push(movie);
                existingIds.add(movie.id);
              }
            });
          }
        } catch (error) {
          console.warn(`Failed to fetch from ${source.name}:`, error);
        }
      }
    }

    // Shuffle the movies for better randomization
    const shuffledMovies = allMovies.sort(() => Math.random() - 0.5);

    console.log(
      '✅ TMDB Movies fetched:',
      shuffledMovies.length,
      'movies (discover + popular sources with genre/year filtering)'
    );

    // Process real TMDB movies with cast data
    const detailedMovies = [];
    const maxMovies = Math.min(200, shuffledMovies.length); // Check up to 200 movies for better selection
    const targetCount = 100; // Target 100 movies for much more variety

    for (let i = 0; i < maxMovies && detailedMovies.length < targetCount; i++) {
      const movie = shuffledMovies[i];
      try {
        const detailsResponse = await fetch(`${TMDB_BASE_URL}/movie/${movie.id}?append_to_response=credits`, {
          headers: {
            Authorization: `Bearer ${TMDB_BEARER_TOKEN}`,
            accept: 'application/json',
          },
        });

        if (detailsResponse.ok) {
          const details = await detailsResponse.json();
          const cast = details.credits?.cast || details.cast || [];
          
          // Filter movies from 1980 onwards
          const releaseYear = details.release_date ? new Date(details.release_date).getFullYear() : 0;
          if (releaseYear < 1980) {
            console.log(`⚠️ Skipped ${details.title}: Too old (${releaseYear})`);
            continue;
          }
          
          // Additional mainstream movie checks
          if (details.vote_count < 400) {
            console.log(`⚠️ Skipped ${details.title}: Not enough votes (${details.vote_count})`);
            continue;
          }
          
          // Get only the top 2 main actors (very strict filtering)
          const mainActors = cast
            .filter((actor: any) => actor.order < 5) // Only top 5 cast members
            .slice(0, 2);
          
          if (mainActors.length >= 2) {
            // Get a third actor for hints (from main cast only)
            const hintActor = cast
              .filter((actor: any) => actor.order >= 2 && actor.order < 5)
              .slice(0, 1)[0];

            detailedMovies.push({
              actor1: mainActors[0].name,
              actor2: mainActors[1].name,
              movie: details.title,
              year: details.release_date ? new Date(details.release_date).getFullYear().toString() : undefined,
              hintActor: hintActor?.name,
              actor1Photo: mainActors[0].profile_path ? `https://image.tmdb.org/t/p/w185${mainActors[0].profile_path}` : undefined,
              actor2Photo: mainActors[1].profile_path ? `https://image.tmdb.org/t/p/w185${mainActors[1].profile_path}` : undefined,
              hintActorPhoto: hintActor?.profile_path ? `https://image.tmdb.org/t/p/w185${hintActor.profile_path}` : undefined
            });
          }
        }
      } catch (error) {
        console.warn(`Failed to get details for movie ${movie.id}:`, error);
      }
    }

    console.log('✅ Processed TMDB movies with actor pairs:', detailedMovies.length);

    // If we didn't get enough movies from TMDB, add some static ones as fallback
    if (detailedMovies.length < 5) {
      console.log('⚠️ Not enough TMDB movies, adding static fallback...');
      const staticMovies = [
        { "actor1": "Brad Pitt", "actor2": "George Clooney", "movie": "Ocean's Twelve", "hintActor": "Catherine Zeta-Jones" },
        { "actor1": "Leonardo DiCaprio", "actor2": "Kate Winslet", "movie": "Titanic", "hintActor": "Billy Zane" },
        { "actor1": "Matt Damon", "actor2": "Robin Williams", "movie": "Good Will Hunting", "hintActor": "Ben Affleck" }
      ];
      detailedMovies.push(...staticMovies);
    }

    return NextResponse.json({
      success: true,
      movies: detailedMovies,
      total: detailedMovies.length
    });

  } catch (error) {
    console.error('❌ TMDB API Error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch movies from TMDB API',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
