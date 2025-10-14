import { GameMovie } from './tmdb'
import moviesData from '../data/movies.json'

const debugLog = (...args: unknown[]) => {
  if (process.env.NODE_ENV !== 'production') {
    console.log('[MovieService]', ...args)
  }
}

// Use the bundled movies data as fallback
let moviesDatabase: GameMovie[] = moviesData
debugLog('Using bundled movies.json', { totalMovies: moviesDatabase.length })

export type { GameMovie }

interface CachedMovies {
  movies: GameMovie[]
  timestamp: number
  expiresIn: number // 24 hours in milliseconds
}

class MovieService {
  private cache: CachedMovies | null = null
  private readonly CACHE_DURATION = 2 * 60 * 60 * 1000 // 2 hours for more variety

  private async fetchMoviesFromAPI(): Promise<GameMovie[]> {
    try {
      const response = await fetch('/api/admin/movies')
      if (response.ok) {
        const data = await response.json()
        const movies = Array.isArray(data) ? data : data.movies || []
        debugLog('Fetched movies from admin API', { totalMovies: movies.length })
        return movies
      } else {
        throw new Error(`API error: ${response.status}`)
      }
    } catch (error) {
      debugLog('Failed to fetch from admin API, using fallback', error)
      return moviesDatabase
    }
  }

  async getRandomMovies(count: number = 50): Promise<GameMovie[]> {
    const movies = await this.fetchMoviesFromAPI()
    debugLog('Serving random selection', { totalAvailable: movies.length, requested: count })
    return this.shuffleArray(movies).slice(0, count)
  }

  async getAllMovies(): Promise<GameMovie[]> {
    const movies = await this.fetchMoviesFromAPI()
    debugLog('Providing full movie list', { totalAvailable: movies.length })
    return movies
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
