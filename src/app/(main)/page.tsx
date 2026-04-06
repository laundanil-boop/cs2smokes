import Link from 'next/link'
import { ArrowRight, MapPin, Users, Bomb } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MapCard } from '@/components/maps/MapCard'
import { LineupCard } from '@/components/lineups/LineupCard'
import { prisma } from '@/lib/prisma'
import type { Map as GameMap, Lineup } from '@/types'

async function getMaps(): Promise<GameMap[]> {
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

async function getFeaturedLineups(): Promise<Lineup[]> {
  try {
    const lineups = await prisma.lineup.findMany({
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
      orderBy: { views: 'desc' },
      take: 6,
    })
    return lineups
  } catch (error) {
    console.error('Error fetching lineups:', error)
    return []
  }
}

async function getUserLineups(): Promise<Lineup[]> {
  try {
    const lineups = await prisma.lineup.findMany({
      where: {
        isUserGenerated: true,
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
        _count: {
          select: { favorites: true, comments: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 6,
    })
    return lineups
  } catch (error) {
    console.error('Error fetching user lineups:', error)
    return []
  }
}

async function getStats() {
  try {
    const [lineupsCount, mapsCount, usersCount] = await Promise.all([
      prisma.lineup.count(),
      prisma.map.count(),
      prisma.user.count(),
    ])
    console.log(`Stats: ${lineupsCount} lineups, ${mapsCount} maps, ${usersCount} users`)
    return { lineupsCount, mapsCount, usersCount }
  } catch (error) {
    console.error('Error fetching stats:', error)
    return { lineupsCount: 0, mapsCount: 0, usersCount: 0 }
  }
}

export default async function HomePage() {
  const maps = await getMaps()
  const featuredLineups = await getFeaturedLineups()
  const userLineups = await getUserLineups()
  const { lineupsCount, mapsCount, usersCount } = await getStats()

  return (
    <div className="space-y-12 sm:space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-cs2-gray to-cs2-darker py-16 sm:py-24 lg:py-32">
        <div className="absolute inset-0 bg-[url('/images/grid-pattern.svg')] opacity-[0.05]" />
        <div className="container relative px-4 sm:px-6">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-3xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              <span className="text-gradient">Гранатные лайнапы</span>{' '}
              <span className="text-white">для CS2</span>
            </h1>
            <p className="mt-4 text-base leading-7 sm:text-lg sm:leading-8 text-muted-foreground px-2">
              Изучите лучшую коллекцию смоков, молотов, флешек и хешек для всех
              соревновательных карт. Улучшите свою игру с подробными видео-туториалами.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-x-4 gap-y-3">
              <Link href="/maps" className="w-full sm:w-auto">
                <Button variant="cs2" size="lg" className="gap-2 w-full sm:w-auto">
                  Смотреть карты
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/upload" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Загрузить лайнап
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container px-4 sm:px-6">
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          <div className="rounded-lg bg-cs2-gray p-4 sm:p-6 text-center border border-cs2-light">
            <Bomb className="mx-auto h-6 w-6 sm:h-8 sm:w-8 text-cs2-accent" />
            <p className="mt-3 text-2xl sm:text-3xl font-bold text-white">{lineupsCount}</p>
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground">Лайнапов</p>
          </div>
          <div className="rounded-lg bg-cs2-gray p-4 sm:p-6 text-center border border-cs2-light">
            <MapPin className="mx-auto h-6 w-6 sm:h-8 sm:w-8 text-cs2-accent" />
            <p className="mt-3 text-2xl sm:text-3xl font-bold text-white">{mapsCount}</p>
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground">Карт</p>
          </div>
          <div className="rounded-lg bg-cs2-gray p-4 sm:p-6 text-center border border-cs2-light">
            <Users className="mx-auto h-6 w-6 sm:h-8 sm:w-8 text-cs2-accent" />
            <p className="mt-3 text-2xl sm:text-3xl font-bold text-white">{usersCount}</p>
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground">Пользователей</p>
          </div>
        </div>
      </section>

      {/* Maps Section */}
      <section className="container px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Карты</h2>
            <p className="text-sm sm:text-base text-muted-foreground mt-1 sm:mt-2">
              Выберите карту для просмотра лайнапов
            </p>
          </div>
          <Link href="/maps">
            <Button variant="ghost" size="sm" className="gap-2">
              Все карты
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {maps.map((map) => (
            <MapCard key={map.id} map={map} />
          ))}
        </div>
      </section>

      {/* Featured Lineups Section */}
      <section className="container px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Популярные лайнапы</h2>
            <p className="text-sm sm:text-base text-muted-foreground mt-1 sm:mt-2">
              Самые просматриваемые на этой неделе
            </p>
          </div>
          <Link href="/search">
            <Button variant="ghost" size="sm" className="gap-2">
              Все лайнапы
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {featuredLineups.map((lineup) => (
            <LineupCard key={lineup.id} lineup={lineup} />
          ))}
        </div>
      </section>

      {/* User Lineups Section */}
      <section className="container px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Пользовательские лайнапы</h2>
            <p className="text-sm sm:text-base text-muted-foreground mt-1 sm:mt-2">
              Лайнапы от сообщества CS2Smokes
            </p>
          </div>
          <Link href="/user-lineups">
            <Button variant="ghost" size="sm" className="gap-2">
              Все
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {userLineups.length > 0 ? (
            userLineups.map((lineup) => (
              <LineupCard key={lineup.id} lineup={lineup} />
            ))
          ) : (
            <div className="col-span-full text-center py-8 sm:py-12 bg-cs2-gray rounded-lg border border-cs2-light">
              <p className="text-sm sm:text-base text-muted-foreground mb-4">
                Пока нет пользовательских лайнапов
              </p>
              <Link href="/upload">
                <Button variant="cs2" size="sm">
                  Загрузить первым
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container px-4 sm:px-6">
        <div className="relative rounded-xl sm:rounded-2xl overflow-hidden bg-gradient-to-r from-cs2-accent/20 to-cs2-accent/10 border border-cs2-accent/30 p-6 sm:p-10 lg:p-12">
          <div className="relative z-10 mx-auto max-w-2xl text-center">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
              Делитесь своими лайнапами
            </h2>
            <p className="mt-3 sm:mt-4 text-base sm:text-lg text-muted-foreground">
              Создайте аккаунт и загружайте свои гранатные лайнапы.
              Помогайте другим игрокам улучшать свою игру.
            </p>
            <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              <Link href="/auth/register" className="w-full sm:w-auto">
                <Button variant="cs2" size="lg" className="w-full sm:w-auto">
                  Создать аккаунт
                </Button>
              </Link>
              <Link href="/upload" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Загрузить сейчас
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
