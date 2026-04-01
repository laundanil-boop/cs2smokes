import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser()

    console.log('Current user:', currentUser)

    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: 'Не авторизованы' },
        { status: 401 }
      )
    }

    if (currentUser.role !== 'admin' && currentUser.role !== 'moderator') {
      return NextResponse.json(
        { success: false, error: 'Недостаточно прав. Требуется роль администратора или модератора.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { username, days } = body

    console.log('Request body:', { username, days })

    if (!username) {
      return NextResponse.json(
        { success: false, error: 'Username обязателен' },
        { status: 400 }
      )
    }

    // Находим пользователя по username
    const targetUser = await prisma.user.findUnique({
      where: { username },
    })

    console.log('Target user:', targetUser)

    if (!targetUser) {
      return NextResponse.json(
        { success: false, error: `Пользователь "${username}" не найден` },
        { status: 404 }
      )
    }

    // Вычисляем дату истечения (null = бесконечно)
    let expiresAt: Date | null = null
    if (days && days > 0) {
      expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + days)
    }

    console.log('Expires at:', expiresAt)

    // Проверяем, есть ли уже подписка
    const existingPremium = await prisma.premiumSubscription.findUnique({
      where: { userId: targetUser.id },
    })

    console.log('Existing premium:', existingPremium)

    if (existingPremium) {
      // Обновляем существующую подписку
      await prisma.premiumSubscription.update({
        where: { userId: targetUser.id },
        data: {
          isActive: true,
          expiresAt,
        },
      })
    } else {
      // Создаем новую подписку
      await prisma.premiumSubscription.create({
        data: {
          userId: targetUser.id,
          isActive: true,
          expiresAt,
        },
      })
    }

    return NextResponse.json({
      success: true,
      message: `Premium подписка выдана пользователю ${username}${days ? ` на ${days} дн.` : ' (бессрочно)'}`,
      data: {
        username: targetUser.username,
        expiresAt,
        isLifetime: expiresAt === null,
      },
    })
  } catch (error) {
    console.error('Give premium error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка'
    return NextResponse.json(
      { success: false, error: `Ошибка сервера: ${errorMessage}` },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: 'Не авторизованы' },
        { status: 401 }
      )
    }

    if (currentUser.role !== 'admin' && currentUser.role !== 'moderator') {
      return NextResponse.json(
        { success: false, error: 'Недостаточно прав' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { username } = body

    if (!username) {
      return NextResponse.json(
        { success: false, error: 'Username обязателен' },
        { status: 400 }
      )
    }

    // Находим пользователя по username
    const targetUser = await prisma.user.findUnique({
      where: { username },
    })

    if (!targetUser) {
      return NextResponse.json(
        { success: false, error: `Пользователь "${username}" не найден` },
        { status: 404 }
      )
    }

    // Проверяем, есть ли подписка
    const existingPremium = await prisma.premiumSubscription.findUnique({
      where: { userId: targetUser.id },
    })

    if (!existingPremium) {
      return NextResponse.json(
        { success: false, error: 'У пользователя нет Premium подписки' },
        { status: 404 }
      )
    }

    // Удаляем подписку
    await prisma.premiumSubscription.delete({
      where: { userId: targetUser.id },
    })

    return NextResponse.json({
      success: true,
      message: `Premium подписка отозвана у пользователя ${username}`,
      data: {
        username: targetUser.username,
      },
    })
  } catch (error) {
    console.error('Revoke premium error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка'
    return NextResponse.json(
      { success: false, error: `Ошибка сервера: ${errorMessage}` },
      { status: 500 }
    )
  }
}
