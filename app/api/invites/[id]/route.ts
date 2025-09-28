import { NextRequest, NextResponse } from 'next/server'
import { getAuthSession } from '@/lib/api-auth'
import { prisma } from '@/lib/prisma'

// Accept or decline a game invite
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
    const { id: inviteId } = await params

    if (!['accept', 'decline'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    // Find the game invite
    const gameInvite = await prisma.gameInvite.findUnique({
      where: { id: inviteId },
      include: {
        game: {
          include: { players: true }
        }
      }
    })

    if (!gameInvite) {
      return NextResponse.json({ error: 'Game invite not found' }, { status: 404 })
    }

    // Check if current user is the receiver
    if (gameInvite.receiverId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized to modify this invite' }, { status: 403 })
    }

    // Check if invite is still pending
    if (gameInvite.status !== 'pending') {
      return NextResponse.json({ error: 'Invite already processed' }, { status: 400 })
    }

    // Update the invite status
    const updatedInvite = await prisma.gameInvite.update({
      where: { id: inviteId },
      data: { status: action === 'accept' ? 'accepted' : 'declined' }
    })

    // If accepted, add user to the game
    if (action === 'accept') {
      await prisma.game.update({
        where: { id: gameInvite.gameId },
        data: {
          players: {
            connect: { id: session.user.id }
          },
          status: gameInvite.game.players.length === 1 ? 'in_progress' : 'waiting'
        }
      })
    }

    return NextResponse.json({
      success: true,
      gameInvite: updatedInvite
    })

  } catch (error) {
    console.error('Error processing game invite:', error)
    return NextResponse.json({ error: 'Failed to process game invite' }, { status: 500 })
  }
}

// Delete a game invite
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAuthSession()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: inviteId } = await params

    // Find the game invite
    const gameInvite = await prisma.gameInvite.findUnique({
      where: { id: inviteId }
    })

    if (!gameInvite) {
      return NextResponse.json({ error: 'Game invite not found' }, { status: 404 })
    }

    // Check if current user is the sender
    if (gameInvite.senderId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized to delete this invite' }, { status: 403 })
    }

    // Delete the invite
    await prisma.gameInvite.delete({
      where: { id: inviteId }
    })

    return NextResponse.json({
      success: true,
      message: 'Game invite deleted'
    })

  } catch (error) {
    console.error('Error deleting game invite:', error)
    return NextResponse.json({ error: 'Failed to delete game invite' }, { status: 500 })
  }
}
