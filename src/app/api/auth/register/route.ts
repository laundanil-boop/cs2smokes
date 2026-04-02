import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  username: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  refCode: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validation = registerSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.errors[0].message },
        { status: 400 }
      )
    }

    const { email, username, password, refCode } = validation.data

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username },
        ],
      },
    })

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: existingUser.email === email ? 'Email already registered' : 'Username already taken' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Find referral if code provided
    let referredByUserId: string | null = null
    let bloggerPromoCodeUsed: string | null = null
    
    if (refCode) {
      // Сначала проверяем как промокод блогера
      const bloggerPromoCode = await prisma.bloggerPromoCode.findUnique({
        where: { code: refCode },
      })
      
      if (bloggerPromoCode) {
        bloggerPromoCodeUsed = bloggerPromoCode.code
      } else {
        // Если не промокод блогера, проверяем как реферальный код
        const referral = await prisma.referral.findUnique({
          where: { code: refCode },
        })
        if (referral) {
          referredByUserId = referral.userId
        }
      }
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        referredByUserId: referredByUserId || undefined,
      },
    })

    // If referred, update referral count and give bonus
    if (referredByUserId) {
      await prisma.referral.update({
        where: { userId: referredByUserId },
        data: { usesCount: { increment: 1 } },
      })

      // Give bonus to referrer (7 days premium)
      const bonusDays = 7
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + bonusDays)

      const referrerPremium = await prisma.premiumSubscription.findUnique({
        where: { userId: referredByUserId },
      })

      if (referrerPremium) {
        const newExpiresAt = referrerPremium.expiresAt
          ? new Date(Math.max(referrerPremium.expiresAt.getTime(), new Date().getTime()))
          : new Date()
        newExpiresAt.setDate(newExpiresAt.getDate() + bonusDays)

        await prisma.premiumSubscription.update({
          where: { userId: referredByUserId },
          data: {
            isActive: true,
            expiresAt: newExpiresAt,
          },
        })
      } else {
        await prisma.premiumSubscription.create({
          data: {
            userId: referredByUserId,
            isActive: true,
            expiresAt,
          },
        })
      }

      // Give bonus to new user
      await prisma.premiumSubscription.create({
        data: {
          userId: user.id,
          isActive: true,
          expiresAt,
        },
      })
    }

    // If blogger promo code used, activate it
    if (bloggerPromoCodeUsed) {
      const bloggerPromoCode = await prisma.bloggerPromoCode.findUnique({
        where: { code: bloggerPromoCodeUsed },
      })

      if (bloggerPromoCode) {
        // Check max uses
        if (!bloggerPromoCode.maxUses || bloggerPromoCode.usedCount < bloggerPromoCode.maxUses) {
          // Give premium to user
          const expiresAt = new Date()
          expiresAt.setDate(expiresAt.getDate() + bloggerPromoCode.days)

          await prisma.premiumSubscription.create({
            data: {
              userId: user.id,
              isActive: true,
              expiresAt,
            },
          })

          // Update usage count
          await prisma.bloggerPromoCode.update({
            where: { code: bloggerPromoCodeUsed },
            data: {
              usedCount: { increment: 1 },
            },
          })

          // Create usage record
          await prisma.bloggerPromoCodeUsage.create({
            data: {
              promoCodeId: bloggerPromoCode.id,
              userId: user.id,
            },
          })
        }
      }
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          id: user.id,
          email: user.email,
          username: user.username,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
