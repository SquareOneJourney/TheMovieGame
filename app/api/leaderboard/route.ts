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

    // Return mock leaderboard data for now
    const leaderboard: any[] = []

    return NextResponse.json({
      success: true,
      leaderboard
    })

  } catch (error) {
    console.error('Error fetching leaderboard:', error)
    return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 })
  }
}
