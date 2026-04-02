'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { LogOut, User, Mail, Calendar, Upload, Heart, Crown, Tag, Mic, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LineupCard } from '@/components/lineups/LineupCard'
import { Lineup } from '@/types'
import { Loader2 } from 'lucide-react'
import PremiumTab from './PremiumTab'
import SettingsTab from './SettingsTab'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/Toast'
import { useUser } from '@/contexts/UserContext'

function ProfileContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { refreshUser } = useUser()
  const toast = useToast()
  const [user, setUser] = useState<any>(null)
  const [myLineups, setMyLineups] = useState<Lineup[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'lineups' | 'favorites' | 'premium' | 'settings'>('lineups')
  const [promoCode, setPromoCode] = useState('')
  const [activating, setActivating] = useState(false)

  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab === 'premium') {
      setActiveTab('premium')
    } else if (tab === 'favorites') {
      setActiveTab('favorites')
    } else if (tab === 'settings') {
      setActiveTab('settings')
    }
  }, [searchParams])

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch user info
        const userResponse = await fetch('/api/auth/me')
        const userResult = await userResponse.json()

        if (!userResult.success) {
          router.push('/auth/login')
          return
        }

        setUser(userResult.data)

        // Fetch user's lineups
        const lineupsResponse = await fetch('/api/lineups')
        const lineupsResult = await lineupsResponse.json()

        if (lineupsResult.success) {
          const userLineups = lineupsResult.data.lineups.filter(
            (l: any) => l.userId === userResult.data.id
          )
          setMyLineups(userLineups)
        }
      } catch (error) {
        console.error('Error fetching profile:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [router])

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      // Очищаем контекст пользователя
      await refreshUser()
      // Отправляем событие для Header
      window.dispatchEvent(new CustomEvent('auth-change'))
      router.push('/')
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  const handleActivatePromoCode = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!promoCode.trim()) return

    setActivating(true)
    try {
      const response = await fetch('/api/promo/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promoCode.trim() }),
      })

      const result = await response.json()

      if (result.success) {
        toast.success(result.message)
        setPromoCode('')
        // Обновляем данные пользователя
        const userResponse = await fetch('/api/auth/me')
        const userResult = await userResponse.json()
        if (userResult.success) {
          setUser(userResult.data)
        }
      } else {
        toast.error(result.error || 'Ошибка активации')
      }
    } catch (error) {
      console.error('Error activating promo code:', error)
      toast.error('Ошибка при активации')
    } finally {
      setActivating(false)
    }
  }

  if (loading) {
    return (
      <div className="container py-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-cs2-accent" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight">Профиль</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="p-6 rounded-lg bg-cs2-gray border border-cs2-light">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-16 w-16 rounded-full bg-cs2-accent flex items-center justify-center">
                <span className="text-white font-bold text-2xl">
                  {user?.username?.[0]?.toUpperCase() || '?'}
                </span>
              </div>
              <div>
                <h2 className="font-semibold text-lg">{user?.username || 'User'}</h2>
                <p className="text-sm text-muted-foreground">{user?.email || ''}</p>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>Лайнапов: {user._count?.lineups ?? 0}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Heart className="h-4 w-4 text-muted-foreground" />
                <span>Избранных: {user._count?.favorites ?? 0}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>
                  {new Date(user.createdAt).toLocaleDateString('ru-RU', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Выйти
            </Button>
          </div>

          {/* Активация промокодов */}
          <div className="mt-6">
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  Активировать промокод
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleActivatePromoCode} className="space-y-2">
                  <Input
                    placeholder="Введите код"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                    disabled={activating}
                  />
                  <Button
                    type="submit"
                    size="sm"
                    className="w-full"
                    disabled={activating || !promoCode.trim()}
                  >
                    {activating ? 'Активация...' : 'Активировать'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main content */}
        <div className="lg:col-span-3">
          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            <Button
              variant={activeTab === 'lineups' ? 'cs2' : 'outline'}
              onClick={() => {
                setActiveTab('lineups')
                router.push('/profile', { scroll: false })
              }}
              className="gap-2"
            >
              <Upload className="h-4 w-4" />
              Мои лайнапы
            </Button>
            <Button
              variant={activeTab === 'favorites' ? 'cs2' : 'outline'}
              onClick={() => {
                setActiveTab('favorites')
                router.push('/profile?tab=favorites', { scroll: false })
              }}
              className="gap-2"
            >
              <Heart className="h-4 w-4" />
              Избранное
            </Button>
            <Button
              variant={activeTab === 'premium' ? 'cs2' : 'outline'}
              onClick={() => {
                setActiveTab('premium')
                router.push('/profile?tab=premium', { scroll: false })
              }}
              className="gap-2"
            >
              <Crown className="h-4 w-4" />
              Premium
            </Button>
            <Button
              variant={activeTab === 'settings' ? 'cs2' : 'outline'}
              onClick={() => {
                setActiveTab('settings')
                router.push('/profile?tab=settings', { scroll: false })
              }}
              className="gap-2"
            >
              <Settings className="h-4 w-4" />
              Настройки
            </Button>
          </div>

          {/* Content */}
          {activeTab === 'lineups' && (
            <div>
              {myLineups.length === 0 ? (
                <div className="text-center py-16">
                  <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Нет лайнапов</h3>
                  <p className="text-muted-foreground mb-4">
                    Загрузите свой первый гранатный лайнап
                  </p>
                  <Button variant="cs2" onClick={() => router.push('/upload')}>
                    Загрузить лайнап
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {myLineups.map((lineup) => (
                    <LineupCard key={lineup.id} lineup={lineup} />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'favorites' && (
            <FavoritesTab />
          )}

          {activeTab === 'premium' && (
            <PremiumTab />
          )}

          {activeTab === 'settings' && (
            <SettingsTab />
          )}
        </div>
      </div>
    </div>
  )
}

function FavoritesTab() {
  const [favorites, setFavorites] = useState<Lineup[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchFavorites() {
      try {
        const response = await fetch('/api/user/favorites')
        const result = await response.json()

        if (result.success) {
          setFavorites(result.data)
        }
      } catch (error) {
        console.error('Error fetching favorites:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchFavorites()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-cs2-accent" />
      </div>
    )
  }

  if (favorites.length === 0) {
    return (
      <div className="text-center py-16">
        <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Нет избранных</h3>
        <p className="text-muted-foreground">
          Добавьте лайнапы в избранное для быстрого доступа
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {favorites.map((lineup) => (
        <LineupCard key={lineup.id} lineup={{ ...lineup, isFavorite: true }} />
      ))}
    </div>
  )
}

export default function ProfilePage() {
  return (
    <Suspense fallback={
      <div className="container py-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-cs2-accent" />
      </div>
    }>
      <ProfileContent />
    </Suspense>
  )
}
