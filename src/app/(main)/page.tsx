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
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-cs2-gray to-cs2-darker py-20 sm:py-32">
        <div className="absolute inset-0 bg-[url('/images/grid-pattern.svg')] opacity-[0.05]" />
        <div className="container relative">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
              <span className="text-gradient">Гранатные лайнапы</span>{' '}
              <span className="text-white">для CS2</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              Изучите лучшую коллекцию смоков, молотов, флешек и хешек для всех
              соревновательных карт. Улучшите свою игру с подробными видео-туториалами.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link href="/maps">
                <Button variant="cs2" size="lg" className="gap-2">
                  Смотреть карты
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/upload">
                <Button variant="outline" size="lg">
                  Загрузить лайнап
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div className="rounded-lg bg-cs2-gray p-6 text-center border border-cs2-light">
            <Bomb className="mx-auto h-8 w-8 text-cs2-accent" />
            <p className="mt-4 text-3xl font-bold text-white">{lineupsCount}</p>
            <p className="mt-2 text-sm text-muted-foreground">Лайнапов</p>
          </div>
          <div className="rounded-lg bg-cs2-gray p-6 text-center border border-cs2-light">
            <MapPin className="mx-auto h-8 w-8 text-cs2-accent" />
            <p className="mt-4 text-3xl font-bold text-white">{mapsCount}</p>
            <p className="mt-2 text-sm text-muted-foreground">Карт</p>
          </div>
          <div className="rounded-lg bg-cs2-gray p-6 text-center border border-cs2-light">
            <Users className="mx-auto h-8 w-8 text-cs2-accent" />
            <p className="mt-4 text-3xl font-bold text-white">{usersCount}</p>
            <p className="mt-2 text-sm text-muted-foreground">Пользователей</p>
          </div>
        </div>
      </section>

      {/* Maps Section */}
      <section className="container">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Карты</h2>
            <p className="text-muted-foreground mt-2">
              Выберите карту для просмотра всех доступных лайнапов
            </p>
          </div>
          <Link href="/maps">
            <Button variant="ghost" className="gap-2">
              Все карты
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {maps.map((map) => (
            <MapCard key={map.id} map={map} />
          ))}
        </div>
      </section>

      {/* Featured Lineups Section */}
      <section className="container">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Популярные лайнапы</h2>
            <p className="text-muted-foreground mt-2">
              Самые просматриваемые гранатные лайнапы этой недели
            </p>
          </div>
          <Link href="/search">
            <Button variant="ghost" className="gap-2">
              Все лайнапы
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredLineups.map((lineup) => (
            <LineupCard key={lineup.id} lineup={lineup} />
          ))}
        </div>
      </section>

      {/* User Lineups Section */}
      <section className="container">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Пользовательские лайнапы</h2>
            <p className="text-muted-foreground mt-2">
              Лайнапы от сообщества CS2Smokes
            </p>
          </div>
          <Link href="/user-lineups">
            <Button variant="ghost" className="gap-2">
              Все пользовательские
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {userLineups.length > 0 ? (
            userLineups.map((lineup) => (
              <LineupCard key={lineup.id} lineup={lineup} />
            ))
          ) : (
            <div className="col-span-full text-center py-12 bg-cs2-gray rounded-lg border border-cs2-light">
              <p className="text-muted-foreground mb-4">
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
      <section className="container">
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-cs2-accent/20 to-cs2-accent/10 border border-cs2-accent/30 p-8 sm:p-12">
          <div className="relative z-10 mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Делитесь своими лайнапами
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Создайте аккаунт и загружайте свои гранатные лайнапы.
              Помогайте другим игрокам улучшать свою игру.
            </p>
            <div className="mt-8 flex items-center justify-center gap-4">
              <Link href="/auth/register">
                <Button variant="cs2" size="lg">
                  Создать аккаунт
                </Button>
              </Link>
              <Link href="/upload">
                <Button variant="outline" size="lg">
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
