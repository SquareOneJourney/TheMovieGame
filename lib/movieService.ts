import { GameMovie } from './tmdb';
import moviesData from '../data/movies.json';

// Try to load the built database, fallback to static data
let moviesDatabase: GameMovie[] = [];
try {
  moviesDatabase = require('../data/movies-database.json');
  console.log('📦 Loaded static database with', moviesDatabase.length, 'movies');
  console.log('📦 First movie photos:', {
    actor1Photo: moviesDatabase[0]?.actor1Photo,
    actor2Photo: moviesDatabase[0]?.actor2Photo,
    hintActorPhoto: moviesDatabase[0]?.hintActorPhoto
  });
} catch (error) {
  console.log('📦 Using fallback static movies data');
  moviesDatabase = moviesData;
}

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
    console.log('📦 Using static movie database');
    console.log('📦 Database info:', { 
      movieCount: moviesDatabase.length,
      sampleMovie: moviesDatabase[0] 
    });
    console.log('📦 Sample movie photos:', {
      actor1Photo: moviesDatabase[0]?.actor1Photo,
      actor2Photo: moviesDatabase[0]?.actor2Photo,
      hintActorPhoto: moviesDatabase[0]?.hintActorPhoto
    });
    
    // Return shuffled movies from the static database
    return this.shuffleArray(moviesDatabase).slice(0, count);
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
