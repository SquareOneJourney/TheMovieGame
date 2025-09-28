import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'

// Accept or decline a friend request
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { action } = await request.json() // 'accept' or 'decline'
    const requestId = params.id

    if (!['accept', 'decline'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    // Find the friend request
    const friendRequest = await prisma.friendRequest.findUnique({
      where: { id: requestId },
      include: {
        sender: { select: { id: true, name: true } },
        receiver: { select: { id: true, name: true } }
      }
    })

    if (!friendRequest) {
      return NextResponse.json({ error: 'Friend request not found' }, { status: 404 })
    }

    // Check if current user is the receiver
    if (friendRequest.receiverId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized to modify this request' }, { status: 403 })
    }

    // Check if request is still pending
    if (friendRequest.status !== 'pending') {
      return NextResponse.json({ error: 'Request already processed' }, { status: 400 })
    }

    // Update the request status
    const updatedRequest = await prisma.friendRequest.update({
      where: { id: requestId },
      data: { status: action === 'accept' ? 'accepted' : 'declined' }
    })

    // If accepted, create friendship
    if (action === 'accept') {
      await prisma.friendship.create({
        data: {
          user1Id: friendRequest.senderId,
          user2Id: friendRequest.receiverId
        }
      })
    }

    return NextResponse.json({
      success: true,
      friendRequest: updatedRequest
    })

  } catch (error) {
    console.error('Error processing friend request:', error)
    return NextResponse.json({ error: 'Failed to process friend request' }, { status: 500 })
  }
}

// Delete a friend request
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const requestId = params.id

    // Find the friend request
    const friendRequest = await prisma.friendRequest.findUnique({
      where: { id: requestId }
    })

    if (!friendRequest) {
      return NextResponse.json({ error: 'Friend request not found' }, { status: 404 })
    }

    // Check if current user is the sender
    if (friendRequest.senderId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized to delete this request' }, { status: 403 })
    }

    // Delete the request
    await prisma.friendRequest.delete({
      where: { id: requestId }
    })

    return NextResponse.json({
      success: true,
      message: 'Friend request deleted'
    })

  } catch (error) {
    console.error('Error deleting friend request:', error)
    return NextResponse.json({ error: 'Failed to delete friend request' }, { status: 500 })
  }
}
