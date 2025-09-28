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
    const timeframe = searchParams.get('timeframe') || 'all'

    // Calculate date filter based on timeframe
    let dateFilter: Date | undefined
    const now = new Date()
    
    switch (timeframe) {
      case 'week':
        dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case 'month':
        dateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      default:
        dateFilter = undefined
    }

    // Get all users with their game statistics
    const users = await prisma.user.findMany({
      include: {
        games: {
          where: dateFilter ? {
            createdAt: { gte: dateFilter }
          } : undefined,
          include: {
            rounds: true
          }
        }
      }
    })

    // Calculate stats for each user
    const userStats = users.map(user => {
      const userGames = user.games
      const finishedGames = userGames.filter(game => game.status === 'finished')
      
      // Count rounds where user was guesser
      const roundsAsGuesser = userGames.flatMap(game => 
        game.rounds.filter(round => round.guesser === user.id)
      )
      
      // Count correct guesses
      const correctGuesses = roundsAsGuesser.filter(round => round.outcome === 'correct').length
      
      // Calculate win rate (simplified - assume user wins if they have more correct guesses)
      const totalRounds = roundsAsGuesser.length
      const accuracy = totalRounds > 0 ? (correctGuesses / totalRounds) * 100 : 0
      
      // For win rate, we'll use a simplified calculation
      // In a real implementation, you'd track actual game winners
      const winRate = finishedGames.length > 0 ? (finishedGames.length / userGames.length) * 100 : 0

      return {
        user: {
          id: user.id,
          name: user.name,
          email: user.email
        },
        stats: {
          totalGames: userGames.length,
          gamesWon: finishedGames.length, // Simplified
          winRate: Math.round(winRate * 100) / 100,
          accuracy: Math.round(accuracy * 100) / 100
        }
      }
    })

    // Filter out users with no games and sort by win rate, then accuracy
    const leaderboard = userStats
      .filter(entry => entry.stats.totalGames > 0)
      .sort((a, b) => {
        // Primary sort: win rate
        if (b.stats.winRate !== a.stats.winRate) {
          return b.stats.winRate - a.stats.winRate
        }
        // Secondary sort: accuracy
        if (b.stats.accuracy !== a.stats.accuracy) {
          return b.stats.accuracy - a.stats.accuracy
        }
        // Tertiary sort: total games
        return b.stats.totalGames - a.stats.totalGames
      })
      .slice(0, 10) // Top 10
      .map((entry, index) => ({
        ...entry,
        rank: index + 1
      }))

    return NextResponse.json({
      success: true,
      leaderboard
    })

  } catch (error) {
    console.error('Error fetching leaderboard:', error)
    return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 })
  }
}
