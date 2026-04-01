'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Heart, Loader2 } from 'lucide-react'
import { LineupCard } from '@/components/lineups/LineupCard'
import { Lineup } from '@/types'

export default function FavoritesPage() {
  const router = useRouter()
  const [favorites, setFavorites] = useState<Lineup[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchFavorites() {
      try {
        const response = await fetch('/api/user/favorites')
        const result = await response.json()

        if (!result.success) {
          router.push('/auth/login')
          return
        }

        setFavorites(result.data)
      } catch (error) {
        console.error('Error fetching favorites:', error)
        router.push('/auth/login')
      } finally {
        setLoading(false)
      }
    }

    fetchFavorites()
  }, [router])

  const handleToggleFavorite = async (lineupId: string) => {
    try {
      const response = await fetch('/api/user/favorites', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lineupId }),
      })

      if (response.ok) {
        setFavorites(prev => prev.filter(l => l.id !== lineupId))
      }
    } catch (error) {
      console.error('Error removing favorite:', error)
    }
  }

  if (loading) {
    return (
      <div className="container py-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-cs2-accent" />
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight">Избранное</h1>
        <p className="text-muted-foreground mt-2">
          Ваши сохранённые гранатные лайнапы
        </p>
      </div>

      {favorites.length === 0 ? (
        <div className="text-center py-16">
          <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Нет избранных лайнапов</h3>
          <p className="text-muted-foreground mb-4">
            Добавьте лайнапы в избранное для быстрого доступа
          </p>
          <button
            onClick={() => router.push('/maps')}
            className="btn-primary"
          >
            Смотреть карты
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((lineup) => (
            <LineupCard
              key={lineup.id}
              lineup={{ ...lineup, isFavorite: true }}
              showFavorite
              onToggleFavorite={handleToggleFavorite}
            />
          ))}
        </div>
      )}
    </div>
  )
}
