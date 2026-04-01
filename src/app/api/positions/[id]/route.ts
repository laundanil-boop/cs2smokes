import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

interface RouteParams {
  params: { id: string }
}

// GET /api/positions/[id] - Получить конкретную позицию
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const position = await prisma.lineupPosition.findUnique({
      where: { id: params.id },
      include: {
        map: true,
        lineups: {
          include: {
            user: {
              select: {
                username: true,
                avatar: true,
              },
            },
            tags: {
              include: {
                tag: true,
              },
            },
          },
        },
      },
    })

    if (!position) {
      return NextResponse.json(
        { success: false, error: 'Позиция не найдена' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: position })
  } catch (error) {
    console.error('Error fetching position:', error)
    return NextResponse.json(
      { success: false, error: 'Ошибка при загрузке позиции' },
      { status: 500 }
    )
  }
}

// PATCH /api/positions/[id] - Обновить позицию
export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Необходима авторизация' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      name,
      imageUrl,
      positionX,
      positionY,
      description,
    } = body

    // Проверка существования позиции
    const existingPosition = await prisma.lineupPosition.findUnique({
      where: { id: params.id },
    })

    if (!existingPosition) {
      return NextResponse.json(
        { success: false, error: 'Позиция не найдена' },
        { status: 404 }
      )
    }

    // Обновление позиции
    const position = await prisma.lineupPosition.update({
      where: { id: params.id },
      data: {
        ...(name !== undefined && { name }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(positionX !== undefined && { positionX: parseFloat(positionX) }),
        ...(positionY !== undefined && { positionY: parseFloat(positionY) }),
        ...(description !== undefined && { description }),
      },
      include: {
        map: true,
      },
    })

    return NextResponse.json({ success: true, data: position })
  } catch (error) {
    console.error('Error updating position:', error)
    return NextResponse.json(
      { success: false, error: 'Ошибка при обновлении позиции' },
      { status: 500 }
    )
  }
}

// DELETE /api/positions/[id] - Удалить позицию
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Необходима авторизация' },
        { status: 401 }
      )
    }

    // Проверка существования позиции
    const existingPosition = await prisma.lineupPosition.findUnique({
      where: { id: params.id },
    })

    if (!existingPosition) {
      return NextResponse.json(
        { success: false, error: 'Позиция не найдена' },
        { status: 404 }
      )
    }

    // Удаление позиции (лайнапы останутся, но positionId станет null)
    await prisma.lineupPosition.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting position:', error)
    return NextResponse.json(
      { success: false, error: 'Ошибка при удалении позиции' },
      { status: 500 }
    )
  }
}
