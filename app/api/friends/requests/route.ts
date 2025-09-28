import { NextRequest, NextResponse } from 'next/server'
import { getAuthSession } from '@/lib/api-auth'
import { prisma } from '@/lib/prisma'

// Send a friend request
export async function POST(request: NextRequest) {
  try {
    const session = await getAuthSession()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { receiverId } = body

    // Validate receiverId
    if (!receiverId) {
      return NextResponse.json({ error: 'Receiver ID is required' }, { status: 400 })
    }

    if (typeof receiverId !== 'string' || receiverId.trim().length === 0) {
      return NextResponse.json({ error: 'Invalid receiver ID format' }, { status: 400 })
    }

    const sanitizedReceiverId = receiverId.trim()

    if (sanitizedReceiverId === session.user.id) {
      return NextResponse.json({ error: 'Cannot send friend request to yourself' }, { status: 400 })
    }

    // Validate that the receiver exists
    const receiver = await prisma.user.findUnique({
      where: { id: sanitizedReceiverId }
    })

    if (!receiver) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if users are already friends
    const existingFriendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          { user1Id: session.user.id, user2Id: sanitizedReceiverId },
          { user1Id: sanitizedReceiverId, user2Id: session.user.id }
        ]
      }
    })

    if (existingFriendship) {
      return NextResponse.json({ error: 'Already friends' }, { status: 400 })
    }

    // Check if there's already a pending request
    const existingRequest = await prisma.friendRequest.findFirst({
      where: {
        OR: [
          { senderId: session.user.id, receiverId: sanitizedReceiverId },
          { senderId: sanitizedReceiverId, receiverId: session.user.id }
        ],
        status: 'pending'
      }
    })

    if (existingRequest) {
      return NextResponse.json({ error: 'Friend request already exists' }, { status: 400 })
    }

    // Create friend request
    const friendRequest = await prisma.friendRequest.create({
      data: {
        senderId: session.user.id,
        receiverId: sanitizedReceiverId,
        status: 'pending'
      },
      include: {
        receiver: {
          select: { id: true, name: true, email: true }
        }
      }
    })

    return NextResponse.json({
      success: true,
      friendRequest
    })

  } catch (error) {
    console.error('Error sending friend request:', error)
    return NextResponse.json({ error: 'Failed to send friend request' }, { status: 500 })
  }
}

// Get friend requests (sent and received)
export async function GET(request: NextRequest) {
  try {
    const session = await getAuthSession()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // 'sent' or 'received'

    const whereClause: any = {
      OR: [
        { senderId: session.user.id },
        { receiverId: session.user.id }
      ]
    }

    if (type === 'sent') {
      whereClause.OR = [{ senderId: session.user.id }]
    } else if (type === 'received') {
      whereClause.OR = [{ receiverId: session.user.id }]
    }

    const friendRequests = await prisma.friendRequest.findMany({
      where: whereClause,
      include: {
        sender: {
          select: { id: true, name: true, email: true }
        },
        receiver: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      success: true,
      friendRequests
    })

  } catch (error) {
    console.error('Error fetching friend requests:', error)
    return NextResponse.json({ error: 'Failed to fetch friend requests' }, { status: 500 })
  }
}
