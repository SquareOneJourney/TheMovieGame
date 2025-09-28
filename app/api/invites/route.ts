import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

// Get user's game invites
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

    const gameInvites = await prisma.gameInvite.findMany({
      where: whereClause,
      include: {
        sender: {
          select: { id: true, name: true, email: true }
        },
        receiver: {
          select: { id: true, name: true, email: true }
        },
        game: {
          include: {
            players: {
              select: { id: true, name: true }
            },
            rounds: {
              orderBy: { createdAt: 'desc' },
              take: 1
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      success: true,
      gameInvites
    })

  } catch (error) {
    console.error('Error fetching game invites:', error)
    return NextResponse.json({ error: 'Failed to fetch game invites' }, { status: 500 })
  }
}
