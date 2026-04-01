import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - получение лайнапов на модерации
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
    const status = searchParams.get('status') || 'PENDING'

    const lineups = await prisma.lineup.findMany({
      where: {
        isUserGenerated: true,
        moderationStatus: status,
      },
      include: {
        map: true,
        user: {
          select: {
            username: true,
            email: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      success: true,
      data: lineups,
    })
  } catch (error) {
    console.error('Get lineups for moderation error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - одобрить лайнап
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
    const { id } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID обязателен' },
        { status: 400 }
      )
    }

    await prisma.lineup.update({
      where: { id },
      data: {
        moderationStatus: 'APPROVED',
        reviewedAt: new Date(),
        reviewedBy: currentUser.id,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Лайнап одобрен',
    })
  } catch (error) {
    console.error('Approve lineup error:', error)
    return NextResponse.json(
      { success: false, error: 'Ошибка сервера' },
      { status: 500 }
    )
  }
}

// DELETE - отклонить лайнап
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
    const { id, reason, action } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID обязателен' },
        { status: 400 }
      )
    }

    // Если action = 'delete', удаляем лайнап
    if (action === 'delete') {
      await prisma.lineup.delete({
        where: { id },
      })

      return NextResponse.json({
        success: true,
        message: 'Лайнап удален',
      })
    }

    // Иначе отклоняем (reject)
    if (!reason || reason.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Укажите причину отказа' },
        { status: 400 }
      )
    }

    await prisma.lineup.update({
      where: { id },
      data: {
        moderationStatus: 'REJECTED',
        rejectionReason: reason,
        reviewedAt: new Date(),
        reviewedBy: currentUser.id,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Лайнап отклонен',
    })
  } catch (error) {
    console.error('Reject/delete lineup error:', error)
    return NextResponse.json(
      { success: false, error: 'Ошибка сервера' },
      { status: 500 }
    )
  }
}
