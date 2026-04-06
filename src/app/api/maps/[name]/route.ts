import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { name: string } }
) {
  try {
    const map = await prisma.map.findUnique({
      where: { name: params.name },
      include: {
        _count: {
          select: { lineups: true },
        },
      },
    })

    if (!map) {
      return NextResponse.json(
        { success: false, error: 'Map not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: map,
    })
  } catch (error) {
    console.error('Get map error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
