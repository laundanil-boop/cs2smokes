'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Users, Loader2, Clock, CheckCircle, XCircle } from 'lucide-react'
import { LineupCard } from '@/components/lineups/LineupCard'
import { LineupFilters } from '@/components/lineups/LineupFilters'
import { Lineup, GrenadeTypeFilter, SideFilter, DifficultyFilter } from '@/types'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

function UserLineupsContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const grenadeTypeParam = searchParams.get('grenadeType') || ''

  const [lineups, setLineups] = useState<Lineup[]>([])
  const [loading, setLoading] = useState(true)
  const [favorites, setFavorites] = useState<Set<string>>(new Set())

  // Filter states
  const [grenadeType, setGrenadeType] = useState<GrenadeTypeFilter>(
    grenadeTypeParam as GrenadeTypeFilter || 'ALL'
  )
  const [side, setSide] = useState<SideFilter>('ALL')
  const [difficulty, setDifficulty] = useState<DifficultyFilter>('ALL')
  const [search, setSearch] = useState('')

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const queryParams = new URLSearchParams({
        userGenerated: 'true',
        ...(grenadeType !== 'ALL' && { grenadeType }),
        ...(side !== 'ALL' && { side }),
        ...(difficulty !== 'ALL' && { difficulty }),
        ...(search && { search }),
      })

      const response = await fetch(`/api/lineups?${queryParams}`)
      const result = await response.json()

      if (result.success) {
        setLineups(result.data.lineups)
      }
    } catch (error) {
      console.error('Error fetching user lineups:', error)
    } finally {
      setLoading(false)
    }
  }, [grenadeType, side, difficulty, search])

  const fetchFavorites = useCallback(async () => {
    try {
      const response = await fetch('/api/user/favorites')
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setFavorites(new Set(result.data.map((l: any) => l.id)))
        }
      }
    } catch (error) {
      // Not logged in, that's ok
    }
  }, [])

  useEffect(() => {
    fetchData()
    fetchFavorites()
  }, [fetchData, fetchFavorites])

  const handleToggleFavorite = async (lineupId: string) => {
    try {
      const isFavorite = favorites.has(lineupId)
      const response = await fetch('/api/user/favorites', {
        method: isFavorite ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lineupId }),
      })

      if (response.ok) {
        setFavorites(prev => {
          const next = new Set(prev)
          if (isFavorite) {
            next.delete(lineupId)
          } else {
            next.add(lineupId)
          }
          return next
        })
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
    }
  }

  const handleReset = () => {
    setGrenadeType('ALL')
    setSide('ALL')
    setDifficulty('ALL')
    setSearch('')
    router.push('/user-lineups')
  }

  const updateFilters = () => {
    const params = new URLSearchParams()
    params.set('userGenerated', 'true')
    if (search) params.set('q', search)
    if (grenadeType !== 'ALL') params.set('grenadeType', grenadeType)
    if (side !== 'ALL') params.set('side', side)
    if (difficulty !== 'ALL') params.set('difficulty', difficulty)
    router.push(`/user-lineups?${params.toString()}`)
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Users className="h-8 w-8 text-cs2-accent" />
          <h1 className="text-4xl font-bold tracking-tight">
            Пользовательские лайнапы
          </h1>
        </div>
        <p className="text-muted-foreground">
          Лайнапы от сообщества CS2Smokes. Делитесь своими тактиками и изучайте лайнапы от других игроков.
        </p>
        <p className="text-muted-foreground text-sm mt-2">
          {loading ? 'Загрузка...' : `Всего: ${lineups.length} лайнапов`}
        </p>
      </div>

      <LineupFilters
        grenadeType={grenadeType}
        side={side}
        difficulty={difficulty}
        search={search}
        onGrenadeTypeChange={(value) => {
          setGrenadeType(value)
          setTimeout(updateFilters, 0)
        }}
        onSideChange={(value) => {
          setSide(value)
          setTimeout(updateFilters, 0)
        }}
        onDifficultyChange={(value) => {
          setDifficulty(value)
          setTimeout(updateFilters, 0)
        }}
        onSearchChange={(value) => {
          setSearch(value)
          if (!value) {
            router.push('/user-lineups')
          }
        }}
        onReset={handleReset}
      />

      <div className="mt-8">
        {loading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-cs2-accent" />
          </div>
        ) : lineups.length === 0 ? (
          <div className="text-center py-16">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Пока нет пользовательских лайнапов</h3>
            <p className="text-muted-foreground mb-4">
              Будьте первым! Загрузите свой лайнап и поделитесь им с сообществом.
            </p>
            <a href="/upload" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-cs2-orange text-white hover:bg-cs2-orange/90 h-10 px-4 py-2">
              Загрузить лайнап
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {lineups.map((lineup) => (
              <LineupCard
                key={lineup.id}
                lineup={{ ...lineup, isFavorite: favorites.has(lineup.id) }}
                showFavorite
                onToggleFavorite={handleToggleFavorite}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function UserLineupsPage() {
  return (
    <Suspense fallback={<div className="container py-8 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-cs2-accent" /></div>}>
      <UserLineupsContent />
    </Suspense>
  )
}
