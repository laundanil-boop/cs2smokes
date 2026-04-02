'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { TrendingUp, Loader2, Copy, Check, Mic } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useToast } from '@/components/ui/Toast'

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
  const [currentUser, setCurrentUser] = useState<{ username: string; role: string } | null>(null)
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

      setCurrentUser({ username: result.data.username, role: userRole })
      setAuthorized(true)
      fetchData(result.data.username, userRole)
    } catch (error) {
      console.error('Auth check error:', error)
      router.push('/')
    }
  }

  async function fetchData(username: string, role: string) {
    try {
      const response = await fetch('/api/admin/referrals')
      const result = await response.json()

      if (result.success) {
        // Media видят только свой промокод, админы видят все
        if (role === 'media') {
          const userPromoCodes = result.data.bloggerPromoCodes.filter(
            (pc: BloggerPromoCode) => pc.bloggerUsername === username
          )
          setBloggerPromoCodes(userPromoCodes)
        } else {
          setBloggerPromoCodes(result.data.bloggerPromoCodes)
        }
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
          <div className="h-10 w-10 rounded-lg bg-pink-500/20 flex items-center justify-center">
            <Mic className="h-6 w-6 text-pink-400" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight">Media Партнерка</h1>
        </div>
        <p className="text-muted-foreground">
          Ваш персональный промокод для блогеров
        </p>
      </div>

      {/* Промокоды блогеров */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Ваш промокод
          </CardTitle>
          <CardDescription>
            Персональный промокод для @{currentUser?.username}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {bloggerPromoCodes.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              У вас ещё нет персонального промокода
            </p>
          ) : (
            <div className="space-y-3">
              {bloggerPromoCodes.map((pc) => (
                <div
                  key={pc.id}
                  className="p-4 rounded-lg bg-cs2-light/50"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-mono font-bold text-lg">{pc.code}</p>
                        <span className="text-xs px-2 py-0.5 rounded bg-pink-500/20 text-pink-400">
                          {pc._count?.usages || pc.usedCount} исп.
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        {pc.days} дн. Premium • {pc.maxUses ? `лимит ${pc.maxUses}` : 'безлимит'}
                      </p>
                      <div className="mt-3 flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCopyLink(pc.code)}
                          className="h-8"
                        >
                          {copiedId === pc.code ? (
                            <>
                              <Check className="h-4 w-4 mr-2" />
                              Скопировано
                            </>
                          ) : (
                            <>
                              <Copy className="h-4 w-4 mr-2" />
                              Копировать ссылку
                            </>
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
    </div>
  )
}
