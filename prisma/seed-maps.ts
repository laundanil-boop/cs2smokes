import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const maps = [
  { name: 'mirage', displayName: 'Mirage', description: 'Самая популярная карта в CS2' },
  { name: 'dust2', displayName: 'Dust II', description: 'Классическая карта' },
  { name: 'inferno', displayName: 'Inferno', description: 'Тактическая карта' },
  { name: 'nuke', displayName: 'Nuke', description: 'Карта с двумя этажами' },
  { name: 'overpass', displayName: 'Overpass', description: 'Современная карта' },
  { name: 'ancient', displayName: 'Ancient', description: 'Древняя тематика' },
  { name: 'anubis', displayName: 'Anubis', description: 'Египетская тематика' },
]

async function main() {
  console.log('Creating maps...')
  
  for (const map of maps) {
    await prisma.map.upsert({
      where: { name: map.name },
      update: {},
      create: map,
    })
  }
  
  console.log('Maps created successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
