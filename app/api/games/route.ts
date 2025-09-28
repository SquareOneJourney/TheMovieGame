import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'

// Create a new game
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { movie, actors } = await request.json()
    
    if (!movie || !actors?.actor1 || !actors?.actor2) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
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
        actor1: actors.actor1,
        actor2: actors.actor2,
        movie: movie.title,
        hintActor: actors.hintActor || null
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
    const session = await getServerSession()
    
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
