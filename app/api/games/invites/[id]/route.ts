import { NextRequest, NextResponse } from 'next/server'
import { getAuthSession } from '@/lib/api-auth'
import { prisma } from '@/lib/prisma'

// Accept or decline a game invite
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    const inviteId = params.id

    // Find the game invite
    const gameInvite = await prisma.gameInvite.findUnique({
      where: { id: inviteId },
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
        },
        game: {
          include: {
            players: true
          }
        }
      }
    })

    if (!gameInvite) {
      return NextResponse.json({ 
        error: 'Game invite not found' 
      }, { status: 404 })
    }

    // Check if user is the receiver
    if (gameInvite.receiverId !== session.user.id) {
      return NextResponse.json({ 
        error: 'Unauthorized to modify this invite' 
      }, { status: 403 })
    }

    // Check if invite is still pending
    if (gameInvite.status !== 'pending') {
      return NextResponse.json({ 
        error: 'Game invite already processed' 
      }, { status: 400 })
    }

    if (action === 'accept') {
      // Check if game is still waiting for players
      if (gameInvite.game.status !== 'waiting') {
        return NextResponse.json({ 
          error: 'Game is no longer waiting for players' 
        }, { status: 400 })
      }

      // Check if game already has 2 players
      if (gameInvite.game.players.length >= 2) {
        return NextResponse.json({ 
          error: 'Game is full' 
        }, { status: 400 })
      }

      // Accept the game invite
      await prisma.$transaction(async (tx) => {
        // Update the game invite status
        await tx.gameInvite.update({
          where: { id: inviteId },
          data: { status: 'accepted' }
        })

        // Add user to the game
        await tx.game.update({
          where: { id: gameInvite.gameId },
          data: {
            players: {
              connect: { id: session.user.id }
            }
          }
        })

        // Update game status to in_progress if it now has 2 players
        const updatedGame = await tx.game.findUnique({
          where: { id: gameInvite.gameId },
          include: { players: true }
        })

        if (updatedGame && updatedGame.players.length === 2) {
          await tx.game.update({
            where: { id: gameInvite.gameId },
            data: { status: 'in_progress' }
          })
        }
      })

      return NextResponse.json({
        success: true,
        message: 'Game invite accepted',
        gameId: gameInvite.gameId
      })
    } else {
      // Decline the game invite
      await prisma.gameInvite.update({
        where: { id: inviteId },
        data: { status: 'declined' }
      })

      return NextResponse.json({
        success: true,
        message: 'Game invite declined'
      })
    }

  } catch (error) {
    console.error('Error processing game invite:', error)
    return NextResponse.json({ error: 'Failed to process game invite' }, { status: 500 })
  }
}

// Delete a game invite (cancel sent invite)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getAuthSession()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const inviteId = params.id

    // Find the game invite
    const gameInvite = await prisma.gameInvite.findUnique({
      where: { id: inviteId }
    })

    if (!gameInvite) {
      return NextResponse.json({ 
        error: 'Game invite not found' 
      }, { status: 404 })
    }

    // Check if user is the sender
    if (gameInvite.senderId !== session.user.id) {
      return NextResponse.json({ 
        error: 'Unauthorized to delete this invite' 
      }, { status: 403 })
    }

    // Delete the game invite
    await prisma.gameInvite.delete({
      where: { id: inviteId }
    })

    return NextResponse.json({
      success: true,
      message: 'Game invite cancelled'
    })

  } catch (error) {
    console.error('Error deleting game invite:', error)
    return NextResponse.json({ error: 'Failed to delete game invite' }, { status: 500 })
  }
}
