import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const maps = await prisma.map.findMany({
      include: {
        _count: {
          select: { lineups: true },
        },
      },
      orderBy: { displayName: 'asc' },
    })

    return NextResponse.json({
      success: true,
      data: maps,
    })
  } catch (error) {
    console.error('Get maps error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, displayName, imageUrl, description } = body

    if (!name || !displayName) {
      return NextResponse.json(
        { success: false, error: 'Название и отображаемое название обязательны' },
        { status: 400 }
      )
    }

    // Проверка на существующую карту
    const existingMap = await prisma.map.findUnique({
      where: { name },
    })

    if (existingMap) {
      return NextResponse.json(
        { success: false, error: 'Карта с таким названием уже существует' },
        { status: 400 }
      )
    }

    const map = await prisma.map.create({
      data: {
        name,
        displayName,
        imageUrl: imageUrl || null,
        description: description || null,
      },
    })

    return NextResponse.json({
      success: true,
      data: map,
    })
  } catch (error) {
    console.error('Create map error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const name = searchParams.get('name')

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Название карты обязательно' },
        { status: 400 }
      )
    }

    await prisma.map.delete({
      where: { name },
    })

    return NextResponse.json({
      success: true,
      message: 'Карта успешно удалена',
    })
  } catch (error) {
    console.error('Delete map error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
