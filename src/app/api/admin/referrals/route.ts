import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - получение статистики рефералов
export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'root' && currentUser.role !== 'media')) {
      return NextResponse.json(
        { success: false, error: 'Not authorized' },
        { status: 403 }
      )
    }

    // Получаем все реферальные коды со статистикой
    const referrals = await prisma.referral.findMany({
      include: {
        user: {
          select: {
            username: true,
            email: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Получаем количество использований для каждого реферального кода
    const referralsWithCount = await Promise.all(
      referrals.map(async (referral) => {
        // Считаем сколько пользователей было приглашено этим кодом
        const referredCount = await prisma.user.count({
          where: {
            referredByUserId: referral.userId
          }
        })

        return {
          ...referral,
          referredCount,
          usesCount: referral.usesCount // Используем поле usesCount из модели Referral
        }
      })
    )

    // Получаем статистику по использованиям промокодов блогеров
    const bloggerPromoCodes = await prisma.bloggerPromoCode.findMany({
      include: {
        _count: {
          select: { usages: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      success: true,
      data: {
        referrals: referralsWithCount,
        bloggerPromoCodes,
      },
    })
  } catch (error) {
    console.error('Get referrals error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - создание реферального кода для пользователя
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
    const { userId, code } = body

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'UserID обязателен' },
        { status: 400 }
      )
    }

    // Проверяем, есть ли уже реферальный код
    const existing = await prisma.referral.findUnique({
      where: { userId }
    })

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Реферальный код уже существует' },
        { status: 400 }
      )
    }

    // Генерируем код
    const referralCode = code || `REF${userId.substring(0, 8).toUpperCase()}`

    const referral = await prisma.referral.create({
      data: {
        userId,
        code: referralCode,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Реферальный код создан',
      data: referral,
    })
  } catch (error) {
    console.error('Create referral error:', error)
    return NextResponse.json(
      { success: false, error: 'Ошибка сервера' },
      { status: 500 }
    )
  }
}
