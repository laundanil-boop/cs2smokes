'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Target, Lock, Crown, Loader2, ClipboardList, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Lineup } from '@/types'

interface TacticalRound {
  id: string
  title: string
  description: string | null
  map: {
    name: string
    displayName: string
    imageUrl: string | null
  }
  side: string
  youtubeId: string | null
  videoPath: string | null
  createdAt: Date
}

export default function TacticalPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [hasPremium, setHasPremium] = useState(false)
  const [tacticalRounds, setTacticalRounds] = useState<TacticalRound[]>([])

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

        // Загружаем тактические раунды
        const lineupsResponse = await fetch('/api/tactical?tactical=true&premium=true')
        const lineupsResult = await lineupsResponse.json()

        if (lineupsResult.success) {
          setTacticalRounds(lineupsResult.data.rounds)
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
          <h1 className="text-3xl font-bold mb-4">Тактические раунды</h1>
          <p className="text-muted-foreground mb-6">
            Эксклюзивные тактические раскладки доступны только для пользователей с Premium подпиской
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
            <ClipboardList className="h-6 w-6 text-cs2-accent" />
          </div>
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Тактические раунды</h1>
            <p className="text-muted-foreground">
              Полноценные тактики и стратегии для командной игры
            </p>
          </div>
        </div>
      </div>

      <Card className="mb-6 bg-blue-500/10 border-blue-500/50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Target className="h-5 w-5 text-blue-500 mt-0.5" />
            <div>
              <p className="font-medium text-blue-500">Что такое тактические раунды?</p>
              <p className="text-sm text-muted-foreground mt-1">
                Тактические раунды — это комплексные стратегии для всей команды: расстановки, ротации, 
                комбинированные гранаты, контроль карты и другие продвинутые тактики для победы в важных раундах.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {tacticalRounds.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Нет тактик</CardTitle>
            <CardDescription>
              Тактические раунды пока не добавлены
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tacticalRounds.map((round) => (
            <Card
              key={round.id}
              className="group overflow-hidden bg-cs2-gray border-cs2-light hover:border-cs2-accent transition-colors cursor-pointer"
              onClick={() => router.push(`/tactical/${round.id}`)}
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">{round.title}</CardTitle>
                    <CardDescription className="flex items-center gap-2 flex-wrap">
                      <span>{round.map.displayName}</span>
                      <span>•</span>
                      <span>{round.side === 'T' ? 'T' : round.side === 'CT' ? 'CT' : 'Both'}</span>
                    </CardDescription>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-cs2-accent/20 flex items-center justify-center group-hover:bg-cs2-accent transition-colors">
                    <Play className="h-5 w-5 text-cs2-accent group-hover:text-white" />
                  </div>
                </div>
                {round.description && (
                  <CardDescription className="line-clamp-2 mt-2">
                    {round.description}
                  </CardDescription>
                )}
                <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                  {round.youtubeId && (
                    <span className="flex items-center gap-1">
                      <Play className="h-3 w-3" />
                      YouTube
                    </span>
                  )}
                  {round.videoPath && (
                    <span className="flex items-center gap-1">
                      <Play className="h-3 w-3" />
                      Видеофайл
                    </span>
                  )}
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
