'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ClipboardList, Lock, Crown, Loader2, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { VideoPlayer } from '@/components/lineups/VideoPlayer'

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
  steps: any[] | null
}

export default function TacticalRoundPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [hasPremium, setHasPremium] = useState(false)
  const [round, setRound] = useState<TacticalRound | null>(null)

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

        // Загружаем тактический раунд
        const response = await fetch(`/api/tactical/${params.id}`)
        const result = await response.json()

        if (result.success) {
          setRound(result.data)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [params.id])

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
          <h1 className="text-3xl font-bold mb-4">Premium контент</h1>
          <p className="text-muted-foreground mb-6">
            Этот контент доступен только для пользователей с Premium подпиской
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

  if (!round) {
    return (
      <div className="container py-8 text-center">
        <h1 className="text-2xl font-bold">Тактический раунд не найден</h1>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="mb-6">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          Назад
        </Button>
      </div>

      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">{round.title}</h1>

        <div className="flex items-center gap-4 mb-6 text-sm text-muted-foreground">
          <span>{round.map.displayName}</span>
          <span>•</span>
          <span>{round.side === 'T' ? 'Terrorist' : round.side === 'CT' ? 'Counter-Terrorist' : 'Обе стороны'}</span>
        </div>

        {/* Video Player */}
        <div className="rounded-xl overflow-hidden border border-cs2-light bg-cs2-gray mb-6">
          <VideoPlayer youtubeId={round.youtubeId} videoPath={round.videoPath} title={round.title} />
        </div>

        {round.description && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-2">Описание</h3>
              <p className="text-muted-foreground">{round.description}</p>
            </CardContent>
          </Card>
        )}

        {round.steps && round.steps.length > 0 && (
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Play className="h-5 w-5 text-cs2-accent" />
                Этапы тактики
              </h3>
              <div className="space-y-4">
                {round.steps.map((step: any, index: number) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-cs2-accent flex items-center justify-center text-white font-bold text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      {step.title && <p className="font-medium mb-1">{step.title}</p>}
                      <p className="text-muted-foreground">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
