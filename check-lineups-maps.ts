import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkLineups() {
  const lineups = await prisma.lineup.findMany({
    include: {
      map: true,
    },
    take: 10,
  })

  console.log('\nПроверка лайнапов:\n')
  lineups.forEach(l => {
    console.log(`- ${l.title}`)
    console.log(`  Map: ${l.map?.displayName || 'НЕТ'} | mapId: ${l.mapId}`)
  })

  await prisma.$disconnect()
}

checkLineups().catch(console.error)
