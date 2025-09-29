import { NextRequest, NextResponse } from 'next/server'

const TMDB_BEARER_TOKEN = process.env.TMDB_BEARER_TOKEN
const TMDB_BASE_URL = 'https://api.themoviedb.org/3'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const movieId = searchParams.get('movieId')

    if (!movieId) {
      return NextResponse.json({ error: 'Movie ID is required' }, { status: 400 })
    }

    if (!TMDB_BEARER_TOKEN) {
      return NextResponse.json({ error: 'TMDB API key not configured' }, { status: 500 })
    }

    // Get movie credits from TMDB
    const creditsResponse = await fetch(
      `${TMDB_BASE_URL}/movie/${movieId}/credits`,
      {
        headers: {
          'Authorization': `Bearer ${TMDB_BEARER_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    )

    if (!creditsResponse.ok) {
      throw new Error(`TMDB API error: ${creditsResponse.status}`)
    }

    const creditsData = await creditsResponse.json()

    // Get top 5 cast members with photos
    const topActors = creditsData.cast
      .filter((actor: any) => actor.profile_path) // Only actors with photos
      .slice(0, 5)
      .map((actor: any) => ({
        id: actor.id,
        name: actor.name,
        character: actor.character,
        profile_path: actor.profile_path,
        order: actor.order
      }))

    return NextResponse.json({
      actors: topActors,
      movieTitle: creditsData.title || 'Unknown Movie'
    })

  } catch (error) {
    console.error('TMDB credits error:', error)
    return NextResponse.json({ error: 'Failed to fetch movie credits' }, { status: 500 })
  }
}
