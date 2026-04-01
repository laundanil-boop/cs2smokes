import { prisma } from '@/lib/prisma'
import { MapCard } from '@/components/maps/MapCard'

export const metadata = {
  title: 'Карты - CS2Smokes',
  description: 'Выберите карту для просмотра всех доступных гранатных лайнапов',
}

async function getMaps() {
  try {
    const maps = await prisma.map.findMany({
      include: {
        _count: {
          select: { lineups: true },
        },
      },
      orderBy: { displayName: 'asc' },
    })
    return maps
  } catch (error) {
    console.error('Error fetching maps:', error)
    return []
  }
}

export default async function MapsPage() {
  const maps = await getMaps()

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight">Карты</h1>
        <p className="text-muted-foreground mt-2">
          Выберите карту для просмотра всех доступных гранатных лайнапов
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {maps.map((map) => (
          <MapCard key={map.id} map={map} />
        ))}
      </div>
    </div>
  )
}
