import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const gameId = params.id
    const { guess, isCorrect } = await request.json()

    // Get the current game and latest round
    const game = await prisma.game.findUnique({
      where: { id: gameId },
      include: {
        players: true,
        rounds: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    })

    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 })
    }

    if (game.players.length < 2) {
      return NextResponse.json({ error: 'Game needs 2 players' }, { status: 400 })
    }

    const currentRound = game.rounds[0]
    if (!currentRound) {
      return NextResponse.json({ error: 'No active round' }, { status: 400 })
    }

    // Update the current round with the guess
    const updatedRound = await prisma.round.update({
      where: { id: currentRound.id },
      data: {
        guess,
        outcome: isCorrect ? 'correct' : 'wrong'
      }
    })

    // If correct, create a new round for the other player
    if (isCorrect) {
      // Find the other player
      const otherPlayer = game.players.find(p => p.id !== currentRound.clueGiver)
      
      if (otherPlayer) {
        await prisma.round.create({
          data: {
            gameId: game.id,
            clueGiver: otherPlayer.id,
            guesser: currentRound.clueGiver,
            actor1: '',
            actor2: '',
            movie: ''
          }
        })
      }
    }

    return NextResponse.json({
      success: true,
      round: updatedRound
    })

  } catch (error) {
    console.error('Error updating round:', error)
    return NextResponse.json({ error: 'Failed to update round' }, { status: 500 })
  }
}
