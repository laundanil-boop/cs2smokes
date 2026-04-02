import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

interface RouteParams {
  params: { id: string }
}

// PATCH /api/admin/users/[id]/role - Изменение роли
export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Пользователь не авторизован' },
        { status: 401 }
      )
    }

    if (user.role !== 'admin' && user.role !== 'root') {
      return NextResponse.json(
        { success: false, error: `Доступ запрещён. Ваша роль: ${user.role || 'не указана'}` },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { role } = body

    if (!role || !['user', 'moderator', 'admin'].includes(role)) {
      return NextResponse.json(
        { success: false, error: `Недопустимая роль: ${role}` },
        { status: 400 }
      )
    }

    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: { role },
    })

    return NextResponse.json({
      success: true,
      data: updatedUser,
      message: `Роль пользователя ${updatedUser.username} изменена на ${role}`
    })
  } catch (error) {
    console.error('Error updating role:', error)
    return NextResponse.json(
      { success: false, error: 'Ошибка при изменении роли' },
      { status: 500 }
    )
  }
}
