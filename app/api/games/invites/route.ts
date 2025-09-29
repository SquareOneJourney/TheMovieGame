import { NextRequest, NextResponse } from 'next/server'
import { getAuthSession } from '@/lib/api-auth'
import { prisma } from '@/lib/prisma'

// Send a game invite to a friend
export async function POST(request: NextRequest) {
  try {
    const session = await getAuthSession()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { receiverId, gameId } = await request.json()
    
    if (!receiverId || !gameId) {
      return NextResponse.json({ 
        error: 'Receiver ID and Game ID are required' 
      }, { status: 400 })
    }

    if (receiverId === session.user.id) {
      return NextResponse.json({ 
        error: 'Cannot invite yourself to a game' 
      }, { status: 400 })
    }

    // Check if game exists and user is a player
    const game = await prisma.game.findUnique({
      where: { id: gameId },
      include: { players: true }
    })

    if (!game) {
      return NextResponse.json({ 
        error: 'Game not found' 
      }, { status: 404 })
    }

    // Check if user is a player in the game
    const isPlayer = game.players.some((player: any) => player.id === session.user.id)
    if (!isPlayer) {
      return NextResponse.json({ 
        error: 'You must be a player in the game to send invites' 
      }, { status: 403 })
    }

    // Check if receiver exists
    const receiver = await prisma.user.findUnique({
      where: { id: receiverId }
    })

    if (!receiver) {
      return NextResponse.json({ 
        error: 'User not found' 
      }, { status: 404 })
    }

    // Check if users are friends
    const friendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          { user1Id: session.user.id, user2Id: receiverId },
          { user1Id: receiverId, user2Id: session.user.id }
        ]
      }
    })

    if (!friendship) {
      return NextResponse.json({ 
        error: 'You can only invite friends to games' 
      }, { status: 400 })
    }

    // Check if invite already exists
    const existingInvite = await prisma.gameInvite.findFirst({
      where: {
        senderId: session.user.id,
        receiverId: receiverId,
        gameId: gameId,
        status: 'pending'
      }
    })

    if (existingInvite) {
      return NextResponse.json({ 
        error: 'Game invite already sent' 
      }, { status: 400 })
    }

    // Create game invite
    const gameInvite = await prisma.gameInvite.create({
      data: {
        senderId: session.user.id,
        receiverId: receiverId,
        gameId: gameId,
        status: 'pending'
      },
      include: {
        receiver: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        game: {
          select: {
            id: true,
            status: true,
            createdAt: true
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

// Get game invites (sent and received)
export async function GET(request: NextRequest) {
  try {
    const session = await getAuthSession()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'received' // 'sent' or 'received'

    let gameInvites

    if (type === 'sent') {
      gameInvites = await prisma.gameInvite.findMany({
        where: {
          senderId: session.user.id,
          status: 'pending'
        },
        include: {
          receiver: {
            select: {
              id: true,
              name: true,
              email: true,
              score: true
            }
          },
          game: {
            select: {
              id: true,
              status: true,
              createdAt: true,
              players: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })
    } else {
      gameInvites = await prisma.gameInvite.findMany({
        where: {
          receiverId: session.user.id,
          status: 'pending'
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              email: true,
              score: true
            }
          },
          game: {
            select: {
              id: true,
              status: true,
              createdAt: true,
              players: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })
    }

    return NextResponse.json({
      success: true,
      gameInvites
    })

  } catch (error) {
    console.error('Error fetching game invites:', error)
    return NextResponse.json({ error: 'Failed to fetch game invites' }, { status: 500 })
  }
}
