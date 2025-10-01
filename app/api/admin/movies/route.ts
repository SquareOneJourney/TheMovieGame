import { NextRequest, NextResponse } from 'next/server'
import { getMovieDetails, searchMovies } from '@/lib/tmdb'
import fs from 'fs'
import path from 'path'

// Load movies from the actual database file
function loadMoviesFromDatabase(): any[] {
  try {
    const filePath = path.join(process.cwd(), 'data', 'movies-database.json')
    const data = fs.readFileSync(filePath, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Error loading movies database:', error)
    return []
  }
}

// Save movies to the actual database file
function saveMoviesToDatabase(movies: any[]): void {
  try {
    const filePath = path.join(process.cwd(), 'data', 'movies-database.json')
    fs.writeFileSync(filePath, JSON.stringify(movies, null, 2))
    console.log(`💾 Saved ${movies.length} movies to database`)
  } catch (error) {
    console.error('Error saving movies database:', error)
  }
}

export async function GET() {
  try {
    const movies = loadMoviesFromDatabase()
    return NextResponse.json({ 
      success: true, 
      movies: movies,
      count: movies.length 
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
    const body = await request.json()
    console.log('📥 POST /api/admin/movies - Request body:', JSON.stringify(body, null, 2))
    
    // Check if it's a query string (for TMDB search) or a full movie object (for direct add)
    if (body.query && typeof body.query === 'string') {
      // Handle TMDB search query
      const { query } = body
      
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

      // Load current movies from database
      const currentMovies = loadMoviesFromDatabase()
      
      // Check if movie already exists
      const existingMovie = currentMovies.find(m => m.movie === movieDetails.title)
      if (existingMovie) {
        return NextResponse.json(
          { success: false, error: 'Movie already exists in database' },
          { status: 409 }
        )
      }

      // Create movie object for database (using GameMovie structure with 5 actors)
      const newMovie = {
        movie: movieDetails.title,
        year: movieDetails.release_date?.split('-')[0] || 'Unknown',
        poster: movieDetails.poster_path ? `https://image.tmdb.org/t/p/w500${movieDetails.poster_path}` : null,
        actor1: movieDetails.cast?.[0]?.name || 'Unknown',
        actor2: movieDetails.cast?.[1]?.name || 'Unknown',
        actor3: movieDetails.cast?.[2]?.name || null,
        actor4: movieDetails.cast?.[3]?.name || null,
        actor5: movieDetails.cast?.[4]?.name || null,
        hintActor: movieDetails.cast?.[2]?.name || null, // Keep for backward compatibility
        actor1Photo: movieDetails.cast?.[0]?.profile_path ? `https://image.tmdb.org/t/p/w185${movieDetails.cast[0].profile_path}` : null,
        actor2Photo: movieDetails.cast?.[1]?.profile_path ? `https://image.tmdb.org/t/p/w185${movieDetails.cast[1].profile_path}` : null,
        actor3Photo: movieDetails.cast?.[2]?.profile_path ? `https://image.tmdb.org/t/p/w185${movieDetails.cast[2].profile_path}` : null,
        actor4Photo: movieDetails.cast?.[3]?.profile_path ? `https://image.tmdb.org/t/p/w185${movieDetails.cast[3].profile_path}` : null,
        actor5Photo: movieDetails.cast?.[4]?.profile_path ? `https://image.tmdb.org/t/p/w185${movieDetails.cast[4].profile_path}` : null,
        hintActorPhoto: movieDetails.cast?.[2]?.profile_path ? `https://image.tmdb.org/t/p/w185${movieDetails.cast[2].profile_path}` : null
      }

      // Add to database
      currentMovies.push(newMovie)
      saveMoviesToDatabase(currentMovies)

      return NextResponse.json({
        success: true,
        movie: newMovie,
        message: 'Movie added successfully'
      })
      
    } else if (body.movie && typeof body.movie === 'string') {
      // Handle direct movie object (from admin form or TMDB result)
      const newMovie = body
      
      // Load current movies from database
      const currentMovies = loadMoviesFromDatabase()
      
      // Check if movie already exists
      const existingMovie = currentMovies.find(m => m.movie === newMovie.movie)
      if (existingMovie) {
        return NextResponse.json(
          { success: false, error: 'Movie already exists in database' },
          { status: 409 }
        )
      }

      // Add to database
      currentMovies.push(newMovie)
      saveMoviesToDatabase(currentMovies)

      return NextResponse.json({
        success: true,
        movie: newMovie,
        message: 'Movie added successfully'
      })
      
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid request format. Expected query string or movie object.' },
        { status: 400 }
      )
    }

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

    // Update the database file
    saveMoviesToDatabase(movies)

    return NextResponse.json({
      success: true,
      message: 'Movies updated successfully',
      count: movies.length
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
    console.log('🗑️ DELETE /api/admin/movies - Movie title:', movieTitle)
    
    if (!movieTitle) {
      return NextResponse.json(
        { success: false, error: 'Movie title is required' },
        { status: 400 }
      )
    }

    // Load current movies from database
    const currentMovies = loadMoviesFromDatabase()
    const initialLength = currentMovies.length
    console.log(`📊 Current movies count: ${initialLength}`)
    
    // Find the movie to delete (case-insensitive search)
    const movieToDelete = currentMovies.find(movie => 
      movie.movie && movie.movie.toLowerCase() === movieTitle.toLowerCase()
    )
    
    if (!movieToDelete) {
      console.log(`❌ Movie not found: "${movieTitle}"`)
      console.log('Available movies:', currentMovies.map(m => m.movie).slice(0, 5))
      return NextResponse.json(
        { success: false, error: 'Movie not found' },
        { status: 404 }
      )
    }

    // Remove movie from database
    const updatedMovies = currentMovies.filter(movie => 
      movie.movie && movie.movie.toLowerCase() !== movieTitle.toLowerCase()
    )

    console.log(`✅ Movie found and removed. New count: ${updatedMovies.length}`)

    // Save updated movies to database
    saveMoviesToDatabase(updatedMovies)

    return NextResponse.json({
      success: true,
      message: 'Movie deleted successfully',
      count: updatedMovies.length
    })

  } catch (error) {
    console.error('Error deleting movie:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete movie' },
      { status: 500 }
    )
  }
}
