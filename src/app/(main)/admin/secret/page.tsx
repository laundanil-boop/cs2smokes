'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Zap, Plus, Trash2, Loader2, MapPin, Video, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import Image from 'next/image'
import { useToast } from '@/components/ui/Toast'

interface Map {
  id: string
  name: string
  displayName: string
  imageUrl: string | null
}

interface SecretGrenade {
  id: string
  title: string
  description: string | null
  map: Map
  grenadeType: string
  side: string
  youtubeId: string | null
  videoPath: string | null
  createdAt: Date
}

export default function AdminSecretPage() {
  const router = useRouter()
  const toast = useToast()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [maps, setMaps] = useState<Map[]>([])
  const [secretGrenades, setSecretGrenades] = useState<SecretGrenade[]>([])

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    mapId: '',
    grenadeType: 'SMOKE',
    side: 'BOTH',
    youtubeId: '',
  })
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [videoUploading, setVideoUploading] = useState(false)
  const [uploadedVideoPath, setUploadedVideoPath] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      const [mapsRes, secretRes] = await Promise.all([
        fetch('/api/maps'),
        fetch('/api/admin/secret'),
      ])

      const mapsData = await mapsRes.json()
      const secretData = await secretRes.json()

      if (mapsData.success) setMaps(mapsData.data)
      if (secretData.success) setSecretGrenades(secretData.data.secretGrenades)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg']
    if (!allowedTypes.includes(file.type)) {
      toast.error('Недопустимый формат. Разрешены: MP4, WebM, OGG')
      return
    }

    if (file.size > 100 * 1024 * 1024) {
      toast.error('Файл слишком большой. Максимум 100MB')
      return
    }

    setVideoFile(file)
    setVideoUploading(true)

    try {
      const formData = new FormData()
      formData.append('video', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (result.success) {
        setUploadedVideoPath(result.data.videoPath)
        toast.success('Видео загружено')
      } else {
        toast.error(result.error || 'Ошибка при загрузке')
        setVideoFile(null)
      }
    } catch (error) {
      console.error('Video upload error:', error)
      toast.error('Ошибка при загрузке видео')
      setVideoFile(null)
    } finally {
      setVideoUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const response = await fetch('/api/admin/secret', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          videoPath: uploadedVideoPath || undefined,
        }),
      })

      const result = await response.json()

      if (result.success) {
        toast.success('Секретная граната добавлена')
        setFormData({ title: '', description: '', mapId: '', grenadeType: 'SMOKE', side: 'BOTH', youtubeId: '' })
        setVideoFile(null)
        setUploadedVideoPath(null)
        if (fileInputRef.current) fileInputRef.current.value = ''
        fetchData()
      } else {
        toast.error(result.error || 'Ошибка')
      }
    } catch (error) {
      console.error('Error creating secret grenade:', error)
      toast.error('Ошибка при создании')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить секретную гранату?')) return

    try {
      const response = await fetch('/api/admin/secret', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })

      const result = await response.json()

      if (result.success) {
        toast.success('Секретная граната удалена')
        fetchData()
      } else {
        toast.error(result.error || 'Ошибка')
      }
    } catch (error) {
      console.error('Error deleting secret grenade:', error)
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
            <Zap className="h-6 w-6 text-cs2-accent" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight">Секретные гранаты</h1>
        </div>
        <p className="text-muted-foreground">
          Управление секретными гранатами для Premium пользователей
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Форма добавления */}
        <Card>
          <CardHeader>
            <CardTitle>Добавить секретную гранату</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Название *</label>
                <Input
                  placeholder="One-way Smoke A Site"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Описание</label>
                <Textarea
                  placeholder="Описание гранаты..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Карта *</label>
                <Select
                  value={formData.mapId}
                  onValueChange={(value) => setFormData({ ...formData, mapId: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите карту" />
                  </SelectTrigger>
                  <SelectContent>
                    {maps.map((map) => (
                      <SelectItem key={map.id} value={map.id}>
                        {map.displayName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Тип гранаты *</label>
                <Select
                  value={formData.grenadeType}
                  onValueChange={(value) => setFormData({ ...formData, grenadeType: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SMOKE">Smoke</SelectItem>
                    <SelectItem value="MOLOTOV">Molotov</SelectItem>
                    <SelectItem value="FLASH">Flash</SelectItem>
                    <SelectItem value="HE">HE</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Сторона *</label>
                <Select
                  value={formData.side}
                  onValueChange={(value) => setFormData({ ...formData, side: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="T">Terrorist</SelectItem>
                    <SelectItem value="CT">Counter-Terrorist</SelectItem>
                    <SelectItem value="BOTH">Обе стороны</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">YouTube ID</label>
                <Input
                  placeholder="dQw4w9WgXcQ"
                  value={formData.youtubeId}
                  onChange={(e) => setFormData({ ...formData, youtubeId: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  ID видео с YouTube (необязательно)
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Или загрузите видео</label>
                <div className="flex items-center gap-4">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/mp4,video/webm,video/ogg"
                    onChange={handleVideoUpload}
                    className="hidden"
                    id="video-upload"
                  />
                  <label htmlFor="video-upload">
                    <Button
                      type="button"
                      variant="outline"
                      disabled={videoUploading}
                      className="gap-2"
                      asChild
                    >
                      <span>
                        <Upload className="h-4 w-4" />
                        {videoUploading ? 'Загрузка...' : 'Выбрать видео'}
                      </span>
                    </Button>
                  </label>
                  {videoFile && (
                    <span className="text-sm text-muted-foreground truncate max-w-[200px]">
                      {videoFile.name}
                    </span>
                  )}
                </div>
                {uploadedVideoPath && (
                  <p className="text-xs text-green-500 flex items-center gap-1">
                    <Video className="h-3 w-3" />
                    Видео загружено: {uploadedVideoPath}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Форматы: MP4, WebM, OGG. Максимум 100MB
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
                    Добавление...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Добавить
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Список секретных гранат */}
        <Card>
          <CardHeader>
            <CardTitle>Добавленные гранаты ({secretGrenades.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {secretGrenades.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Секретные гранаты ещё не добавлены
              </p>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {secretGrenades.map((grenade) => (
                  <div
                    key={grenade.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-cs2-light/50"
                  >
                    {grenade.map.imageUrl ? (
                      <Image
                        src={grenade.map.imageUrl}
                        alt={grenade.map.displayName}
                        width={60}
                        height={40}
                        className="rounded object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="w-[60px] h-[40px] bg-cs2-gray rounded flex items-center justify-center">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{grenade.title}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{grenade.map.displayName}</span>
                        <span>•</span>
                        <span>{grenade.grenadeType}</span>
                        <span>•</span>
                        <span>{grenade.side}</span>
                        {grenade.youtubeId && (
                          <>
                            <span>•</span>
                            <Video className="h-3 w-3" />
                          </>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(grenade.id)}
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
