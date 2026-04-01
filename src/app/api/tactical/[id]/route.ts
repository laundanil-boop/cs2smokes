import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tacticalRound = await prisma.tacticalRound.findUnique({
      where: { id: params.id },
      include: {
        map: true,
      },
    })

    if (!tacticalRound) {
      return NextResponse.json(
        { success: false, error: 'Not found' },
        { status: 404 }
      )
    }

    // Увеличиваем счетчик просмотров
    await prisma.tacticalRound.update({
      where: { id: params.id },
      data: { views: tacticalRound.views + 1 },
    })

    return NextResponse.json({
      success: true,
      data: tacticalRound,
    })
  } catch (error) {
    console.error('Get tactical round error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
