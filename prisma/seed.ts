import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

type GrenadeType = 'SMOKE' | 'MOLOTOV' | 'FLASH' | 'HE'
type Side = 'CT' | 'T' | 'BOTH'
type Difficulty = 'EASY' | 'MEDIUM' | 'HARD'

async function main() {
  // Create maps
  const maps = [
    { name: 'mirage', displayName: 'Mirage', imageUrl: '/images/maps/mirage.jpg' },
    { name: 'dust2', displayName: 'Dust II', imageUrl: '/images/maps/dust2.jpg' },
    { name: 'inferno', displayName: 'Inferno', imageUrl: '/images/maps/inferno.jpg' },
    { name: 'nuke', displayName: 'Nuke', imageUrl: '/images/maps/nuke.jpg' },
    { name: 'overpass', displayName: 'Overpass', imageUrl: '/images/maps/overpass.jpg' },
    { name: 'ancient', displayName: 'Ancient', imageUrl: '/images/maps/ancient.jpg' },
    { name: 'anubis', displayName: 'Anubis', imageUrl: '/images/maps/anubis.jpg' },
  ]

  for (const map of maps) {
    await prisma.map.upsert({
      where: { name: map.name },
      update: { displayName: map.displayName, imageUrl: map.imageUrl },
      create: {
        name: map.name,
        displayName: map.displayName,
        imageUrl: map.imageUrl,
      },
    })
  }

  // Create tags
  const tags = [
    'one-way',
    'pop-flash',
    'run-throw',
    'jump-throw',
    'lineup',
    'reactive',
    'execute',
    'retake',
    'anti-eco',
    'site-take',
  ]

  const createdTags: Record<string, { id: string }> = {}

  for (const tagName of tags) {
    createdTags[tagName] = await prisma.tag.upsert({
      where: { name: tagName },
      update: {},
      create: { name: tagName },
    })
  }

  // Create demo user
  const hashedPassword = await bcrypt.hash('demo123', 10)
  const user = await prisma.user.upsert({
    where: { email: 'demo@cs2smokes.com' },
    update: {},
    create: {
      email: 'demo@cs2smokes.com',
      username: 'DemoUser',
      password: hashedPassword,
      role: 'user',
    },
  })

  // Create admin user
  const adminHashedPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@cs2smokes.com' },
    update: { role: 'admin', password: adminHashedPassword, username: 'Admin' },
    create: {
      email: 'admin@cs2smokes.com',
      username: 'Admin',
      password: adminHashedPassword,
      role: 'admin',
    },
  })

  // Create root user
  const rootHashedPassword = await bcrypt.hash('root123', 10)
  const root = await prisma.user.upsert({
    where: { email: 'root@cs2smokes.com' },
    update: { role: 'root' },
    create: {
      email: 'root@cs2smokes.com',
      username: 'RootAdmin',
      password: rootHashedPassword,
      role: 'root',
    },
  })

  console.log('Demo user created:', user.email)
  console.log('Admin user created:', admin.email)
  console.log('Root user created:', root.email)

  // Get map IDs
  const mirage = await prisma.map.findUnique({ where: { name: 'mirage' } })
  const dust2 = await prisma.map.findUnique({ where: { name: 'dust2' } })
  const inferno = await prisma.map.findUnique({ where: { name: 'inferno' } })

  // Create sample lineups
  if (mirage && user) {
    await prisma.lineup.create({
      data: {
        title: 'Smoke на A Main',
        description: 'Однопроходная смока на A мейн для блокировки видимости снайпера',
        mapId: mirage.id,
        grenadeType: 'SMOKE' as GrenadeType,
        side: 'T' as Side,
        youtubeId: 'dQw4w9WgXcQ',
        difficulty: 'EASY' as Difficulty,
        userId: user.id,
        throwPosition: JSON.stringify({ x: 150, y: 200, z: 0 }),
        steps: JSON.stringify([
          { x: 100, y: 150, description: 'Станьте здесь' },
          { x: 200, y: 250, description: 'Бросьте гранату в эту точку' },
        ]),
        tags: {
          create: [
            { tag: { connect: { id: createdTags['one-way'].id } } },
            { tag: { connect: { id: createdTags['lineup'].id } } },
          ],
        },
      },
    })

    await prisma.lineup.create({
      data: {
        title: 'Molotov на Connector',
        description: 'Молотов для зачистки коннектора',
        mapId: mirage.id,
        grenadeType: 'MOLOTOV' as GrenadeType,
        side: 'CT' as Side,
        youtubeId: 'dQw4w9WgXcQ',
        difficulty: 'MEDIUM' as Difficulty,
        userId: user.id,
        tags: {
          create: [{ tag: { connect: { id: createdTags['reactive'].id } } }],
        },
      },
    })

    await prisma.lineup.create({
      data: {
        title: 'Flash для выхода A',
        description: 'Флешка для безопасного выхода на A сайт',
        mapId: mirage.id,
        grenadeType: 'FLASH' as GrenadeType,
        side: 'CT' as Side,
        youtubeId: 'dQw4w9WgXcQ',
        difficulty: 'EASY' as Difficulty,
        userId: user.id,
        tags: {
          create: [{ tag: { connect: { id: createdTags['pop-flash'].id } } }],
        },
      },
    })
  }

  if (dust2 && user) {
    await prisma.lineup.create({
      data: {
        title: 'Smoke на Long Doors',
        description: 'Смока на длинные двери для прохода лонга',
        mapId: dust2.id,
        grenadeType: 'SMOKE' as GrenadeType,
        side: 'T' as Side,
        youtubeId: 'dQw4w9WgXcQ',
        difficulty: 'MEDIUM' as Difficulty,
        userId: user.id,
        tags: {
          create: [
            { tag: { connect: { id: createdTags['execute'].id } } },
            { tag: { connect: { id: createdTags['site-take'].id } } },
          ],
        },
      },
    })

    await prisma.lineup.create({
      data: {
        title: 'HE на B Tunnels',
        description: 'Хешка для урона в туннелях',
        mapId: dust2.id,
        grenadeType: 'HE' as GrenadeType,
        side: 'CT' as Side,
        youtubeId: 'dQw4w9WgXcQ',
        difficulty: 'EASY' as Difficulty,
        userId: user.id,
      },
    })
  }

  if (inferno && user) {
    await prisma.lineup.create({
      data: {
        title: 'Smoke на Banana',
        description: 'Смока на банан для контроля карты',
        mapId: inferno.id,
        grenadeType: 'SMOKE' as GrenadeType,
        side: 'CT' as Side,
        youtubeId: 'dQw4w9WgXcQ',
        difficulty: 'HARD' as Difficulty,
        userId: user.id,
        tags: {
          create: [{ tag: { connect: { id: createdTags['lineup'].id } } }],
        },
      },
    })

    await prisma.lineup.create({
      data: {
        title: 'Molotov на Apartments',
        description: 'Молотов для зачистки апартаментов',
        mapId: inferno.id,
        grenadeType: 'MOLOTOV' as GrenadeType,
        side: 'T' as Side,
        youtubeId: 'dQw4w9WgXcQ',
        difficulty: 'MEDIUM' as Difficulty,
        userId: user.id,
      },
    })
  }

  console.log('Seed data created successfully!')

  // Create sample positions for Mirage
  if (mirage) {
    const windowPos = await prisma.lineupPosition.create({
      data: {
        name: 'Окно (Window)',
        mapId: mirage.id,
        imageUrl: '/images/maps/mirage.jpg',
        positionX: 65.5,
        positionY: 42.3,
        description: 'Контроль окна на миде',
      },
    })

    const apartmentsPos = await prisma.lineupPosition.create({
      data: {
        name: 'Apartments',
        mapId: mirage.id,
        imageUrl: '/images/maps/mirage.jpg',
        positionX: 35.2,
        positionY: 28.7,
        description: 'Жилые помещения (аппартаменты)',
      },
    })

    const palacePos = await prisma.lineupPosition.create({
      data: {
        name: 'Palace',
        mapId: mirage.id,
        imageUrl: '/images/maps/mirage.jpg',
        positionX: 78.1,
        positionY: 55.4,
        description: 'Дворец на B сайте',
      },
    })

    const connectorPos = await prisma.lineupPosition.create({
      data: {
        name: 'Connector',
        mapId: mirage.id,
        imageUrl: '/images/maps/mirage.jpg',
        positionX: 52.8,
        positionY: 48.9,
        description: 'Соединение между мидом и A сайтом',
      },
    })

    const aSitePos = await prisma.lineupPosition.create({
      data: {
        name: 'A Site',
        mapId: mirage.id,
        imageUrl: '/images/maps/mirage.jpg',
        positionX: 72.4,
        positionY: 35.6,
        description: 'Площадка A',
      },
    })

    const bSitePos = await prisma.lineupPosition.create({
      data: {
        name: 'B Site',
        mapId: mirage.id,
        imageUrl: '/images/maps/mirage.jpg',
        positionX: 82.3,
        positionY: 62.1,
        description: 'Площадка B',
      },
    })
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
