const TMDB_BEARER_TOKEN = process.env.NEXT_PUBLIC_TMDB_BEARER_TOKEN || "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJlMjU2NzhhNjcyNWY4YTE5YWY3ODgxOTBlNzlmN2U1NyIsIm5iZiI6MTc1ODk1NzE5MS41OTM5OTk5LCJzdWIiOiI2OGQ3OGU4N2ViMjE0ZjUxMzRlMWJjOTciLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.EIEPw0yQpcgxYToSTXxyUuLlR4d5i6Sbw37s98Coaas";
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
  vote_count: number;
  popularity: number;
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
  cast?: TMDBCastMember[];
  credits?: {
    cast: TMDBCastMember[];
    crew: any[];
  };
}

export interface GameMovie {
  actor1: string;
  actor2: string;
  movie: string;
  poster?: string;
  year?: string;
  hintActor?: string; // Third actor for hints
  actor1Photo?: string; // Actor 1 profile image URL
  actor2Photo?: string; // Actor 2 profile image URL
  hintActorPhoto?: string; // Hint actor profile image URL
  tmdbId?: string; // TMDB movie ID for fetching additional data
}

class TMDBService {
  private async fetchFromTMDB<T>(endpoint: string): Promise<T> {
    console.log('🔑 TMDB_BEARER_TOKEN value:', TMDB_BEARER_TOKEN ? 'Set' : 'Not set');
    console.log('🔑 TMDB_BEARER_TOKEN length:', TMDB_BEARER_TOKEN?.length || 0);
    
    if (!TMDB_BEARER_TOKEN) {
      throw new Error('NEXT_PUBLIC_TMDB_BEARER_TOKEN is not configured');
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

  async searchMovies(query: string, page: number = 1): Promise<{ results: TMDBMovie[] }> {
    return this.fetchFromTMDB(`/search/movie?query=${encodeURIComponent(query)}&page=${page}`);
  }

  async getPersonDetails(personId: number): Promise<any> {
    return this.fetchFromTMDB(`/person/${personId}`);
  }

  private async isActorWellKnown(actor: TMDBCastMember): Promise<boolean> {
    try {
      const personDetails = await this.getPersonDetails(actor.id);
      // Check if actor has sufficient popularity and known credits
      return personDetails.popularity >= 5.0 && 
             personDetails.known_for && 
             personDetails.known_for.length >= 2;
    } catch (error) {
      console.warn(`Failed to get details for actor ${actor.name}:`, error);
      return false;
    }
  }

  async getRandomMovies(count: number = 20): Promise<TMDBMovie[]> {
    const movies: TMDBMovie[] = [];
    const maxPages = 5; // TMDB popular movies has many pages
    
    for (let page = 1; page <= maxPages && movies.length < count; page++) {
      const data = await this.getPopularMovies(page);
      // Filter for mainstream movies only
      const mainstreamMovies = data.results.filter(movie => 
        movie.vote_count >= 400 && 
        movie.vote_average >= 6.0
      );
      movies.push(...mainstreamMovies);
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
          
          // Filter for actors (not crew) and get only the top 2 main actors
          const mainActors = cast
            .filter(actor => actor.order < 5) // Only top 5 cast members (main actors)
            .slice(0, 2);
          
          if (mainActors.length >= 2) {
            // Skip actor popularity checks for faster loading
            // The TMDB filtering already ensures mainstream movies
            
            // Get a third actor for hints (from main cast only)
            const hintActor = cast
              .filter(actor => actor.order >= 2 && actor.order < 5) // Cast members 2-4
              .slice(0, 1)[0];

            gameMovies.push({
              actor1: mainActors[0].name,
              actor2: mainActors[1].name,
              movie: movie.title,
              poster: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : undefined,
              year: movie.release_date ? new Date(movie.release_date).getFullYear().toString() : undefined,
              hintActor: hintActor?.name,
              actor1Photo: mainActors[0].profile_path ? `https://image.tmdb.org/t/p/w185${mainActors[0].profile_path}` : undefined,
              actor2Photo: mainActors[1].profile_path ? `https://image.tmdb.org/t/p/w185${mainActors[1].profile_path}` : undefined,
              hintActorPhoto: hintActor?.profile_path ? `https://image.tmdb.org/t/p/w185${hintActor.profile_path}` : undefined
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
