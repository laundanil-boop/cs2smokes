import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const secret = searchParams.get('secret')
    const premium = searchParams.get('premium')

    if (secret === 'true' && premium === 'true') {
      const secretGrenades = await prisma.secretGrenade.findMany({
        include: {
          map: true,
        },
        orderBy: { createdAt: 'desc' },
      })

      // Преобразуем в формат совместимый с LineupCard
      const lineups = secretGrenades.map(sg => ({
        id: sg.id,
        title: sg.title,
        description: sg.description,
        mapId: sg.mapId,
        map: sg.map,
        positionId: null,
        grenadeType: sg.grenadeType,
        side: sg.side,
        youtubeId: sg.youtubeId,
        videoPath: sg.videoPath,
        thumbnailUrl: sg.thumbnailUrl,
        throwPosition: sg.throwPosition ? JSON.parse(sg.throwPosition) : null,
        steps: sg.steps ? JSON.parse(sg.steps) : [],
        difficulty: 'MEDIUM',
        views: sg.views,
        isUserGenerated: false,
        isPremium: sg.isPremium,
        userId: 'admin',
        user: { username: 'Admin', avatar: null },
        createdAt: sg.createdAt,
        updatedAt: sg.updatedAt,
        _count: { favorites: 0 },
      }))

      return NextResponse.json({
        success: true,
        data: {
          lineups,
          total: lineups.length,
        },
      })
    }

    return NextResponse.json({
      success: true,
      data: { lineups: [], total: 0 },
    })
  } catch (error) {
    console.error('Get secret grenades error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
