import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkData() {
  console.log('=== Проверка данных ===\n')
  
  // Проверка карт
  const maps = await prisma.map.findMany({
    include: {
      _count: {
        select: { positions: true, lineups: true },
      },
    },
  })
  
  console.log('Карты:')
  maps.forEach(map => {
    console.log(`  ${map.displayName}: ${map._count.positions} позиций, ${map._count.lineups} лайнапов`)
  })
  
  // Проверка позиций для Mirage
  const mirage = await prisma.map.findUnique({
    where: { name: 'mirage' },
    include: {
      positions: {
        include: {
          _count: {
            select: { lineups: true },
          },
        },
      },
    },
  })
  
  console.log('\nПозиции на Mirage:')
  if (mirage && mirage.positions.length > 0) {
    mirage.positions.forEach(pos => {
      console.log(`  ${pos.name}: X=${pos.positionX}, Y=${pos.positionY}, лайнапов=${pos._count.lineups}`)
    })
  } else {
    console.log('  Нет позиций')
  }
  
  await prisma.$disconnect()
}

checkData().catch(console.error)
