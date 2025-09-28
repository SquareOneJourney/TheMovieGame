import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')

    if (!query || query.length < 2) {
      return NextResponse.json({ error: 'Query must be at least 2 characters' }, { status: 400 })
    }

    // Search for users by name or email (excluding current user)
    const users = await prisma.user.findMany({
      where: {
        AND: [
          { id: { not: session.user.id } }, // Exclude current user
          {
            OR: [
              { name: { contains: query } },
              { email: { contains: query } }
            ]
          }
        ]
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true
      },
      take: 10 // Limit results
    })

    // Get existing friend relationships for current user
    const friendships = await prisma.friendship.findMany({
      where: {
        OR: [
          { user1Id: session.user.id },
          { user2Id: session.user.id }
        ]
      }
    })

    const friendIds = new Set(
      friendships.map(f => f.user1Id === session.user.id ? f.user2Id : f.user1Id)
    )

    // Get pending friend requests
    const pendingRequests = await prisma.friendRequest.findMany({
      where: {
        OR: [
          { senderId: session.user.id },
          { receiverId: session.user.id }
        ],
        status: 'pending'
      }
    })

    const pendingRequestIds = new Set(
      pendingRequests.map(r => r.senderId === session.user.id ? r.receiverId : r.senderId)
    )

    // Add relationship status to each user
    const usersWithStatus = users.map(user => ({
      ...user,
      isFriend: friendIds.has(user.id),
      hasPendingRequest: pendingRequestIds.has(user.id),
      relationshipStatus: friendIds.has(user.id) 
        ? 'friend' 
        : pendingRequestIds.has(user.id) 
        ? 'pending' 
        : 'none'
    }))

    return NextResponse.json({
      success: true,
      users: usersWithStatus
    })

  } catch (error) {
    console.error('Error searching users:', error)
    return NextResponse.json({ error: 'Failed to search users' }, { status: 500 })
  }
}
