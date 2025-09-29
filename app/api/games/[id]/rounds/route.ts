import { NextRequest, NextResponse } from 'next/server'
import { getAuthSession } from '@/lib/api-auth'
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
    const { action, guess, isCorrect, actor1, actor2, movie, poster, year, actor1Photo, actor2Photo, hintActorPhoto, hintActor } = body

    // Get the current game
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

    // Handle different actions
    if (action === 'give_clue') {
      // Create a new round with the clue
      const newRound = await prisma.round.create({
        data: {
          gameId: game.id,
          clueGiver: session.user.id,
          guesser: game.players.find((p: any) => p.id !== session.user.id)?.id || '',
          actor1: actor1 || '',
          actor2: actor2 || '',
          movie: movie || '',
          poster: poster || '',
          year: year || '',
          actor1Photo: actor1Photo || '',
          actor2Photo: actor2Photo || '',
          hintActorPhoto: hintActorPhoto || '',
          hintActor: hintActor || ''
        }
      })

      // Update game current turn
      await prisma.game.update({
        where: { id: gameId },
        data: { currentTurn: session.user.id }
      })

      return NextResponse.json({
        success: true,
        round: newRound
      })
    }

    // Handle guess (existing logic)
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

    // Update scores (temporarily disabled until Prisma client is regenerated)
    if (isCorrect) {
      // Switch turn to the guesser
      const guesser = game.players.find((p: any) => p.id !== currentRound.clueGiver)
      await prisma.game.update({
        where: { id: gameId },
        data: { currentTurn: guesser?.id || game.currentTurn }
      })
    } else {
      // Clue giver keeps turn (no change needed)
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
