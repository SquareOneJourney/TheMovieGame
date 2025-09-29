import { NextRequest, NextResponse } from 'next/server'

// Simple in-memory storage for admin movies
// In production, you'd want to use a database
let adminMovies: any[] = []

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const movieIndex = adminMovies.findIndex(movie => movie.id === id)
    
    if (movieIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Movie not found' },
        { status: 404 }
      )
    }

    // Remove movie from array
    const deletedMovie = adminMovies.splice(movieIndex, 1)[0]

    return NextResponse.json({
      success: true,
      message: 'Movie deleted successfully',
      movie: deletedMovie
    })

  } catch (error) {
    console.error('Error deleting movie:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete movie' },
      { status: 500 }
    )
  }
}
