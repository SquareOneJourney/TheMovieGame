import { GameMovie } from './tmdb'
import moviesData from '../data/movies.json'

const debugLog = (...args: unknown[]) => {
  if (process.env.NODE_ENV !== 'production') {
    console.log('[MovieService]', ...args)
  }
}

// Try to load the built database, fallback to static data
let moviesDatabase: GameMovie[] = []
try {
  moviesDatabase = require('../data/movies-database.json')
  debugLog('Loaded static database', { totalMovies: moviesDatabase.length })
} catch (error) {
  debugLog('Falling back to bundled movies.json')
  moviesDatabase = moviesData
}

export type { GameMovie }

interface CachedMovies {
  movies: GameMovie[]
  timestamp: number
  expiresIn: number // 24 hours in milliseconds
}

class MovieService {
  private cache: CachedMovies | null = null
  private readonly CACHE_DURATION = 2 * 60 * 60 * 1000 // 2 hours for more variety

  async getRandomMovies(count: number = 50): Promise<GameMovie[]> {
    debugLog('Serving random selection', { totalAvailable: moviesDatabase.length, requested: count })
    return this.shuffleArray(moviesDatabase).slice(0, count)
  }

  async getAllMovies(): Promise<GameMovie[]> {
    debugLog('Providing full movie list', { totalAvailable: moviesDatabase.length })
    return moviesDatabase
  }

  async getSingleRandomMovie(): Promise<GameMovie> {
    const movies = await this.getRandomMovies(1)
    return movies[0]
  }

  private isCacheValid(): boolean {
    if (!this.cache) return false
    return Date.now() - this.cache.timestamp < this.cache.expiresIn
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  async refreshCache(): Promise<void> {
    debugLog('Refreshing cache')
    this.cache = null
    await this.getRandomMovies(20)
  }

  clearCache(): void {
    debugLog('Clearing cache without refetch')
    this.cache = null
  }

  getCacheStatus(): { hasCache: boolean; isExpired: boolean; age?: number } {
    if (!this.cache) {
      return { hasCache: false, isExpired: true }
    }

    const age = Date.now() - this.cache.timestamp
    return {
      hasCache: true,
      isExpired: age >= this.cache.expiresIn,
      age
    }
  }
}

export const movieService = new MovieService()
