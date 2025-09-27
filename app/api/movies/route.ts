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

    // Get a mix of top-rated and popular movies for better variety
    const topRatedResponse = await fetch(`${TMDB_BASE_URL}/movie/top_rated?page=1`, {
      headers: {
        Authorization: `Bearer ${TMDB_BEARER_TOKEN}`,
        accept: 'application/json',
      },
    });
    
    const popularResponse = await fetch(`${TMDB_BASE_URL}/movie/popular?page=1`, {
      headers: {
        Authorization: `Bearer ${TMDB_BEARER_TOKEN}`,
        accept: 'application/json',
      },
    });

    if (!topRatedResponse.ok || !popularResponse.ok) {
      throw new Error(`TMDB API error: ${topRatedResponse.status} ${popularResponse.status}`);
    }

    const topRatedData = await topRatedResponse.json();
    const popularData = await popularResponse.json();
    
    // Combine both lists and remove duplicates
    const allMovies = [...topRatedData.results];
    const existingIds = new Set(topRatedData.results.map((movie: any) => movie.id));
    
    popularData.results.forEach((movie: any) => {
      if (!existingIds.has(movie.id)) {
        allMovies.push(movie);
      }
    });
    
    console.log('✅ TMDB Movies fetched:', allMovies.length, 'movies (top-rated + popular)');

    // Process real TMDB movies with cast data
    const detailedMovies = [];
    const maxMovies = Math.min(50, allMovies.length); // Check up to 50 movies to find enough from 1980+

    for (let i = 0; i < maxMovies && detailedMovies.length < 20; i++) {
      const movie = allMovies[i];
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
          
          // Get first two main actors (be very lenient with the filter)
          const mainActors = cast
            .filter((actor: any) => actor.order < 20) // Very lenient - up to order 20
            .slice(0, 2);
          
          if (mainActors.length >= 2) {
            // Get a third actor for hints
            const hintActor = cast
              .filter((actor: any) => actor.order >= 2 && actor.order < 10)
              .slice(0, 1)[0]?.name;

            detailedMovies.push({
              actor1: mainActors[0].name,
              actor2: mainActors[1].name,
              movie: details.title,
              year: details.release_date ? new Date(details.release_date).getFullYear().toString() : undefined,
              hintActor: hintActor
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
