import { NextRequest, NextResponse } from 'next/server'
import { getAuthSession } from '@/lib/api-auth'
import { prisma } from '@/lib/prisma'

// Accept or decline a friend request
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAuthSession()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { action } = await request.json() // 'accept' or 'decline'
    
    if (!['accept', 'decline'].includes(action)) {
      return NextResponse.json({ 
        error: 'Action must be "accept" or "decline"' 
      }, { status: 400 })
    }

    const { id: requestId } = await params

    // Find the friend request
    const friendRequest = await prisma.friendRequest.findUnique({
      where: { id: requestId },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        receiver: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    if (!friendRequest) {
      return NextResponse.json({ 
        error: 'Friend request not found' 
      }, { status: 404 })
    }

    // Check if user is the receiver
    if (friendRequest.receiverId !== session.user.id) {
      return NextResponse.json({ 
        error: 'Unauthorized to modify this request' 
      }, { status: 403 })
    }

    // Check if request is still pending
    if (friendRequest.status !== 'pending') {
      return NextResponse.json({ 
        error: 'Friend request already processed' 
      }, { status: 400 })
    }

    if (action === 'accept') {
      // Accept the friend request
      await prisma.$transaction(async (tx: any) => {
        // Update the friend request status
        await tx.friendRequest.update({
          where: { id: requestId },
          data: { status: 'accepted' }
        })

        // Create friendship (bidirectional)
        await tx.friendship.create({
          data: {
            user1Id: friendRequest.senderId,
            user2Id: friendRequest.receiverId
          }
        })
      })

      return NextResponse.json({
        success: true,
        message: 'Friend request accepted',
        friendship: {
          user1: friendRequest.sender,
          user2: friendRequest.receiver
        }
      })
    } else {
      // Decline the friend request
      await prisma.friendRequest.update({
        where: { id: requestId },
        data: { status: 'declined' }
      })

      return NextResponse.json({
        success: true,
        message: 'Friend request declined'
      })
    }

  } catch (error) {
    console.error('Error processing friend request:', error)
    return NextResponse.json({ error: 'Failed to process friend request' }, { status: 500 })
  }
}

// Delete a friend request (cancel sent request)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAuthSession()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: requestId } = await params

    // Find the friend request
    const friendRequest = await prisma.friendRequest.findUnique({
      where: { id: requestId }
    })

    if (!friendRequest) {
      return NextResponse.json({ 
        error: 'Friend request not found' 
      }, { status: 404 })
    }

    // Check if user is the sender
    if (friendRequest.senderId !== session.user.id) {
      return NextResponse.json({ 
        error: 'Unauthorized to delete this request' 
      }, { status: 403 })
    }

    // Delete the friend request
    await prisma.friendRequest.delete({
      where: { id: requestId }
    })

    return NextResponse.json({
      success: true,
      message: 'Friend request cancelled'
    })

  } catch (error) {
    console.error('Error deleting friend request:', error)
    return NextResponse.json({ error: 'Failed to delete friend request' }, { status: 500 })
  }
}