import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q') || ''

    if (!query || query.length < 2) {
      return NextResponse.json({
        success: true,
        data: { lineups: [], maps: [] },
      })
    }

    const [lineups, maps] = await Promise.all([
      prisma.lineup.findMany({
        where: {
          OR: [
            { title: { contains: query } },
            { description: { contains: query } },
          ],
        },
        include: {
          map: true,
          user: {
            select: { username: true, avatar: true },
          },
          _count: {
            select: { favorites: true },
          },
        },
        take: 5,
      }),
      prisma.map.findMany({
        where: {
          OR: [
            { displayName: { contains: query } },
            { description: { contains: query } },
          ],
        },
        take: 3,
      }),
    ])

    return NextResponse.json({
      success: true,
      data: { lineups, maps },
    })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
