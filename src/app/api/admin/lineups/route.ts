import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'moderator')) {
      return NextResponse.json(
        { success: false, error: 'Not authorized' },
        { status: 403 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const userGenerated = searchParams.get('userGenerated')
    const official = searchParams.get('official')

    const where: any = {}

    if (userGenerated === 'true') {
      where.isUserGenerated = true
    } else if (official === 'true') {
      where.isUserGenerated = false
    }

    const lineups = await prisma.lineup.findMany({
      where,
      include: {
        map: true,
        user: {
          select: {
            username: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      success: true,
      data: lineups,
    })
  } catch (error) {
    console.error('Get admin lineups error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
