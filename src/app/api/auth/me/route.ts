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

    const fullUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        premium: true,
        _count: {
          select: {
            lineups: true,
            favorites: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        id: fullUser?.id,
        email: fullUser?.email,
        username: fullUser?.username,
        avatar: fullUser?.avatar,
        role: fullUser?.role,
        createdAt: fullUser?.createdAt,
        _count: fullUser?._count,
        premium: fullUser?.premium ? {
          isActive: fullUser.premium.isActive && (!fullUser.premium.expiresAt || fullUser.premium.expiresAt > new Date()),
          expiresAt: fullUser.premium.expiresAt,
          isLifetime: fullUser.premium.expiresAt === null,
        } : null,
      },
    })
  } catch (error) {
    console.error('Get user error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
