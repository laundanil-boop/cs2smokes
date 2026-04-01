import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const lineup = await prisma.lineup.findUnique({
      where: { id: params.id },
      include: {
        map: true,
        user: {
          select: { id: true, username: true, avatar: true },
        },
        tags: {
          include: {
            tag: true,
          },
        },
        comments: {
          include: {
            user: {
              select: { username: true, avatar: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: { favorites: true },
        },
      },
    })

    if (!lineup) {
      return NextResponse.json(
        { success: false, error: 'Lineup not found' },
        { status: 404 }
      )
    }

    // Increment views
    await prisma.lineup.update({
      where: { id: params.id },
      data: { views: lineup.views + 1 },
    })

    // Check if current user has favorited this lineup
    const currentUser = await getCurrentUser()
    let isFavorite = false
    if (currentUser) {
      const favorite = await prisma.favorite.findUnique({
        where: {
          userId_lineupId: {
            userId: currentUser.id,
            lineupId: params.id,
          },
        },
      })
      isFavorite = !!favorite
    }

    // Десериализуем throwPosition и steps
    const deserializedLineup = {
      ...lineup,
      throwPosition: lineup.throwPosition ? JSON.parse(lineup.throwPosition) : null,
      steps: lineup.steps ? JSON.parse(lineup.steps) : null,
      isFavorite,
    }

    return NextResponse.json({
      success: true,
      data: deserializedLineup,
    })
  } catch (error) {
    console.error('Get lineup error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const lineup = await prisma.lineup.findUnique({
      where: { id: params.id },
    })

    if (!lineup) {
      return NextResponse.json(
        { success: false, error: 'Lineup not found' },
        { status: 404 }
      )
    }

    // Проверка: владелец или админ
    const isAdmin = user.role === 'admin' || user.role === 'root'
    if (lineup.userId !== user.id && !isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { title, description, youtubeId, difficulty } = body

    const updatedLineup = await prisma.lineup.update({
      where: { id: params.id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(youtubeId && { youtubeId }),
        ...(difficulty && { difficulty }),
      },
      include: {
        map: true,
        user: {
          select: { username: true, avatar: true },
        },
        tags: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: updatedLineup,
    })
  } catch (error) {
    console.error('Update lineup error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const lineup = await prisma.lineup.findUnique({
      where: { id: params.id },
    })

    if (!lineup) {
      return NextResponse.json(
        { success: false, error: 'Lineup not found' },
        { status: 404 }
      )
    }

    // Проверка: владелец или админ
    const isAdmin = user.role === 'admin' || user.role === 'root'
    if (lineup.userId !== user.id && !isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      )
    }

    await prisma.lineup.delete({
      where: { id: params.id },
    })

    return NextResponse.json({
      success: true,
      message: 'Lineup deleted successfully',
    })
  } catch (error) {
    console.error('Delete lineup error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
