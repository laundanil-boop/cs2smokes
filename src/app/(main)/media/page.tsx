'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Users, TrendingUp, Loader2, Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useToast } from '@/components/ui/Toast'

interface Referral {
  id: string
  code: string
  userId: string
  usesCount: number
  createdAt: Date
  user: {
    username: string
    email: string
  }
}

interface BloggerPromoCode {
  id: string
  code: string
  bloggerUsername: string
  days: number
  usedCount: number
  maxUses: number | null
  _count?: {
    usages: number
  }
}

export default function MediaPage() {
  const toast = useToast()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState(false)
  const [referrals, setReferrals] = useState<Referral[]>([])
  const [bloggerPromoCodes, setBloggerPromoCodes] = useState<BloggerPromoCode[]>([])
  const [copiedId, setCopiedId] = useState<string | null>(null)

  useEffect(() => {
    checkAuth()
  }, [])

  async function checkAuth() {
    try {
      const response = await fetch('/api/auth/me')
      const result = await response.json()

      if (!result.success || !result.data) {
        router.push('/auth/login')
        return
      }

      const userRole = result.data.role
      if (userRole !== 'media' && userRole !== 'admin' && userRole !== 'root') {
        router.push('/')
        return
      }

      setAuthorized(true)
      fetchData()
    } catch (error) {
      console.error('Auth check error:', error)
      router.push('/')
    }
  }

  async function fetchData() {
    try {
      const response = await fetch('/api/admin/referrals')
      const result = await response.json()

      if (result.success) {
        setReferrals(result.data.referrals)
        setBloggerPromoCodes(result.data.bloggerPromoCodes)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCopyLink = (code: string) => {
    const link = `${window.location.origin}/auth/register?ref=${code}`
    navigator.clipboard.writeText(link)
    setCopiedId(code)
    setTimeout(() => setCopiedId(null), 2000)
    toast.success('Ссылка скопирована')
  }

  // Подсчет общей статистики
  const totalReferralUses = referrals.reduce((sum, r) => sum + (r.usesCount || 0), 0)
  const totalBloggerUses = bloggerPromoCodes.reduce((sum, pc) => sum + (pc._count?.usages || pc.usedCount), 0)

  if (!authorized) {
    return (
      <div className="container py-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-cs2-accent" />
      </div>
    )
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
        <div className="flex items-center gap-3 mb-2">
          <div className="h-10 w-10 rounded-lg bg-cs2-accent/20 flex items-center justify-center">
            <TrendingUp className="h-6 w-6 text-cs2-accent" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight">Партнерская программа</h1>
        </div>
        <p className="text-muted-foreground">
          Статистика рефералов и промокодов блогеров
        </p>
      </div>

      {/* Общая статистика */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Всего рефералов</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalReferralUses}</div>
            <p className="text-xs text-muted-foreground">
              Приглашено пользователей
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Активаций промокодов</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBloggerUses}</div>
            <p className="text-xs text-muted-foreground">
              Через промокоды блогеров
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Партнеров</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bloggerPromoCodes.length}</div>
            <p className="text-xs text-muted-foreground">
              Блогеров с промокодами
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Реферальные коды */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Реферальные коды
            </CardTitle>
            <CardDescription>
              Пользователи и их реферальные ссылки
            </CardDescription>
          </CardHeader>
          <CardContent>
            {referrals.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Реферальные коды ещё не созданы
              </p>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {referrals.map((referral) => (
                  <div
                    key={referral.id}
                    className="p-3 rounded-lg bg-cs2-light/50"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">@{referral.user.username}</p>
                          <span className="text-xs px-2 py-0.5 rounded bg-cs2-accent/20 text-cs2-accent">
                            {referral.usesCount} исп.
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">{referral.user.email}</p>
                        <div className="mt-2 flex items-center gap-2">
                          <code className="text-xs px-2 py-1 rounded bg-cs2-darker">
                            {referral.code}
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopyLink(referral.code)}
                            className="h-6 text-xs"
                          >
                            {copiedId === referral.code ? (
                              <Check className="h-3 w-3" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Промокоды блогеров */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Промокоды блогеров
            </CardTitle>
            <CardDescription>
              Статистика использования промокодов
            </CardDescription>
          </CardHeader>
          <CardContent>
            {bloggerPromoCodes.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Промокоды блогеров ещё не созданы
              </p>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {bloggerPromoCodes.map((pc) => (
                  <div
                    key={pc.id}
                    className="p-3 rounded-lg bg-cs2-light/50"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-mono font-bold">{pc.code}</p>
                          <span className="text-xs px-2 py-0.5 rounded bg-cs2-accent/20 text-cs2-accent">
                            {pc._count?.usages || pc.usedCount} исп.
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">@{pc.bloggerUsername}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {pc.days} дн. • {pc.maxUses ? `лимит ${pc.maxUses}` : 'безлимит'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
