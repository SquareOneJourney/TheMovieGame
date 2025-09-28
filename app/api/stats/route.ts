import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // 'overview', 'games', 'rounds'

    if (type === 'overview') {
      // Get overall statistics
      const [
        totalGames,
        finishedGames,
        totalRounds,
        correctGuesses,
        gamesWon,
        gamesLost
      ] = await Promise.all([
        // Total games played
        prisma.game.count({
          where: {
            players: { some: { id: session.user.id } }
          }
        }),
        // Finished games
        prisma.game.count({
          where: {
            players: { some: { id: session.user.id } },
            status: 'finished'
          }
        }),
        // Total rounds participated in
        prisma.round.count({
          where: {
            OR: [
              { clueGiver: session.user.id },
              { guesser: session.user.id }
            ]
          }
        }),
        // Correct guesses made
        prisma.round.count({
          where: {
            guesser: session.user.id,
            outcome: 'correct'
          }
        }),
        // Games won (need to determine winner logic)
        prisma.game.count({
          where: {
            players: { some: { id: session.user.id } },
            status: 'finished'
            // Note: We'll need to add winner tracking to Game model
          }
        }),
        // Games lost
        prisma.game.count({
          where: {
            players: { some: { id: session.user.id } },
            status: 'finished'
            // Note: We'll need to add winner tracking to Game model
          }
        })
      ])

      const winRate = finishedGames > 0 ? (gamesWon / finishedGames) * 100 : 0
      const accuracy = totalRounds > 0 ? (correctGuesses / totalRounds) * 100 : 0

      return NextResponse.json({
        success: true,
        stats: {
          totalGames,
          finishedGames,
          totalRounds,
          correctGuesses,
          gamesWon,
          gamesLost,
          winRate: Math.round(winRate * 100) / 100,
          accuracy: Math.round(accuracy * 100) / 100
        }
      })
    }

    if (type === 'games') {
      // Get recent games with details
      const games = await prisma.game.findMany({
        where: {
          players: { some: { id: session.user.id } }
        },
        include: {
          players: {
            select: { id: true, name: true, email: true }
          },
          rounds: {
            orderBy: { createdAt: 'desc' },
            take: 5 // Get last 5 rounds
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 20 // Get last 20 games
      })

      return NextResponse.json({
        success: true,
        games
      })
    }

    if (type === 'rounds') {
      // Get recent rounds with details
      const rounds = await prisma.round.findMany({
        where: {
          OR: [
            { clueGiver: session.user.id },
            { guesser: session.user.id }
          ]
        },
        include: {
          game: {
            include: {
              players: {
                select: { id: true, name: true }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 50 // Get last 50 rounds
      })

      return NextResponse.json({
        success: true,
        rounds
      })
    }

    return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })

  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
