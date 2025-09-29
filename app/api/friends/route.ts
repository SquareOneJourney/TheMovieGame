import { NextRequest, NextResponse } from 'next/server'
import { getAuthSession } from '@/lib/api-auth'
import { prisma } from '@/lib/prisma'

// Get user's friends list
export async function GET(request: NextRequest) {
  try {
    const session = await getAuthSession()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all friendships for the user
    const friendships = await prisma.friendship.findMany({
      where: {
        OR: [
          { user1Id: session.user.id },
          { user2Id: session.user.id }
        ]
      },
      include: {
        user1: {
          select: {
            id: true,
            name: true,
            email: true,
            score: true,
            createdAt: true
          }
        },
        user2: {
          select: {
            id: true,
            name: true,
            email: true,
            score: true,
            createdAt: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Transform the data to get just the friend info
    const friends = friendships.map((friendship: any) => {
      const friend = friendship.user1Id === session.user.id 
        ? friendship.user2 
        : friendship.user1
      
      return {
        ...friend,
        friendshipId: friendship.id,
        friendsSince: friendship.createdAt
      }
    })

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

    const { friendId } = await request.json()
    
    if (!friendId) {
      return NextResponse.json({ 
        error: 'Friend ID is required' 
      }, { status: 400 })
    }

    // Find the friendship
    const friendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          { user1Id: session.user.id, user2Id: friendId },
          { user1Id: friendId, user2Id: session.user.id }
        ]
      }
    })

    if (!friendship) {
      return NextResponse.json({ 
        error: 'Friendship not found' 
      }, { status: 404 })
    }

    // Delete the friendship
    await prisma.friendship.delete({
      where: { id: friendship.id }
    })

    return NextResponse.json({
      success: true,
      message: 'Friend removed successfully'
    })

  } catch (error) {
    console.error('Error removing friend:', error)
    return NextResponse.json({ error: 'Failed to remove friend' }, { status: 500 })
  }
}