import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { z } from 'zod'

const createLineupSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  mapId: z.string(),
  positionId: z.string().optional(),
  grenadeType: z.enum(['SMOKE', 'MOLOTOV', 'FLASH', 'HE']),
  side: z.enum(['CT', 'T', 'BOTH']),
  youtubeId: z.string().optional(),
  videoPath: z.string().optional(),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).default('MEDIUM'),
  throwPosition: z.object({ x: z.number(), y: z.number(), z: z.number() }).optional(),
  steps: z.array(z.object({ x: z.number(), y: z.number(), description: z.string() })).optional(),
  tagNames: z.array(z.string()).optional(),
  isUserGenerated: z.boolean().optional(),
}).refine(data => data.youtubeId || data.videoPath, {
  message: 'Необходимо указать YouTube ID или загрузить видео',
})

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const map = searchParams.get('map')
    const grenadeType = searchParams.get('grenadeType')
    const side = searchParams.get('side')
    const difficulty = searchParams.get('difficulty')
    const search = searchParams.get('search')
    const userGenerated = searchParams.get('userGenerated')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const tactical = searchParams.get('tactical')
    const secret = searchParams.get('secret')
    const premium = searchParams.get('premium')

    const where: any = {}

    if (map) {
      // Получаем ID карты по имени
      const mapEntity = await prisma.map.findUnique({
        where: { name: map },
        select: { id: true },
      })
      where.mapId = mapEntity?.id || null
    }

    if (grenadeType && grenadeType !== 'ALL') {
      where.grenadeType = grenadeType
    }

    if (side && side !== 'ALL') {
      where.side = side
    }

    if (difficulty && difficulty !== 'ALL') {
      where.difficulty = difficulty
    }

    // Фильтрация для тактических и секретных лайнапов
    if (tactical === 'true' && premium === 'true') {
      where.isPremium = true
    }

    if (secret === 'true' && premium === 'true') {
      where.isPremium = true
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ]
    }

    // Фильтрация пользовательских лайнапов
    if (userGenerated === 'true') {
      where.isUserGenerated = true
    }

    // Показываем только одобренные лайнапы или лайнапы от админов/модераторов
    const currentUser = await getCurrentUser()
    const isAdmin = currentUser && (currentUser.role === 'admin' || currentUser.role === 'moderator')
    
    if (!isAdmin) {
      // Обычные пользователи видят только одобренные пользовательские ИЛИ обычные (не пользовательские) лайнапы
      where.AND = [
        {
          OR: [
            { moderationStatus: 'APPROVED' },
            { isUserGenerated: false }
          ]
        }
      ]
    }

    const [lineups, total] = await Promise.all([
      prisma.lineup.findMany({
        where,
        include: {
          map: true,
          user: {
            select: { username: true, avatar: true },
          },
          tags: {
            include: {
              tag: true,
            },
          },
          _count: {
            select: { favorites: true, comments: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.lineup.count({ where }),
    ])

    // Десериализуем throwPosition и steps
    const deserializedLineups = lineups.map(lineup => ({
      ...lineup,
      throwPosition: lineup.throwPosition ? JSON.parse(lineup.throwPosition) : null,
      steps: lineup.steps ? JSON.parse(lineup.steps) : null,
    }))

    return NextResponse.json({
      success: true,
      data: {
        lineups: deserializedLineups,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    })
  } catch (error) {
    console.error('Get lineups error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('Creating lineup for user:', user.username, 'role:', user.role)

    const body = await request.json()
    const validation = createLineupSchema.safeParse(body)

    if (!validation.success) {
      console.error('Validation error:', validation.error.errors)
      return NextResponse.json(
        { success: false, error: validation.error.errors[0].message },
        { status: 400 }
      )
    }

    const { title, description, mapId, positionId, grenadeType, side, youtubeId, videoPath, difficulty, throwPosition, steps: lineupData, tagNames, isUserGenerated: isUserGeneratedInput } = validation.data

    console.log('isUserGeneratedInput:', isUserGeneratedInput)

    // Обычные пользователи создают пользовательские лайнапы
    // Админы могут создавать лайнапы для карт (isUserGenerated = false)
    // Если передано isUserGenerated, используем его (для админов)
    const isUserGenerated = isUserGeneratedInput ?? (user.role !== 'admin' && user.role !== 'moderator')

    console.log('Final isUserGenerated:', isUserGenerated)

    const lineup = await prisma.lineup.create({
      data: {
        title,
        description,
        mapId,
        positionId,
        grenadeType,
        side,
        youtubeId,
        videoPath,
        difficulty,
        throwPosition: throwPosition ? JSON.stringify(throwPosition) : null,
        steps: lineupData ? JSON.stringify(lineupData) : null,
        userId: user.id,
        isUserGenerated,
        moderationStatus: isUserGenerated ? 'PENDING' : 'APPROVED', // Пользовательские лайнапы требуют модерации
        tags: tagNames?.length ? {
          create: tagNames.map(name => ({
            tag: {
              connectOrCreate: {
                where: { name },
                create: { name },
              },
            },
          })),
        } : undefined,
      },
      include: {
        map: true,
        user: {
          select: { username: true, avatar: true },
        },
        tags: {
          include: {
            tag: true,
          },
        },
      },
    })

    return NextResponse.json(
      { success: true, data: lineup },
      { status: 201 }
    )
  } catch (error) {
    console.error('Create lineup error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
