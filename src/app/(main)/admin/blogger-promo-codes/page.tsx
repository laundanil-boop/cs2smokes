'use client'

import { useState, useEffect } from 'react'
import { Mic, Plus, Trash2, Loader2, Calendar, Repeat } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/components/ui/Toast'

interface BloggerPromoCode {
  id: string
  code: string
  bloggerUsername: string
  days: number
  maxUses: number | null
  usedCount: number
  expiresAt: Date | null
  isActive: boolean
  createdAt: Date
  _count?: {
    usages: number
  }
}

export default function AdminBloggerPromoCodesPage() {
  const toast = useToast()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [promoCodes, setPromoCodes] = useState<BloggerPromoCode[]>([])

  const [formData, setFormData] = useState({
    code: '',
    bloggerUsername: '',
    days: '7',
    maxUses: '',
    expiresAt: '',
  })

  useEffect(() => {
    fetchPromoCodes()
  }, [])

  async function fetchPromoCodes() {
    try {
      const response = await fetch('/api/admin/blogger-promo-codes')
      const result = await response.json()

      if (result.success) {
        setPromoCodes(result.data)
      }
    } catch (error) {
      console.error('Error fetching blogger promo codes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const response = await fetch('/api/admin/blogger-promo-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: formData.code || undefined,
          bloggerUsername: formData.bloggerUsername,
          days: parseInt(formData.days, 10),
          maxUses: formData.maxUses ? parseInt(formData.maxUses, 10) : null,
          expiresAt: formData.expiresAt || null,
        }),
      })

      const result = await response.json()

      if (result.success) {
        toast.success('Промокод блогера создан')
        setFormData({ code: '', bloggerUsername: '', days: '7', maxUses: '', expiresAt: '' })
        fetchPromoCodes()
      } else {
        toast.error(result.error || 'Ошибка')
      }
    } catch (error) {
      console.error('Error creating blogger promo code:', error)
      toast.error('Ошибка при создании')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить промокод блогера?')) return

    try {
      const response = await fetch('/api/admin/blogger-promo-codes', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })

      const result = await response.json()

      if (result.success) {
        toast.success('Промокод блогера удален')
        fetchPromoCodes()
      } else {
        toast.error(result.error || 'Ошибка')
      }
    } catch (error) {
      console.error('Error deleting blogger promo code:', error)
      toast.error('Ошибка при удалении')
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
        <div className="flex items-center gap-3 mb-2">
          <div className="h-10 w-10 rounded-lg bg-cs2-accent/20 flex items-center justify-center">
            <Mic className="h-6 w-6 text-cs2-accent" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight">Промокоды блогеров</h1>
        </div>
        <p className="text-muted-foreground">
          Персональные промокоды для блогеров и партнеров
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Форма создания */}
        <Card>
          <CardHeader>
            <CardTitle>Создать промокод блогера</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Username блогера *</label>
                <Input
                  placeholder="example_blogger"
                  value={formData.bloggerUsername}
                  onChange={(e) => setFormData({ ...formData, bloggerUsername: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Код промокода</label>
                <Input
                  placeholder="BLOGGER2024 (оставьте пустым для автогенерации)"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Количество дней *</label>
                <Select
                  value={formData.days}
                  onValueChange={(value) => setFormData({ ...formData, days: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 день</SelectItem>
                    <SelectItem value="3">3 дня</SelectItem>
                    <SelectItem value="7">7 дней</SelectItem>
                    <SelectItem value="14">14 дней</SelectItem>
                    <SelectItem value="30">30 дней</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Максимум использований</label>
                <Input
                  type="number"
                  min="1"
                  placeholder="Оставьте пустым для безлимита"
                  value={formData.maxUses}
                  onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Срок действия</label>
                <Input
                  type="date"
                  value={formData.expiresAt}
                  onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  Оставьте пустым для бессрочного действия
                </p>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Создание...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Создать промокод
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Список промокодов */}
        <Card>
          <CardHeader>
            <CardTitle>Промокоды ({promoCodes.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {promoCodes.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Промокоды блогеров ещё не созданы
              </p>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {promoCodes.map((pc) => (
                  <div
                    key={pc.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-cs2-light/50"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-mono font-bold text-lg truncate">{pc.code}</p>
                        {!pc.isActive && (
                          <span className="text-xs px-2 py-0.5 rounded bg-red-500/20 text-red-500">
                            Не активен
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">@{pc.bloggerUsername}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <Repeat className="h-3 w-3" />
                          {pc.days} дн.
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {pc.maxUses ? `${pc.usedCount}/${pc.maxUses}` : `${pc.usedCount}/∞`}
                        </span>
                        {pc.expiresAt && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(pc.expiresAt).toLocaleDateString('ru-RU')}
                          </span>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(pc.id)}
                      className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
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
