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
    const body = await request.json()
    const { guess, isCorrect } = body

    // Validate inputs
    if (typeof guess !== 'string' || guess.trim().length === 0) {
      return NextResponse.json({ 
        error: 'Invalid guess: must be a non-empty string' 
      }, { status: 400 })
    }

    if (typeof isCorrect !== 'boolean') {
      return NextResponse.json({ 
        error: 'Invalid isCorrect: must be a boolean' 
      }, { status: 400 })
    }

    const sanitizedGuess = guess.trim()

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
        guess: sanitizedGuess,
        outcome: isCorrect ? 'correct' : 'wrong'
      }
    })

    // If correct, create a new round for the other player
    if (isCorrect) {
      // Find the other player
      const otherPlayer = game.players.find(p => p.id !== currentRound.clueGiver)
      
      if (otherPlayer) {
        // Create a placeholder round that will be populated when the new clue giver submits their movie
        await prisma.round.create({
          data: {
            gameId: game.id,
            clueGiver: otherPlayer.id,
            guesser: currentRound.clueGiver,
            actor1: 'TBD', // To Be Determined - will be filled when clue is given
            actor2: 'TBD', // To Be Determined - will be filled when clue is given
            movie: 'TBD'   // To Be Determined - will be filled when clue is given
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
