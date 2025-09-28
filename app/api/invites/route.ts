import { NextRequest, NextResponse } from 'next/server'
import { getAuthSession } from '@/lib/api-auth'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

// Get user's game invites
export async function GET(request: NextRequest) {
  try {
    const session = await getAuthSession()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // 'sent' or 'received'

    // Return mock invites data for now
    const gameInvites: any[] = []

    return NextResponse.json({
      success: true,
      gameInvites
    })

  } catch (error) {
    console.error('Error fetching game invites:', error)
    return NextResponse.json({ error: 'Failed to fetch game invites' }, { status: 500 })
  }
}
