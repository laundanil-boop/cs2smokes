import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const tactical = searchParams.get('tactical')
    const premium = searchParams.get('premium')

    if (tactical === 'true' && premium === 'true') {
      const tacticalRounds = await prisma.tacticalRound.findMany({
        include: {
          map: true,
        },
        orderBy: { createdAt: 'desc' },
      })

      // Преобразуем в формат для отображения
      const rounds = tacticalRounds.map(tr => ({
        id: tr.id,
        title: tr.title,
        description: tr.description,
        map: tr.map,
        side: tr.side,
        youtubeId: tr.youtubeId,
        videoPath: tr.videoPath,
        createdAt: tr.createdAt,
      }))

      return NextResponse.json({
        success: true,
        data: {
          rounds,
          total: rounds.length,
        },
      })
    }

    return NextResponse.json({
      success: true,
      data: { lineups: [], total: 0 },
    })
  } catch (error) {
    console.error('Get tactical rounds error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
