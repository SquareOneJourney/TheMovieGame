import { NextRequest, NextResponse } from 'next/server'
import { getAuthSession } from '@/lib/api-auth'

// Get user's friends
export async function GET(request: NextRequest) {
  try {
    const session = await getAuthSession()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Return mock friends data for now
    const friends: any[] = []

    return NextResponse.json({
      success: true,
      friends
    })

  } catch (error) {
    console.error('Error fetching friends:', error)
    return NextResponse.json({ error: 'Failed to fetch friends' }, { status: 500 })
  }
}

// Remove a friend
export async function DELETE(request: NextRequest) {
  try {
    const session = await getAuthSession()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const friendId = searchParams.get('friendId')

    if (!friendId) {
      return NextResponse.json({ error: 'Friend ID is required' }, { status: 400 })
    }

    // Mock success response for now
    return NextResponse.json({
      success: true,
      message: 'Friend removed'
    })

  } catch (error) {
    console.error('Error removing friend:', error)
    return NextResponse.json({ error: 'Failed to remove friend' }, { status: 500 })
  }
}
