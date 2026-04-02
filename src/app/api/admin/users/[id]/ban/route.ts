import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

interface RouteParams {
  params: { id: string }
}

// POST /api/admin/users/[id]/ban - Бан/разбан пользователя
export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const user = await getCurrentUser()
    if (!user || (user.role !== 'admin' && user.role !== 'root')) {
      return NextResponse.json(
        { success: false, error: 'Доступ запрещён' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { banned, reason } = body

    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: {
        banned,
        banReason: banned ? reason : null,
      },
    })

    return NextResponse.json({ success: true, data: updatedUser })
  } catch (error) {
    console.error('Error banning user:', error)
    return NextResponse.json(
      { success: false, error: 'Ошибка при изменении статуса пользователя' },
      { status: 500 }
    )
  }
}
