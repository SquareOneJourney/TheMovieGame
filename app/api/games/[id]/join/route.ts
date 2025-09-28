import { NextRequest, NextResponse } from 'next/server'
import { getAuthSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAuthSession()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: gameId } = await params

    // Check if game exists and is waiting for players
    const game = await prisma.game.findUnique({
      where: { id: gameId },
      include: {
        players: true
      }
    })

    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 })
    }

    if (game.status !== 'waiting') {
      return NextResponse.json({ error: 'Game is not accepting new players' }, { status: 400 })
    }

    // Check if user is already in the game
    const isAlreadyPlayer = game.players.some(player => player.id === session.user.id)
    if (isAlreadyPlayer) {
      return NextResponse.json({ error: 'Already in this game' }, { status: 400 })
    }

    // Check if game is full (2 players max)
    if (game.players.length >= 2) {
      return NextResponse.json({ error: 'Game is full' }, { status: 400 })
    }

    // Add player to game
    const updatedGame = await prisma.game.update({
      where: { id: gameId },
      data: {
        players: {
          connect: { id: session.user.id }
        },
        status: game.players.length === 1 ? 'in_progress' : 'waiting'
      },
      include: {
        players: true,
        rounds: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    })

    return NextResponse.json({
      success: true,
      game: updatedGame
    })

  } catch (error) {
    console.error('Error joining game:', error)
    return NextResponse.json({ error: 'Failed to join game' }, { status: 500 })
  }
}
