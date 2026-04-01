import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

// GET /api/positions - Получить все позиции или позиции для конкретной карты
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const mapId = searchParams.get('mapId')
    const mapName = searchParams.get('map')

    // Если указан mapId или mapName, возвращаем позиции для этой карты
    if (mapId || mapName) {
      const whereClause: any = {}
      
      if (mapId) {
        whereClause.mapId = mapId
      } else if (mapName) {
        const map = await prisma.map.findUnique({
          where: { name: mapName },
        })
        if (!map) {
          return NextResponse.json(
            { success: false, error: 'Карта не найдена' },
            { status: 404 }
          )
        }
        whereClause.mapId = map.id
      }

      const positions = await prisma.lineupPosition.findMany({
        where: whereClause,
        include: {
          map: true,
          lineups: {
            include: {
              user: {
                select: {
                  username: true,
                  avatar: true,
                },
              },
              tags: {
                include: {
                  tag: true,
                },
              },
            },
          },
          _count: {
            select: { lineups: true },
          },
        },
        orderBy: { name: 'asc' },
      })

      return NextResponse.json({ success: true, data: positions })
    }

    // Возвращаем все позиции
    const positions = await prisma.lineupPosition.findMany({
      include: {
        map: true,
        _count: {
          select: { lineups: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, data: positions })
  } catch (error) {
    console.error('Error fetching positions:', error)
    return NextResponse.json(
      { success: false, error: 'Ошибка при загрузке позиций' },
      { status: 500 }
    )
  }
}

// POST /api/positions - Создать новую позицию
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Необходима авторизация' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      name,
      mapId,
      imageUrl,
      positionX,
      positionY,
      description,
    } = body

    // Валидация
    if (!name || !mapId) {
      return NextResponse.json(
        { success: false, error: 'Название и карта обязательны' },
        { status: 400 }
      )
    }

    if (positionX === undefined || positionY === undefined) {
      return NextResponse.json(
        { success: false, error: 'Координаты позиции обязательны' },
        { status: 400 }
      )
    }

    // Проверка существования карты
    const map = await prisma.map.findUnique({
      where: { id: mapId },
    })

    if (!map) {
      return NextResponse.json(
        { success: false, error: 'Карта не найдена' },
        { status: 404 }
      )
    }

    // Создание позиции
    const position = await prisma.lineupPosition.create({
      data: {
        name,
        mapId,
        imageUrl: imageUrl || null,
        positionX: parseFloat(positionX),
        positionY: parseFloat(positionY),
        description: description || null,
      },
      include: {
        map: true,
      },
    })

    return NextResponse.json({ success: true, data: position })
  } catch (error) {
    console.error('Error creating position:', error)
    return NextResponse.json(
      { success: false, error: 'Ошибка при создании позиции' },
      { status: 500 }
    )
  }
}
