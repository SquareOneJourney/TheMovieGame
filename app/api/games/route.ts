import { NextRequest, NextResponse } from 'next/server'
import { getAuthSession } from '@/lib/api-auth'
import { prisma } from '@/lib/prisma'

// Create a new game
export async function POST(request: NextRequest) {
  try {
    const session = await getAuthSession()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { movie, actors } = body
    
    // Validate required fields
    if (!movie || !actors?.actor1 || !actors?.actor2) {
      return NextResponse.json({ 
        error: 'Missing required fields: movie, actors.actor1, and actors.actor2 are required' 
      }, { status: 400 })
    }

    // Validate movie object
    if (!movie.title || typeof movie.title !== 'string') {
      return NextResponse.json({ 
        error: 'Invalid movie: title is required and must be a string' 
      }, { status: 400 })
    }

    // Validate actors
    if (typeof actors.actor1 !== 'string' || actors.actor1.trim().length === 0) {
      return NextResponse.json({ 
        error: 'Invalid actor1: must be a non-empty string' 
      }, { status: 400 })
    }

    if (typeof actors.actor2 !== 'string' || actors.actor2.trim().length === 0) {
      return NextResponse.json({ 
        error: 'Invalid actor2: must be a non-empty string' 
      }, { status: 400 })
    }

    // Sanitize inputs
    const sanitizedMovie = {
      title: movie.title.trim()
    }

    const sanitizedActors = {
      actor1: actors.actor1.trim(),
      actor2: actors.actor2.trim(),
      hintActor: actors.hintActor ? actors.hintActor.trim() : null
    }

    // Create game in database
    const game = await prisma.game.create({
      data: {
        status: 'waiting',
        players: {
          connect: { id: session.user.id }
        }
      },
      include: {
        players: true
      }
    })

    // Create the first round with the movie data
    await prisma.round.create({
      data: {
        gameId: game.id,
        clueGiver: session.user.id,
        guesser: '', // Will be set when the other player joins
        actor1: sanitizedActors.actor1,
        actor2: sanitizedActors.actor2,
        movie: sanitizedMovie.title,
        hintActor: sanitizedActors.hintActor
      }
    })

    return NextResponse.json({
      success: true,
      game: {
        id: game.id,
        status: game.status,
        players: game.players,
        createdAt: game.createdAt
      }
    })

  } catch (error) {
    console.error('Error creating game:', error)
    return NextResponse.json({ error: 'Failed to create game' }, { status: 500 })
  }
}

// Get games for a user
export async function GET(request: NextRequest) {
  try {
    const session = await getAuthSession()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    const whereClause: any = {
      players: {
        some: { id: session.user.id }
      }
    }

    if (status) {
      whereClause.status = status
    }

    const games = await prisma.game.findMany({
      where: whereClause,
      include: {
        players: true,
        rounds: {
          orderBy: { createdAt: 'desc' },
          take: 1 // Get the latest round
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      success: true,
      games
    })

  } catch (error) {
    console.error('Error fetching games:', error)
    return NextResponse.json({ error: 'Failed to fetch games' }, { status: 500 })
  }
}
