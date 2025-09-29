import { NextRequest, NextResponse } from 'next/server'
import { getAuthSession } from '@/lib/api-auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAuthSession()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: gameId } = await params

    // Get the game with players and latest round
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

    // Check if user is part of this game
    const isPlayer = game.players.some((p: any) => p.id === session.user.id)
    if (!isPlayer) {
      return NextResponse.json({ error: 'Not a player in this game' }, { status: 403 })
    }

    // Get current round info
    const currentRound = game.rounds[0]
    const currentClue = currentRound ? {
      actor1: currentRound.actor1,
      actor2: currentRound.actor2,
      movie: currentRound.movie,
      poster: currentRound.poster,
      year: currentRound.year,
      actor1Photo: currentRound.actor1Photo,
      actor2Photo: currentRound.actor2Photo,
      hintActorPhoto: currentRound.hintActorPhoto,
      hintActor: currentRound.hintActor
    } : null

    // Determine game status
    let gameStatus = 'waiting'
    if (game.players.length === 2) {
      if (currentRound?.outcome === 'correct') {
        gameStatus = 'playing' // Ready for next round
      } else if (currentRound && !currentRound.guess) {
        gameStatus = 'playing' // Waiting for guess
      } else if (currentRound && currentRound.guess && currentRound.outcome === 'wrong') {
        gameStatus = 'playing' // Wrong guess, clue giver keeps turn
      } else {
        gameStatus = 'playing' // New round needed
      }
    }

    // Check for winner (temporarily disabled until Prisma client is regenerated)
    // const maxScore = Math.max(...game.players.map(p => p.score))
    // const winner = maxScore >= 10 ? game.players.find(p => p.score >= 10) : null
    // if (winner) {
    //   gameStatus = 'finished'
    // }

    // Determine current turn
    let currentTurn = game.currentTurn
    if (currentRound?.outcome === 'correct') {
      // Switch to the other player
      currentTurn = game.players.find((p: any) => p.id !== currentRound.clueGiver)?.id || game.currentTurn
    }

    return NextResponse.json({
      id: game.id,
      players: game.players.map((p: any) => ({
        id: p.id,
        name: p.name,
        score: 0 // Temporarily disabled until Prisma client is regenerated
      })),
      currentTurn,
      gameStatus,
      winner: null, // Temporarily disabled until Prisma client is regenerated
      currentClue,
      lastResult: currentRound ? {
        correct: currentRound.outcome === 'correct',
        guess: currentRound.guess,
        correctAnswer: currentRound.movie,
        usedHint: currentRound.hintUsed
      } : null
    })

  } catch (error) {
    console.error('Error fetching game state:', error)
    return NextResponse.json({ error: 'Failed to fetch game state' }, { status: 500 })
  }
}
