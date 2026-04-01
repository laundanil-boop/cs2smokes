'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Zap, Lock, Crown, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Lineup } from '@/types'
import { LineupCard } from '@/components/lineups/LineupCard'

export default function SecretPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [hasPremium, setHasPremium] = useState(false)
  const [lineups, setLineups] = useState<Lineup[]>([])

  useEffect(() => {
    async function fetchData() {
      try {
        // Проверяем Premium статус
        const premiumResponse = await fetch('/api/user/premium')
        const premiumResult = await premiumResponse.json()

        if (!premiumResult.success || !premiumResult.data.isActive) {
          setHasPremium(false)
          setLoading(false)
          return
        }

        setHasPremium(true)

        // Загружаем секретные гранаты
        const lineupsResponse = await fetch('/api/secret?secret=true&premium=true')
        const lineupsResult = await lineupsResponse.json()

        if (lineupsResult.success) {
          setLineups(lineupsResult.data.lineups)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="container py-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-cs2-accent" />
      </div>
    )
  }

  if (!hasPremium) {
    return (
      <div className="container py-8">
        <div className="max-w-2xl mx-auto text-center py-16">
          <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-yellow-500/20 mb-6">
            <Lock className="h-10 w-10 text-yellow-500" />
          </div>
          <h1 className="text-3xl font-bold mb-4">Секретные гранаты</h1>
          <p className="text-muted-foreground mb-6">
            Уникальные лайнапы гранат доступны только для пользователей с Premium подпиской
          </p>
          <Button
            className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold h-12 px-8"
            onClick={() => router.push('/profile?tab=premium')}
          >
            <Crown className="h-5 w-5 mr-2" />
            Оформить Premium за 69 ₽
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-12 w-12 rounded-lg bg-cs2-accent/20 flex items-center justify-center">
            <Zap className="h-6 w-6 text-cs2-accent" />
          </div>
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Секретные гранаты</h1>
            <p className="text-muted-foreground">
              Уникальные лайнапы гранат, недоступные бесплатно
            </p>
          </div>
        </div>
      </div>

      {lineups.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Нет лайнапов</CardTitle>
            <CardDescription>
              Секретные лайнапы пока не добавлены
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {lineups.map((lineup) => (
            <LineupCard key={lineup.id} lineup={lineup} />
          ))}
        </div>
      )}
    </div>
  )
}
