import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function linkLineupsToPositions() {
  // Найдём позиции на Mirage
  const mirage = await prisma.map.findUnique({
    where: { name: 'mirage' },
    include: { positions: true },
  })

  if (!mirage) {
    console.log('❌ Mirage не найдена')
    return
  }

  console.log(`\nНайдено позиций на Mirage: ${mirage.positions.length}`)

  // Найдём позицию "A Site"
  const aSitePos = mirage.positions.find(p => p.name === 'A Site')
  const connectorPos = mirage.positions.find(p => p.name === 'Connector')

  if (aSitePos) {
    // Привяжем лайнапы с "A Main" к A Site
    const updated = await prisma.lineup.updateMany({
      where: {
        mapId: mirage.id,
        title: { contains: 'A Main' },
      },
      data: { positionId: aSitePos.id },
    })
    console.log(`✅ Привязано ${updated.count} лайнапов к A Site`)
  }

  if (connectorPos) {
    // Привяжем лайнапы с "Connector" к Connector
    const updated = await prisma.lineup.updateMany({
      where: {
        mapId: mirage.id,
        title: { contains: 'Connector' },
      },
      data: { positionId: connectorPos.id },
    })
    console.log(`✅ Привязано ${updated.count} лайнапов к Connector`)
  }

  console.log('\nГотово!')
  await prisma.$disconnect()
}

linkLineupsToPositions().catch(console.error)
