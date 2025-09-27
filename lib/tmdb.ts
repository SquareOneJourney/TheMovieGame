const TMDB_BEARER_TOKEN = process.env.NEXT_PUBLIC_TMDB_BEARER_TOKEN;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

// Debug environment variables
console.log('🔍 Environment check:');
console.log('🔍 process.env.NEXT_PUBLIC_TMDB_BEARER_TOKEN:', process.env.NEXT_PUBLIC_TMDB_BEARER_TOKEN ? 'Set' : 'Not set');
console.log('🔍 All NEXT_PUBLIC_ vars:', Object.keys(process.env).filter(key => key.startsWith('NEXT_PUBLIC_')));

export interface TMDBMovie {
  id: number;
  title: string;
  overview: string;
  release_date: string;
  vote_average: number;
  poster_path: string | null;
  backdrop_path: string | null;
  genre_ids: number[];
}

export interface TMDBCastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
}

export interface TMDBMovieWithCast extends TMDBMovie {
  cast: TMDBCastMember[];
}

export interface GameMovie {
  actor1: string;
  actor2: string;
  movie: string;
  poster?: string;
  year?: string;
  hintActor?: string; // Third actor for hints
}

class TMDBService {
  private async fetchFromTMDB<T>(endpoint: string): Promise<T> {
    console.log('🔑 TMDB_BEARER_TOKEN value:', TMDB_BEARER_TOKEN ? 'Set' : 'Not set');
    console.log('🔑 TMDB_BEARER_TOKEN length:', TMDB_BEARER_TOKEN?.length || 0);
    
    if (!TMDB_BEARER_TOKEN) {
      throw new Error('TMDB_BEARER_TOKEN is not configured');
    }

    const url = `${TMDB_BASE_URL}${endpoint}`;
    console.log('🌐 TMDB URL:', url);
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${TMDB_BEARER_TOKEN}`,
          'accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ TMDB API Error Response:', errorText);
        throw new Error(`TMDB API error: ${response.status} ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('TMDB API fetch error:', error);
      throw error;
    }
  }

  async getPopularMovies(page: number = 1): Promise<{ results: TMDBMovie[] }> {
    return this.fetchFromTMDB(`/movie/popular?page=${page}`);
  }

  async getMovieDetails(movieId: number): Promise<TMDBMovieWithCast> {
    return this.fetchFromTMDB(`/movie/${movieId}?append_to_response=credits`);
  }

  async getRandomMovies(count: number = 20): Promise<TMDBMovie[]> {
    const movies: TMDBMovie[] = [];
    const maxPages = 5; // TMDB popular movies has many pages
    
    for (let page = 1; page <= maxPages && movies.length < count; page++) {
      const data = await this.getPopularMovies(page);
      movies.push(...data.results);
    }
    
    // Shuffle and return the requested count
    return this.shuffleArray(movies).slice(0, count);
  }

  async getMoviesWithActorPairs(count: number = 20): Promise<GameMovie[]> {
    try {
      const movies = await this.getRandomMovies(count * 2); // Get more movies to ensure we have enough with 2+ actors
      const gameMovies: GameMovie[] = [];
      
      for (const movie of movies) {
        if (gameMovies.length >= count) break;
        
        try {
          const movieDetails = await this.getMovieDetails(movie.id);
          const cast = movieDetails.cast || [];
          
          // Filter for actors (not crew) and get the first two main actors
          const mainActors = cast
            .filter(actor => actor.order < 10) // First 10 cast members (main actors)
            .slice(0, 2);
          
          if (mainActors.length >= 2) {
            // Get a third actor for hints (from the next few cast members)
            const hintActor = cast
              .filter(actor => actor.order >= 2 && actor.order < 8) // Cast members 2-7
              .slice(0, 1)[0]?.name;

            gameMovies.push({
              actor1: mainActors[0].name,
              actor2: mainActors[1].name,
              movie: movie.title,
              poster: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : undefined,
              year: movie.release_date ? new Date(movie.release_date).getFullYear().toString() : undefined,
              hintActor: hintActor
            });
          }
        } catch (error) {
          console.warn(`Failed to get details for movie ${movie.id}:`, error);
          // Continue to next movie
        }
      }
      
      return gameMovies;
    } catch (error) {
      console.error('Error fetching movies with actor pairs:', error);
      throw error;
    }
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}

export const tmdbService = new TMDBService();
