import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // 'overview', 'games', 'rounds'

    if (type === 'overview') {
      // Return mock statistics for now
      return NextResponse.json({
        success: true,
        stats: {
          totalGames: 0,
          finishedGames: 0,
          totalRounds: 0,
          correctGuesses: 0,
          gamesWon: 0,
          gamesLost: 0,
          winRate: 0,
          accuracy: 0
        }
      })
    }

    if (type === 'games') {
      // Return mock games data
      return NextResponse.json({
        success: true,
        games: []
      })
    }

    if (type === 'rounds') {
      // Return mock rounds data
      return NextResponse.json({
        success: true,
        rounds: []
      })
    }

    return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })

  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
