import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const premium = await prisma.premiumSubscription.findUnique({
      where: { userId: user.id },
    })

    if (!premium) {
      return NextResponse.json({
        success: true,
        data: {
          isActive: false,
          expiresAt: null,
          isLifetime: false,
        },
      })
    }

    // Проверяем, не истекла ли подписка
    const now = new Date()
    let isActive = premium.isActive

    if (premium.expiresAt && premium.expiresAt < now) {
      isActive = false
      // Обновляем статус подписки
      await prisma.premiumSubscription.update({
        where: { id: premium.id },
        data: { isActive: false },
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        isActive,
        expiresAt: premium.expiresAt,
        isLifetime: premium.expiresAt === null,
      },
    })
  } catch (error) {
    console.error('Get premium status error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
