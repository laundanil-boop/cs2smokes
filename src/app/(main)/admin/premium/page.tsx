'use client'

import { useState } from 'react'
import { Crown, Check, X, Loader2, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

export default function AdminPremiumPage() {
  const [username, setUsername] = useState('')
  const [days, setDays] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string; data?: any } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/admin/premium', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          days: days ? parseInt(days, 10) : null,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setResult({ success: true, message: data.message, data: data.data })
        setUsername('')
        setDays('')
      } else {
        setResult({ success: false, message: data.error || 'Ошибка' })
      }
    } catch (error) {
      setResult({ success: false, message: 'Произошла ошибка' })
    } finally {
      setLoading(false)
    }
  }

  const handleRevoke = async () => {
    if (!username.trim()) {
      setResult({ success: false, message: 'Введите username пользователя' })
      return
    }

    setLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/admin/premium', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      })

      const data = await response.json()

      if (data.success) {
        setResult({ success: true, message: data.message, data: data.data })
        setUsername('')
        setDays('')
      } else {
        setResult({ success: false, message: data.error || 'Ошибка' })
      }
    } catch (error) {
      setResult({ success: false, message: 'Произошла ошибка' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-10 w-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
            <Crown className="h-6 w-6 text-yellow-500" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight">Управление Premium</h1>
        </div>
        <p className="text-muted-foreground">
          Выдача и отзыв Premium подписки пользователей
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Форма выдачи Premium */}
        <Card>
          <CardHeader>
            <CardTitle>Выдать Premium</CardTitle>
            <CardDescription>
              Выберите пользователя и срок действия подписки
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">Username пользователя</p>
                <Input
                  placeholder="example_user"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">
                  Срок действия (дней)
                </p>
                <Input
                  type="number"
                  min="1"
                  placeholder="30"
                  value={days}
                  onChange={(e) => setDays(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Оставьте пустым для бессрочной подписки
                </p>
              </div>

              <Button
                type="submit"
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Обработка...
                  </>
                ) : (
                  <>
                    <Crown className="h-4 w-4 mr-2" />
                    Выдать Premium
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Форма отзыва Premium */}
        <Card>
          <CardHeader>
            <CardTitle>Отозвать Premium</CardTitle>
            <CardDescription>
              Заберите Premium подписку у пользователя
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">Username пользователя</p>
                <Input
                  placeholder="example_user"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>

              <Button
                variant="destructive"
                className="w-full"
                onClick={handleRevoke}
                disabled={loading || !username.trim()}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Обработка...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Отозвать Premium
                  </>
                )}
              </Button>

              <p className="text-xs text-muted-foreground">
                Подписка будет полностью удалена из базы данных
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Результат операции */}
        {result && (
          <Card className="md:col-span-2">
            <CardContent className="pt-6">
              <div className={`flex items-center gap-3 p-4 rounded-lg ${
                result.success
                  ? 'bg-green-500/10 border border-green-500/50'
                  : 'bg-red-500/10 border border-red-500/50'
              }`}>
                {result.success ? (
                  <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                ) : (
                  <X className="h-5 w-5 text-red-500 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <p className={`text-sm font-medium ${
                    result.success ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {result.message}
                  </p>
                  {result.data && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      <p>Пользователь: <span className="text-foreground">{result.data.username}</span></p>
                      {result.data.expiresAt && (
                        <p>
                          Тип:{' '}
                          <span className="text-foreground">
                            {result.data.isLifetime ? 'Бессрочно' : `До ${new Date(result.data.expiresAt).toLocaleDateString('ru-RU')}`}
                          </span>
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Информация */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Информация о Premium</CardTitle>
            <CardDescription>
              Возможности Premium подписки
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-cs2-light/50">
                <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Без рекламы</p>
                  <p className="text-sm text-muted-foreground">
                    Полное отключение всей рекламы
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-cs2-light/50">
                <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Тактические раунды</p>
                  <p className="text-sm text-muted-foreground">
                    Эксклюзивные раскладки
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-cs2-light/50">
                <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Секретные гранаты</p>
                  <p className="text-sm text-muted-foreground">
                    Уникальные лайнапы
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-cs2-light">
              <p className="text-sm text-muted-foreground">
                Стоимость подписки:{' '}
                <span className="text-yellow-500 font-semibold">69 ₽/месяц</span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
