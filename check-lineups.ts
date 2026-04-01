import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkData() {
  const lineups = await prisma.lineup.findMany({
    include: {
      position: true,
      map: true,
    },
  })

  console.log(`\nВсего лайнапов: ${lineups.length}\n`)

  lineups.forEach(l => {
    console.log(`- ${l.title} | Позиция: ${l.position?.name || 'нет'} | Карта: ${l.map.name}`)
  })

  await prisma.$disconnect()
}

checkData().catch(console.error)
