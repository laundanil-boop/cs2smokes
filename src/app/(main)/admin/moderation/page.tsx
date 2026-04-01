'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, Clock, Loader2, Eye, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/Toast'
import Image from 'next/image'

interface Lineup {
  id: string
  title: string
  description: string | null
  map: {
    name: string
    displayName: string
    imageUrl: string | null
  }
  grenadeType: string
  side: string
  user: {
    username: string
    email: string
  }
  createdAt: Date
  videoPath: string | null
  youtubeId: string | null
}

function VideoPreview({ lineup }: { lineup: Lineup }) {
  if (lineup.youtubeId) {
    return (
      <iframe
        src={`https://www.youtube.com/embed/${lineup.youtubeId}`}
        className="w-full aspect-video rounded-lg"
        title="Video preview"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    )
  }

  if (lineup.videoPath) {
    return (
      <video
        src={lineup.videoPath}
        controls
        className="w-full aspect-video rounded-lg"
      />
    )
  }

  return (
    <div className="w-full aspect-video rounded-lg bg-cs2-darker flex items-center justify-center">
      <p className="text-muted-foreground">Видео отсутствует</p>
    </div>
  )
}

export default function AdminModerationPage() {
  const toast = useToast()
  const [loading, setLoading] = useState(true)
  const [lineups, setLineups] = useState<Lineup[]>([])
  const [selectedLineup, setSelectedLineup] = useState<Lineup | null>(null)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [rejectOpen, setRejectOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchLineups()
  }, [])

  async function fetchLineups() {
    try {
      const response = await fetch('/api/admin/moderation?status=PENDING')
      const result = await response.json()

      if (result.success) {
        setLineups(result.data)
      }
    } catch (error) {
      console.error('Error fetching lineups:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id: string) => {
    setSubmitting(true)
    try {
      const response = await fetch('/api/admin/moderation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })

      const result = await response.json()

      if (result.success) {
        toast.success('Лайнап одобрен')
        fetchLineups()
      } else {
        toast.error(result.error || 'Ошибка')
      }
    } catch (error) {
      console.error('Error approving lineup:', error)
      toast.error('Ошибка при одобрении')
    } finally {
      setSubmitting(false)
    }
  }

  const handleReject = async () => {
    if (!selectedLineup || !rejectReason.trim()) return

    setSubmitting(true)
    try {
      const response = await fetch('/api/admin/moderation', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedLineup.id,
          reason: rejectReason,
        }),
      })

      const result = await response.json()

      if (result.success) {
        toast.success('Лайнап отклонен')
        setRejectOpen(false)
        setRejectReason('')
        setSelectedLineup(null)
        fetchLineups()
      } else {
        toast.error(result.error || 'Ошибка')
      }
    } catch (error) {
      console.error('Error rejecting lineup:', error)
      toast.error('Ошибка при отклонении')
    } finally {
      setSubmitting(false)
    }
  }

  const getGrenadeLabel = (type: string) => {
    switch (type) {
      case 'SMOKE': return 'Smoke'
      case 'MOLOTOV': return 'Molotov'
      case 'FLASH': return 'Flash'
      case 'HE': return 'HE'
      default: return type
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
            <Clock className="h-6 w-6 text-cs2-accent" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight">Модерация лайнапов</h1>
        </div>
        <p className="text-muted-foreground">
          Проверка пользовательских лайнапов ({lineups.length} ожидают)
        </p>
      </div>

      {lineups.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-16">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Все лайнапы проверены</h3>
              <p className="text-muted-foreground">
                Нет лайнапов, ожидающих модерации
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {lineups.map((lineup) => (
            <Card key={lineup.id}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  {lineup.map.imageUrl ? (
                    <Image
                      src={lineup.map.imageUrl}
                      alt={lineup.map.displayName}
                      width={80}
                      height={60}
                      className="rounded object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="w-[80px] h-[60px] bg-cs2-gray rounded flex items-center justify-center">
                      <Eye className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}

                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-lg">{lineup.title}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                          <span>{lineup.map.displayName}</span>
                          <span>•</span>
                          <span>{getGrenadeLabel(lineup.grenadeType)}</span>
                          <span>•</span>
                          <span>{lineup.side}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">
                          Автор: <span className="text-foreground">{lineup.user.username}</span>
                        </p>
                        {lineup.description && (
                          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                            {lineup.description}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedLineup(lineup)
                            setPreviewOpen(true)
                          }}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Обзор
                        </Button>
                        <Button
                          size="sm"
                          className="bg-green-500 hover:bg-green-600"
                          onClick={() => handleApprove(lineup.id)}
                          disabled={submitting}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Одобрить
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            setSelectedLineup(lineup)
                            setRejectOpen(true)
                          }}
                          disabled={submitting}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Отказать
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Диалог предпросмотра */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Предпросмотр лайнапа</DialogTitle>
            <DialogDescription>
              Просмотр видео перед модерацией
            </DialogDescription>
          </DialogHeader>

          {selectedLineup && (
            <div className="space-y-4">
              <VideoPreview lineup={selectedLineup} />

              <div className="space-y-2">
                <h4 className="font-semibold">{selectedLineup.title}</h4>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{selectedLineup.map.displayName}</span>
                  <span>•</span>
                  <span>{selectedLineup.grenadeType}</span>
                  <span>•</span>
                  <span>{selectedLineup.side}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Автор: <span className="text-foreground">{selectedLineup.user.username}</span>
                </p>
                {selectedLineup.description && (
                  <p className="text-sm text-muted-foreground">
                    {selectedLineup.description}
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setPreviewOpen(false)}
                  className="flex-1"
                >
                  Закрыть
                </Button>
                <Button
                  className="bg-green-500 hover:bg-green-600 flex-1"
                  onClick={() => {
                    setPreviewOpen(false)
                    handleApprove(selectedLineup.id)
                  }}
                  disabled={submitting}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Одобрить
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    setPreviewOpen(false)
                    setRejectOpen(true)
                  }}
                  disabled={submitting}
                  className="flex-1"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Отказать
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Диалог отклонения */}
      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-500" />
              Отклонить лайнап
            </DialogTitle>
            <DialogDescription>
              Укажите причину отклонения лайнапа
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {selectedLineup && (
              <div className="p-3 rounded-lg bg-cs2-light/50">
                <p className="font-medium">{selectedLineup.title}</p>
                <p className="text-sm text-muted-foreground">
                  Автор: {selectedLineup.user.username}
                </p>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Причина отказа</label>
              <Textarea
                placeholder="Например: Некачественное видео, неверная позиция..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={4}
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setRejectOpen(false)
                  setRejectReason('')
                }}
                className="flex-1"
              >
                Отмена
              </Button>
              <Button
                variant="destructive"
                onClick={handleReject}
                disabled={submitting || !rejectReason.trim()}
                className="flex-1"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Отклонение...
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4 mr-2" />
                    Отклонить
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
