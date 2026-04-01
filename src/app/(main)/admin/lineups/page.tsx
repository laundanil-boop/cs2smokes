'use client'

import { useState, useEffect } from 'react'
import { Trash2, Loader2, Eye, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
  isUserGenerated: boolean
  moderationStatus: string
  user: {
    username: string
  }
  createdAt: Date
  videoPath: string | null
  youtubeId: string | null
}

export default function AdminLineupsPage() {
  const toast = useToast()
  const [loading, setLoading] = useState(true)
  const [lineups, setLineups] = useState<Lineup[]>([])
  const [selectedLineup, setSelectedLineup] = useState<Lineup | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [filter, setFilter] = useState<'all' | 'user' | 'official'>('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchLineups()
  }, [filter])

  async function fetchLineups() {
    try {
      const params = new URLSearchParams()
      if (filter === 'user') params.set('userGenerated', 'true')
      if (filter === 'official') params.set('official', 'true')

      const response = await fetch(`/api/admin/lineups?${params}`)
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

  const handleDelete = async () => {
    if (!selectedLineup) return

    setSubmitting(true)
    try {
      const response = await fetch('/api/admin/moderation', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedLineup.id,
          action: 'delete',
        }),
      })

      const result = await response.json()

      if (result.success) {
        toast.success('Лайнап удален')
        setDeleteOpen(false)
        setSelectedLineup(null)
        fetchLineups()
      } else {
        toast.error(result.error || 'Ошибка')
      }
    } catch (error) {
      console.error('Error deleting lineup:', error)
      toast.error('Ошибка при удалении')
    } finally {
      setSubmitting(false)
    }
  }

  const filteredLineups = lineups.filter(lineup => {
    if (!search) return true
    return lineup.title.toLowerCase().includes(search.toLowerCase()) ||
           lineup.map.displayName.toLowerCase().includes(search.toLowerCase())
  })

  return (
    <div className="container py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-cs2-accent/20 flex items-center justify-center">
              <Eye className="h-6 w-6 text-cs2-accent" />
            </div>
            <div>
              <h1 className="text-4xl font-bold tracking-tight">Управление лайнапами</h1>
              <p className="text-muted-foreground">
                Все лайнапы на сайте ({lineups.length})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={filter === 'all' ? 'cs2' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              Все
            </Button>
            <Button
              variant={filter === 'user' ? 'cs2' : 'outline'}
              size="sm"
              onClick={() => setFilter('user')}
            >
              Пользовательские
            </Button>
            <Button
              variant={filter === 'official' ? 'cs2' : 'outline'}
              size="sm"
              onClick={() => setFilter('official')}
            >
              Официальные
            </Button>
          </div>
        </div>

        <div className="mt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Поиск по названию или карте..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-cs2-accent" />
        </div>
      ) : filteredLineups.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-16">
              <p className="text-muted-foreground">Лайнапы не найдены</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredLineups.map((lineup) => (
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
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-lg">{lineup.title}</h3>
                          {lineup.isUserGenerated && (
                            <span className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-400">
                              Пользовательский
                            </span>
                          )}
                          {lineup.moderationStatus === 'PENDING' && (
                            <span className="text-xs px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-400">
                              На проверке
                            </span>
                          )}
                          {lineup.moderationStatus === 'APPROVED' && (
                            <span className="text-xs px-2 py-0.5 rounded bg-green-500/20 text-green-400">
                              Одобрен
                            </span>
                          )}
                          {lineup.moderationStatus === 'REJECTED' && (
                            <span className="text-xs px-2 py-0.5 rounded bg-red-500/20 text-red-400">
                              Отклонен
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                          <span>{lineup.map.displayName}</span>
                          <span>•</span>
                          <span>{lineup.grenadeType}</span>
                          <span>•</span>
                          <span>{lineup.side}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">
                          Автор: <span className="text-foreground">{lineup.user.username}</span>
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedLineup(lineup)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            setSelectedLineup(lineup)
                            setDeleteOpen(true)
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
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
      <Dialog open={!!selectedLineup && !deleteOpen} onOpenChange={(open) => !open && setSelectedLineup(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Предпросмотр лайнапа</DialogTitle>
          </DialogHeader>

          {selectedLineup && (
            <div className="space-y-4">
              {selectedLineup.youtubeId ? (
                <iframe
                  src={`https://www.youtube.com/embed/${selectedLineup.youtubeId}`}
                  className="w-full aspect-video rounded-lg"
                  title="Video preview"
                  allowFullScreen
                />
              ) : selectedLineup.videoPath ? (
                <video
                  src={selectedLineup.videoPath}
                  controls
                  className="w-full aspect-video rounded-lg"
                />
              ) : (
                <div className="w-full aspect-video rounded-lg bg-cs2-darker flex items-center justify-center">
                  <p className="text-muted-foreground">Видео отсутствует</p>
                </div>
              )}

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
                  Автор: {selectedLineup.user.username}
                </p>
                {selectedLineup.description && (
                  <p className="text-sm text-muted-foreground">
                    {selectedLineup.description}
                  </p>
                )}
              </div>

              <Button onClick={() => setSelectedLineup(null)}>
                Закрыть
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Диалог удаления */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-red-500" />
              Удалить лайнап
            </DialogTitle>
            <DialogDescription>
              Вы уверены, что хотите удалить этот лайнап? Это действие нельзя отменить.
            </DialogDescription>
          </DialogHeader>

          {selectedLineup && (
            <div className="p-3 rounded-lg bg-cs2-light/50">
              <p className="font-medium">{selectedLineup.title}</p>
              <p className="text-sm text-muted-foreground">
                {selectedLineup.map.displayName} • {selectedLineup.user.username}
              </p>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteOpen(false)
                setSelectedLineup(null)
              }}
              className="flex-1"
              disabled={submitting}
            >
              Отмена
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={submitting}
              className="flex-1"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Удаление...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Удалить
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
