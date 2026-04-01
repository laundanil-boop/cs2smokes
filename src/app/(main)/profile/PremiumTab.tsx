'use client'

import { useState, useEffect } from 'react'
import { Crown, Shield, Target, Zap, Check, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { usePremium } from '@/hooks/usePremium'

export default function PremiumTab() {
  const { premium, loading, hasPremium } = usePremium()
  const [expiresDate, setExpiresDate] = useState<string | null>(null)

  useEffect(() => {
    if (premium?.expiresAt) {
      setExpiresDate(new Date(premium.expiresAt).toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }))
    }
  }, [premium])

  const features = [
    {
      icon: Shield,
      title: 'Без рекламы',
      description: 'Полное отключение всей рекламы на сайте',
    },
    {
      icon: Target,
      title: 'Тактические раунды',
      description: 'Доступ к эксклюзивным тактическим раскладкам',
    },
    {
      icon: Zap,
      title: 'Секретные гранаты',
      description: 'Уникальные лайнапы, недоступные бесплатно',
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-cs2-accent" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Premium Header */}
      <div className="text-center">
        <div className={`inline-flex items-center justify-center h-16 w-16 rounded-full mb-4 ${
          hasPremium
            ? 'bg-gradient-to-br from-green-400 to-green-600'
            : 'bg-gradient-to-br from-yellow-400 to-yellow-600'
        }`}>
          <Crown className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold mb-2">
          {hasPremium ? 'Premium активна' : 'Premium Подписка'}
        </h2>
        <p className="text-muted-foreground">
          {hasPremium
            ? 'У вас активная Premium подписка'
            : 'Получите доступ ко всем эксклюзивным функциям'
          }
        </p>
      </div>

      {/* Status Card or Price Card */}
      {hasPremium ? (
        <div className="flex justify-center">
          <Card className="w-full max-w-md border-green-500/50 bg-gradient-to-b from-green-500/10 to-transparent">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center gap-2 text-green-500 mb-2">
                <Check className="h-6 w-6" />
                <CardTitle className="text-2xl">Подписка активна</CardTitle>
              </div>
              <CardDescription>
                {premium?.isLifetime
                  ? 'Бессрочная подписка'
                  : expiresDate
                    ? `Действует до ${expiresDate}`
                    : 'Подписка активна'
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="grid grid-cols-3 gap-4 pt-4">
                {features.map((feature, index) => (
                  <div key={index} className="text-center">
                    <div className="inline-flex h-10 w-10 rounded-lg bg-green-500/20 items-center justify-center mb-2">
                      <feature.icon className="h-5 w-5 text-green-500" />
                    </div>
                    <p className="text-xs font-medium">{feature.title}</p>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="justify-center">
              <p className="text-sm text-green-500">
                Все функции Premium доступны
              </p>
            </CardFooter>
          </Card>
        </div>
      ) : (
        <div className="flex justify-center">
          <Card className="w-full max-w-md border-yellow-500/50 bg-gradient-to-b from-yellow-500/10 to-transparent">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Премиум</CardTitle>
              <CardDescription>Все функции в одной подписке</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="mb-6">
                <span className="text-5xl font-bold text-yellow-500">69</span>
                <span className="text-xl text-muted-foreground ml-2">₽/месяц</span>
              </div>
              <Button className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold h-12 text-lg">
                Оформить подписку
              </Button>
            </CardContent>
            <CardFooter className="justify-center">
              <p className="text-sm text-muted-foreground">
                Отмена в любое время
              </p>
            </CardFooter>
          </Card>
        </div>
      )}

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <Card key={index} className="relative overflow-hidden">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-cs2-accent/10 flex items-center justify-center mb-2">
                <feature.icon className="h-6 w-6 text-cs2-accent" />
              </div>
              <CardTitle className="text-lg">{feature.title}</CardTitle>
              <CardDescription>{feature.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-green-500">
                <Check className="h-4 w-4" />
                <span>{hasPremium ? 'Доступно' : 'Включено в подписку'}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
