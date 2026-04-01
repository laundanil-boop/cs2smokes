import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'moderator')) {
      return NextResponse.json(
        { success: false, error: 'Not authorized' },
        { status: 403 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    const tacticalRounds = await prisma.tacticalRound.findMany({
      include: {
        map: true,
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    })

    const total = await prisma.tacticalRound.count()

    return NextResponse.json({
      success: true,
      data: {
        tacticalRounds,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Get tactical rounds error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'moderator')) {
      return NextResponse.json(
        { success: false, error: 'Not authorized' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const {
      title,
      description,
      mapId,
      side,
      youtubeId,
      videoPath,
      thumbnailUrl,
      steps,
    } = body

    if (!title || !mapId || !side) {
      return NextResponse.json(
        { success: false, error: 'Заполните обязательные поля' },
        { status: 400 }
      )
    }

    const tacticalRound = await prisma.tacticalRound.create({
      data: {
        title,
        description,
        mapId,
        side,
        youtubeId,
        videoPath,
        thumbnailUrl,
        steps: steps ? JSON.stringify(steps) : null,
        isPremium: true,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Тактический раунд добавлен',
      data: tacticalRound,
    })
  } catch (error) {
    console.error('Create tactical round error:', error)
    return NextResponse.json(
      { success: false, error: 'Ошибка сервера' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'moderator')) {
      return NextResponse.json(
        { success: false, error: 'Not authorized' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { id } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID обязателен' },
        { status: 400 }
      )
    }

    await prisma.tacticalRound.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: 'Тактический раунд удален',
    })
  } catch (error) {
    console.error('Delete tactical round error:', error)
    return NextResponse.json(
      { success: false, error: 'Ошибка сервера' },
      { status: 500 }
    )
  }
}
