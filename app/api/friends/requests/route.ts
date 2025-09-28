import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'

// Send a friend request
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { receiverId } = await request.json()

    if (!receiverId) {
      return NextResponse.json({ error: 'Receiver ID is required' }, { status: 400 })
    }

    if (receiverId === session.user.id) {
      return NextResponse.json({ error: 'Cannot send friend request to yourself' }, { status: 400 })
    }

    // Check if users are already friends
    const existingFriendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          { user1Id: session.user.id, user2Id: receiverId },
          { user1Id: receiverId, user2Id: session.user.id }
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
          { senderId: session.user.id, receiverId },
          { senderId: receiverId, receiverId: session.user.id }
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
        receiverId,
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
    const session = await getServerSession()
    
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
