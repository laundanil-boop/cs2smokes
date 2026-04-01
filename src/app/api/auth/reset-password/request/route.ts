import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'
import { sendPasswordResetEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email обязателен' },
        { status: 400 }
      )
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    })

    // Don't reveal if user exists
    if (!user) {
      return NextResponse.json({
        success: true,
        message: 'Если пользователь с таким email существует, вы получите письмо',
      })
    }

    // Generate reset token
    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 3600000) // 1 hour

    // Delete old tokens
    await prisma.passwordResetToken.deleteMany({
      where: { userId: user.id },
    })

    // Create new token
    await prisma.passwordResetToken.create({
      data: {
        email: user.email,
        token,
        expiresAt,
        userId: user.id,
      },
    })

    // Send email
    await sendPasswordResetEmail(user.email, token)

    return NextResponse.json({
      success: true,
      message: 'Если пользователь с таким email существует, вы получите письмо',
    })
  } catch (error) {
    console.error('Reset password request error:', error)
    return NextResponse.json(
      { success: false, error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}
