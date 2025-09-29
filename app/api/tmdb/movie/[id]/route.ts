import { NextRequest, NextResponse } from 'next/server'

const TMDB_BEARER_TOKEN = process.env.TMDB_BEARER_TOKEN
const TMDB_BASE_URL = 'https://api.themoviedb.org/3'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: movieId } = await params

    if (!movieId) {
      return NextResponse.json({ error: 'Movie ID is required' }, { status: 400 })
    }

    if (!TMDB_BEARER_TOKEN) {
      return NextResponse.json({ error: 'TMDB API key not configured' }, { status: 500 })
    }

    // Get movie details and cast in parallel
    const [movieResponse, castResponse] = await Promise.all([
      fetch(`${TMDB_BASE_URL}/movie/${movieId}`, {
        headers: {
          'Authorization': `Bearer ${TMDB_BEARER_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }),
      fetch(`${TMDB_BASE_URL}/movie/${movieId}/credits`, {
        headers: {
          'Authorization': `Bearer ${TMDB_BEARER_TOKEN}`,
          'Content-Type': 'application/json',
        },
      })
    ])

    if (!movieResponse.ok || !castResponse.ok) {
      throw new Error(`TMDB API error: ${movieResponse.status} / ${castResponse.status}`)
    }

    const movieData = await movieResponse.json()
    const castData = await castResponse.json()

    // Filter cast to get main actors with photos
    const mainActors = castData.cast
      .filter((actor: any) => 
        actor.profile_path && 
        actor.order < 10 && // Top 10 billed actors
        actor.known_for_department === 'Acting'
      )
      .slice(0, 3) // Get top 3 actors

    if (mainActors.length < 2) {
      return NextResponse.json({ 
        error: 'Movie does not have enough actors with photos' 
      }, { status: 400 })
    }

    // Create GameMovie object
    const gameMovie = {
      actor1: mainActors[0].name,
      actor2: mainActors[1].name,
      movie: movieData.title,
      year: movieData.release_date ? new Date(movieData.release_date).getFullYear().toString() : undefined,
      poster: movieData.poster_path ? `https://image.tmdb.org/t/p/w500${movieData.poster_path}` : undefined,
      hintActor: mainActors[2]?.name,
      actor1Photo: mainActors[0].profile_path ? `https://image.tmdb.org/t/p/w185${mainActors[0].profile_path}` : undefined,
      actor2Photo: mainActors[1].profile_path ? `https://image.tmdb.org/t/p/w185${mainActors[1].profile_path}` : undefined,
      hintActorPhoto: mainActors[2]?.profile_path ? `https://image.tmdb.org/t/p/w185${mainActors[2].profile_path}` : undefined
    }

    return NextResponse.json(gameMovie)

  } catch (error) {
    console.error('TMDB movie details error:', error)
    return NextResponse.json({ error: 'Failed to get movie details' }, { status: 500 })
  }
}
