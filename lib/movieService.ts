import { GameMovie } from './tmdb';
import moviesData from '../data/movies.json';

export type { GameMovie };

interface CachedMovies {
  movies: GameMovie[];
  timestamp: number;
  expiresIn: number; // 24 hours in milliseconds
}

class MovieService {
  private cache: CachedMovies | null = null;
  private readonly CACHE_DURATION = 2 * 60 * 60 * 1000; // 2 hours for more variety

  async getRandomMovies(count: number = 50): Promise<GameMovie[]> {
    // Check if we have valid cached data
    if (this.cache && this.isCacheValid()) {
      console.log('📦 Using cached TMDB data');
      console.log('📦 Cache info:', { 
        hasCache: !!this.cache, 
        isExpired: !this.isCacheValid(), 
        movieCount: this.cache.movies.length,
        sampleMovie: this.cache.movies[0] 
      });
      return this.shuffleArray(this.cache.movies).slice(0, count);
    }

    try {
      console.log('🌐 Fetching from TMDB API via internal API...');
      // Try to fetch from our internal API route
      const response = await fetch('/api/movies');
      const data = await response.json() as { success: boolean; movies: GameMovie[]; total: number };
      
      if (data.success && data.movies && data.movies.length > 0) {
        console.log('✅ TMDB data loaded via API:', data.movies.length, 'movies');
        console.log('✅ Sample TMDB movie:', data.movies[0]);
        // Cache the TMDB results
        this.cache = {
          movies: data.movies,
          timestamp: Date.now(),
          expiresIn: this.CACHE_DURATION
        };
        
        return this.shuffleArray(data.movies).slice(0, count);
      }
    } catch (error) {
      console.error('❌ TMDB API failed:', error);
      console.log('🔄 Falling back to static movies data...');
      
      // Fallback to static movies data
      const staticMovies = this.shuffleArray(moviesData).slice(0, count);
      console.log('✅ Using static movies data:', staticMovies.length, 'movies');
      
      // Cache the static results for a shorter duration (1 hour)
      this.cache = {
        movies: staticMovies,
        timestamp: Date.now(),
        expiresIn: 60 * 60 * 1000 // 1 hour
      };
      
      return staticMovies;
    }

    throw new Error('No movies available from TMDB API');
  }

  async getSingleRandomMovie(): Promise<GameMovie> {
    const movies = await this.getRandomMovies(1);
    return movies[0];
  }

  private isCacheValid(): boolean {
    if (!this.cache) return false;
    return Date.now() - this.cache.timestamp < this.cache.expiresIn;
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  // Method to force refresh cache (useful for admin or testing)
  async refreshCache(): Promise<void> {
    console.log('🔄 Clearing cache and forcing fresh fetch...');
    this.cache = null;
    await this.getRandomMovies(20);
  }

  // Method to clear cache without fetching new data
  clearCache(): void {
    console.log('🗑️ Clearing cache...');
    this.cache = null;
  }

  // Method to get cache status
  getCacheStatus(): { hasCache: boolean; isExpired: boolean; age?: number } {
    if (!this.cache) {
      return { hasCache: false, isExpired: true };
    }

    const age = Date.now() - this.cache.timestamp;
    return {
      hasCache: true,
      isExpired: age >= this.cache.expiresIn,
      age
    };
  }
}

export const movieService = new MovieService();
