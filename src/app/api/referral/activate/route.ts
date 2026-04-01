import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST - активация реферального кода (когда новый пользователь регистрируется по коду)
export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: 'Не авторизованы' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { code } = body

    if (!code) {
      return NextResponse.json(
        { success: false, error: 'Введите реферальный код' },
        { status: 400 }
      )
    }

    // Проверяем, нет ли уже реферала у этого пользователя
    if (currentUser.referredByUserId) {
      return NextResponse.json(
        { success: false, error: 'Вы уже были приглашены другим пользователем' },
        { status: 400 }
      )
    }

    // Находим реферальный код
    const referral = await prisma.referral.findUnique({
      where: { code: code.trim().toUpperCase() },
      include: {
        user: true
      }
    })

    if (!referral) {
      return NextResponse.json(
        { success: false, error: 'Реферальный код не найден' },
        { status: 404 }
      )
    }

    // Проверяем, не сам ли себя приглашает
    if (referral.userId === currentUser.id) {
      return NextResponse.json(
        { success: false, error: 'Нельзя пригласить самого себя' },
        { status: 400 }
      )
    }

    // Обновляем пользователя - добавляем реферала
    await prisma.user.update({
      where: { id: currentUser.id },
      data: {
        referredByUserId: referral.userId,
      }
    })

    // Увеличиваем счетчик использований
    await prisma.referral.update({
      where: { id: referral.id },
      data: {
        usesCount: referral.usesCount + 1,
      }
    })

    // Выдаем бонус обоим (например, 7 дней подписки)
    const bonusDays = 7
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + bonusDays)

    // Выдаем подписку пригласившему
    const referrerPremium = await prisma.premiumSubscription.findUnique({
      where: { userId: referral.userId }
    })

    if (referrerPremium) {
      const newExpiresAt = referrerPremium.expiresAt 
        ? new Date(Math.max(referrerPremium.expiresAt.getTime(), new Date().getTime()))
        : new Date()
      newExpiresAt.setDate(newExpiresAt.getDate() + bonusDays)

      await prisma.premiumSubscription.update({
        where: { userId: referral.userId },
        data: {
          isActive: true,
          expiresAt: newExpiresAt,
        }
      })
    } else {
      await prisma.premiumSubscription.create({
        data: {
          userId: referral.userId,
          isActive: true,
          expiresAt,
        }
      })
    }

    // Выдаем подписку приглашенному
    const invitedUserPremium = await prisma.premiumSubscription.findUnique({
      where: { userId: currentUser.id }
    })

    if (invitedUserPremium) {
      const newExpiresAt = invitedUserPremium.expiresAt 
        ? new Date(Math.max(invitedUserPremium.expiresAt.getTime(), new Date().getTime()))
        : new Date()
      newExpiresAt.setDate(newExpiresAt.getDate() + bonusDays)

      await prisma.premiumSubscription.update({
        where: { userId: currentUser.id },
        data: {
          isActive: true,
          expiresAt: newExpiresAt,
        }
      })
    } else {
      await prisma.premiumSubscription.create({
        data: {
          userId: currentUser.id,
          isActive: true,
          expiresAt,
        }
      })
    }

    return NextResponse.json({
      success: true,
      message: `Реферальный код активирован! Вы и ${referral.user.username} получили ${bonusDays} дней Premium`,
      data: {
        bonusDays,
        referrerUsername: referral.user.username,
      }
    })
  } catch (error) {
    console.error('Activate referral error:', error)
    return NextResponse.json(
      { success: false, error: 'Ошибка сервера' },
      { status: 500 }
    )
  }
}
