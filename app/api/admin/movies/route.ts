import { NextRequest, NextResponse } from 'next/server'
import { getMovieDetails, searchMovies } from '@/lib/tmdb'

// Simple in-memory storage for admin movies
// In production, you'd want to use a database
let adminMovies: any[] = []

export async function GET() {
  try {
    return NextResponse.json({ 
      success: true, 
      movies: adminMovies,
      count: adminMovies.length 
    })
  } catch (error) {
    console.error('Error fetching admin movies:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch movies' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json()
    
    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Query is required' },
        { status: 400 }
      )
    }

    // Search for movies
    const searchResults = await searchMovies(query)
    
    if (!searchResults || searchResults.results.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No movies found' },
        { status: 404 }
      )
    }

    // Get the first result
    const movie = searchResults.results[0]
    
    // Get detailed movie information
    const movieDetails = await getMovieDetails(movie.id)
    
    if (!movieDetails) {
      return NextResponse.json(
        { success: false, error: 'Failed to get movie details' },
        { status: 500 }
      )
    }

    // Check if movie already exists
    const existingMovie = adminMovies.find(m => m.tmdbId === movie.id)
    if (existingMovie) {
      return NextResponse.json(
        { success: false, error: 'Movie already exists in database' },
        { status: 409 }
      )
    }

    // Create movie object for admin database (using GameMovie structure)
    const adminMovie = {
      id: `admin_${Date.now()}`,
      tmdbId: movie.id,
      movie: movieDetails.title, // Use 'movie' instead of 'title' to match GameMovie interface
      year: movieDetails.release_date?.split('-')[0] || 'Unknown',
      poster: movieDetails.poster_path ? `https://image.tmdb.org/t/p/w500${movieDetails.poster_path}` : null,
      actor1: movieDetails.cast?.[0]?.name || 'Unknown',
      actor2: movieDetails.cast?.[1]?.name || 'Unknown',
      hintActor: movieDetails.cast?.[2]?.name || null,
      actor1Photo: movieDetails.cast?.[0]?.profile_path ? `https://image.tmdb.org/t/p/w500${movieDetails.cast[0].profile_path}` : null,
      actor2Photo: movieDetails.cast?.[1]?.profile_path ? `https://image.tmdb.org/t/p/w500${movieDetails.cast[1].profile_path}` : null,
      hintActorPhoto: movieDetails.cast?.[2]?.profile_path ? `https://image.tmdb.org/t/p/w500${movieDetails.cast[2].profile_path}` : null,
      addedAt: new Date().toISOString()
    }

    // Add to admin movies
    adminMovies.push(adminMovie)

    return NextResponse.json({
      success: true,
      movie: adminMovie,
      message: 'Movie added successfully'
    })

  } catch (error) {
    console.error('Error adding movie:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to add movie' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { movies } = await request.json()
    
    if (!Array.isArray(movies)) {
      return NextResponse.json(
        { success: false, error: 'Movies array is required' },
        { status: 400 }
      )
    }

    // Update the in-memory storage
    adminMovies = movies

    return NextResponse.json({
      success: true,
      message: 'Movies updated successfully',
      count: adminMovies.length
    })

  } catch (error) {
    console.error('Error updating movies:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update movies' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { movieTitle } = await request.json()
    
    if (!movieTitle) {
      return NextResponse.json(
        { success: false, error: 'Movie title is required' },
        { status: 400 }
      )
    }

    // Remove movie from in-memory storage
    const initialLength = adminMovies.length
    adminMovies = adminMovies.filter(movie => movie.movie !== movieTitle)

    if (adminMovies.length === initialLength) {
      return NextResponse.json(
        { success: false, error: 'Movie not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Movie deleted successfully',
      count: adminMovies.length
    })

  } catch (error) {
    console.error('Error deleting movie:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete movie' },
      { status: 500 }
    )
  }
}
