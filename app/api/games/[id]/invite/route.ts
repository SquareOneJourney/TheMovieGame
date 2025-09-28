import { NextRequest, NextResponse } from 'next/server'
import { getAuthSession } from '@/lib/api-auth'
import { prisma } from '@/lib/prisma'

// Send a game invite
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAuthSession()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: gameId } = await params
    const { receiverId } = await request.json()

    if (!receiverId) {
      return NextResponse.json({ error: 'Receiver ID is required' }, { status: 400 })
    }

    // Check if game exists and user is a player
    const game = await prisma.game.findUnique({
      where: { id: gameId },
      include: { players: true }
    })

    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 })
    }

    const isPlayer = game.players.some(player => player.id === session.user.id)
    if (!isPlayer) {
      return NextResponse.json({ error: 'Not a player in this game' }, { status: 403 })
    }

    // Check if receiver is already a player
    const isAlreadyPlayer = game.players.some(player => player.id === receiverId)
    if (isAlreadyPlayer) {
      return NextResponse.json({ error: 'User is already a player in this game' }, { status: 400 })
    }

    // Check if there's already a pending invite
    const existingInvite = await prisma.gameInvite.findFirst({
      where: {
        gameId,
        receiverId,
        status: 'pending'
      }
    })

    if (existingInvite) {
      return NextResponse.json({ error: 'Game invite already sent' }, { status: 400 })
    }

    // Create game invite
    const gameInvite = await prisma.gameInvite.create({
      data: {
        senderId: session.user.id,
        receiverId,
        gameId,
        status: 'pending'
      },
      include: {
        receiver: {
          select: { id: true, name: true, email: true }
        },
        game: {
          include: {
            rounds: {
              orderBy: { createdAt: 'desc' },
              take: 1
            }
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      gameInvite
    })

  } catch (error) {
    console.error('Error sending game invite:', error)
    return NextResponse.json({ error: 'Failed to send game invite' }, { status: 500 })
  }
}
