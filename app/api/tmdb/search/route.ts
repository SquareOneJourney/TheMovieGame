import { NextRequest, NextResponse } from 'next/server'

const TMDB_BEARER_TOKEN = process.env.TMDB_BEARER_TOKEN
const TMDB_BASE_URL = 'https://api.themoviedb.org/3'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const page = searchParams.get('page') || '1'
    const type = searchParams.get('type') || 'movie' // 'movie' or 'person'

    console.log('TMDB Search Request:', { query, page, type })

    if (!query) {
      return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 })
    }

    if (!TMDB_BEARER_TOKEN) {
      console.error('TMDB_BEARER_TOKEN is not configured')
      return NextResponse.json({ 
        error: 'TMDB API key not configured. Please set TMDB_BEARER_TOKEN in your environment variables.',
        details: 'Add TMDB_BEARER_TOKEN to your .env.local file'
      }, { status: 500 })
    }

    console.log('TMDB_BEARER_TOKEN configured:', TMDB_BEARER_TOKEN ? 'Yes' : 'No')

    if (type === 'person') {
      // Search for person first
      const personSearchResponse = await fetch(
        `${TMDB_BASE_URL}/search/person?query=${encodeURIComponent(query)}&page=${page}&include_adult=false`,
        {
          headers: {
            'Authorization': `Bearer ${TMDB_BEARER_TOKEN}`,
            'Content-Type': 'application/json',
          },
        }
      )

      if (!personSearchResponse.ok) {
        const errorText = await personSearchResponse.text()
        console.error('TMDB person search error:', {
          status: personSearchResponse.status,
          statusText: personSearchResponse.statusText,
          body: errorText
        })
        throw new Error(`TMDB API error: ${personSearchResponse.status} ${personSearchResponse.statusText} - ${errorText}`)
      }

      const personSearchData = await personSearchResponse.json()
      
      if (personSearchData.results.length === 0) {
        return NextResponse.json({
          movies: [],
          total_pages: 0,
          total_results: 0,
          page: 1
        })
      }

      // Get the first person's ID
      const personId = personSearchData.results[0].id
      
      // Get person's movie credits
      const creditsResponse = await fetch(
        `${TMDB_BASE_URL}/person/${personId}/movie_credits`,
        {
          headers: {
            'Authorization': `Bearer ${TMDB_BEARER_TOKEN}`,
            'Content-Type': 'application/json',
          },
        }
      )

      if (!creditsResponse.ok) {
        const errorText = await creditsResponse.text()
        console.error('TMDB credits error:', {
          status: creditsResponse.status,
          statusText: creditsResponse.statusText,
          body: errorText
        })
        throw new Error(`TMDB API error: ${creditsResponse.status} ${creditsResponse.statusText} - ${errorText}`)
      }

      const creditsData = await creditsResponse.json()

      // Filter and process movie results - no rating/vote constraints for actor search
      const movies = creditsData.cast
        .filter((movie: any) => 
          movie.poster_path && 
          movie.release_date && 
          new Date(movie.release_date).getFullYear() >= 1980 &&
          new Date(movie.release_date).getFullYear() <= new Date().getFullYear()
        )
        .slice(0, 50) // Increased limit for actor search to show more movies
        .map((movie: any) => ({
          id: movie.id,
          title: movie.title,
          release_date: movie.release_date,
          poster_path: movie.poster_path,
          overview: movie.overview,
          vote_average: movie.vote_average,
          vote_count: movie.vote_count,
          popularity: movie.popularity
        }))

      return NextResponse.json({
        movies,
        total_pages: 1,
        total_results: movies.length,
        page: 1
      })
    } else {
      // Search for movies (original functionality)
      const searchResponse = await fetch(
        `${TMDB_BASE_URL}/search/movie?query=${encodeURIComponent(query)}&page=${page}&include_adult=false`,
        {
          headers: {
            'Authorization': `Bearer ${TMDB_BEARER_TOKEN}`,
            'Content-Type': 'application/json',
          },
        }
      )

      if (!searchResponse.ok) {
        const errorText = await searchResponse.text()
        console.error('TMDB movie search error:', {
          status: searchResponse.status,
          statusText: searchResponse.statusText,
          body: errorText
        })
        throw new Error(`TMDB API error: ${searchResponse.status} ${searchResponse.statusText} - ${errorText}`)
      }

      const searchData = await searchResponse.json()

      // Filter and process results
      const movies = searchData.results
        .filter((movie: any) => 
          movie.poster_path && 
          movie.release_date && 
          new Date(movie.release_date).getFullYear() >= 1980 &&
          new Date(movie.release_date).getFullYear() <= new Date().getFullYear()
        )
        .slice(0, 20) // Limit to 20 results
        .map((movie: any) => ({
          id: movie.id,
          title: movie.title,
          release_date: movie.release_date,
          poster_path: movie.poster_path,
          overview: movie.overview,
          vote_average: movie.vote_average,
          vote_count: movie.vote_count,
          popularity: movie.popularity
        }))

      return NextResponse.json({
        movies,
        total_pages: searchData.total_pages,
        total_results: searchData.total_results,
        page: searchData.page
      })
    }

  } catch (error) {
    console.error('TMDB search error:', error)
    return NextResponse.json({ error: 'Failed to search TMDB' }, { status: 500 })
  }
}
