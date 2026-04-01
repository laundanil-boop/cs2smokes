import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST - активация промокода пользователем
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
        { success: false, error: 'Введите промокод' },
        { status: 400 }
      )
    }

    // Находим промокод
    const promoCode = await prisma.promoCode.findUnique({
      where: { code: code.trim().toUpperCase() },
      include: {
        usages: true, // Получаем все использования для проверки лимита
      }
    })

    if (!promoCode) {
      return NextResponse.json(
        { success: false, error: 'Промокод не найден' },
        { status: 404 }
      )
    }

    // Проверяем активен ли промокод
    if (!promoCode.isActive) {
      return NextResponse.json(
        { success: false, error: 'Промокод не активен' },
        { status: 400 }
      )
    }

    // Проверяем срок действия
    if (promoCode.expiresAt && promoCode.expiresAt < new Date()) {
      return NextResponse.json(
        { success: false, error: 'Срок действия промокода истек' },
        { status: 400 }
      )
    }

    // Проверяем лимит использований (общее количество)
    if (promoCode.maxUses && promoCode.usages.length >= promoCode.maxUses) {
      return NextResponse.json(
        { success: false, error: 'Лимит активаций промокода исчерпан' },
        { status: 400 }
      )
    }

    // Проверяем, не использовал ли уже этот промокод текущий пользователь
    const alreadyUsed = promoCode.usages.some(usage => usage.userId === currentUser.id)
    if (alreadyUsed) {
      return NextResponse.json(
        { success: false, error: 'Вы уже активировали этот промокод' },
        { status: 400 }
      )
    }

    // Создаем запись об использовании
    await prisma.promoCodeUsage.create({
      data: {
        promoCodeId: promoCode.id,
        userId: currentUser.id,
      }
    })

    // Обновляем счетчик использований
    await prisma.promoCode.update({
      where: { id: promoCode.id },
      data: {
        usedCount: promoCode.usedCount + 1
      }
    })

    // Выдаем подписку
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + promoCode.days)

    const existingPremium = await prisma.premiumSubscription.findUnique({
      where: { userId: currentUser.id }
    })

    if (existingPremium) {
      // Если уже есть подписка, продлеваем
      const newExpiresAt = existingPremium.expiresAt 
        ? new Date(Math.max(existingPremium.expiresAt.getTime(), new Date().getTime()))
        : new Date()
      newExpiresAt.setDate(newExpiresAt.getDate() + promoCode.days)

      await prisma.premiumSubscription.update({
        where: { userId: currentUser.id },
        data: {
          isActive: true,
          expiresAt: newExpiresAt,
        }
      })
    } else {
      // Создаем новую подписку
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
      message: `Промокод активирован! Подписка продлена на ${promoCode.days} дн.`,
      data: {
        days: promoCode.days,
        expiresAt,
      }
    })
  } catch (error) {
    console.error('Activate promo code error:', error)
    return NextResponse.json(
      { success: false, error: 'Ошибка сервера' },
      { status: 500 }
    )
  }
}
