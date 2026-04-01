import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { randomBytes } from 'crypto'

// Генерация случайного промокода
function generatePromoCode(length: number = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// GET - получение всех промокодов
export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'moderator')) {
      return NextResponse.json(
        { success: false, error: 'Not authorized' },
        { status: 403 }
      )
    }

    const promoCodes = await prisma.promoCode.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { usages: true }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: promoCodes,
    })
  } catch (error) {
    console.error('Get promo codes error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - создание промокода
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
    const { code, days, maxUses, expiresAt } = body

    // Валидация
    if (!days || days < 1 || days > 30) {
      return NextResponse.json(
        { success: false, error: 'Количество дней должно быть от 1 до 30' },
        { status: 400 }
      )
    }

    // Генерация кода если не предоставлен
    const promoCode = code || generatePromoCode()

    // Проверка на уникальность
    const existing = await prisma.promoCode.findUnique({
      where: { code: promoCode }
    })

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Такой промокод уже существует' },
        { status: 400 }
      )
    }

    const newPromoCode = await prisma.promoCode.create({
      data: {
        code: promoCode,
        days,
        maxUses: maxUses || null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        isActive: true,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Промокод создан',
      data: newPromoCode,
    })
  } catch (error) {
    console.error('Create promo code error:', error)
    return NextResponse.json(
      { success: false, error: 'Ошибка сервера' },
      { status: 500 }
    )
  }
}

// DELETE - удаление промокода
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
    const { id } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID обязателен' },
        { status: 400 }
      )
    }

    await prisma.promoCode.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'Промокод удален',
    })
  } catch (error) {
    console.error('Delete promo code error:', error)
    return NextResponse.json(
      { success: false, error: 'Ошибка сервера' },
      { status: 500 }
    )
  }
}
