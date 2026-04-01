import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST - ответ на сообщение
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
    const { id, reply } = body

    if (!id || !reply) {
      return NextResponse.json(
        { success: false, error: 'ID и ответ обязательны' },
        { status: 400 }
      )
    }

    await prisma.contactMessage.update({
      where: { id },
      data: {
        adminReply: reply,
        status: 'REPLIED',
        repliedAt: new Date(),
      },
    })

    // Здесь можно добавить отправку email пользователю

    return NextResponse.json({
      success: true,
      message: 'Ответ отправлен',
    })
  } catch (error) {
    console.error('Reply message error:', error)
    return NextResponse.json(
      { success: false, error: 'Ошибка сервера' },
      { status: 500 }
    )
  }
}
