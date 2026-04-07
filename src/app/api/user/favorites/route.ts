import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function GET() {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const favorites = await prisma.favorite.findMany({
      where: { userId: user.id },
      include: {
        lineup: {
          include: {
            map: true,
            user: {
              select: { username: true, avatar: true },
            },
            tags: true,
            _count: {
              select: { favorites: true, comments: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      success: true,
      data: favorites.map(f => f.lineup),
    })
  } catch (error) {
    console.error('Get favorites error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { lineupId } = body

    if (!lineupId) {
      return NextResponse.json(
        { success: false, error: 'Lineup ID is required' },
        { status: 400 }
      )
    }

    // Check if lineup exists
    const lineup = await prisma.lineup.findUnique({
      where: { id: lineupId },
    })

    if (!lineup) {
      return NextResponse.json(
        { success: false, error: 'Lineup not found' },
        { status: 404 }
      )
    }

    // Add to favorites
    const favorite = await prisma.favorite.create({
      data: {
        userId: user.id,
        lineupId,
      },
    })

    return NextResponse.json({
      success: true,
      data: favorite,
      message: 'Added to favorites',
    })
  } catch (error) {
    console.error('Add favorite error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { lineupId } = body

    if (!lineupId) {
      return NextResponse.json(
        { success: false, error: 'Lineup ID is required' },
        { status: 400 }
      )
    }

    await prisma.favorite.deleteMany({
      where: {
        userId: user.id,
        lineupId,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Removed from favorites',
    })
  } catch (error) {
    console.error('Remove favorite error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
