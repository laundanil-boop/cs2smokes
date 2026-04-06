'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Video, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Map as GameMap, LineupPosition } from '@/types'
import Image from 'next/image'
import { useToast } from '@/components/ui/Toast'

const lineupSchema = z.object({
  title: z.string().min(1, 'Название обязательно').max(100),
  description: z.string().max(500).optional(),
  mapId: z.string().min(1, 'Выберите карту'),
  positionId: z.string().optional(),
  grenadeType: z.enum(['SMOKE', 'MOLOTOV', 'FLASH', 'HE']),
  side: z.enum(['CT', 'T', 'BOTH']),
  youtubeId: z.string().min(1, 'YouTube ID обязателен'),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']),
})

type LineupForm = z.infer<typeof lineupSchema>

export default function AdminAddLineupPage() {
  return (
    <Suspense fallback={<div className="container py-8 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-cs2-accent" /></div>}>
      <AdminAddLineupContent />
    </Suspense>
  )
}

function AdminAddLineupContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const toast = useToast()
  const preselectedPositionId = searchParams.get('positionId')
  const preselectedMapId = searchParams.get('mapId')

  const [maps, setMaps] = useState<GameMap[]>([])
  const [positions, setPositions] = useState<LineupPosition[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedMap, setSelectedMap] = useState<GameMap | null>(null)

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<LineupForm>({
    resolver: zodResolver(lineupSchema),
    defaultValues: {
      difficulty: 'MEDIUM',
      side: 'T',
    },
  })

  const selectedMapId = watch('mapId')
  const youtubeId = watch('youtubeId')

  // Загрузка карт
  useEffect(() => {
    fetch('/api/maps')
      .then(res => res.json())
      .then(result => {
        if (result.success) setMaps(result.data)
      })
      .catch(console.error)
  }, [])

  // Загрузка позиций при выборе карты
  useEffect(() => {
    if (selectedMapId) {
      const selected = maps.find(m => m.id === selectedMapId)
      setSelectedMap(selected || null)

      fetch(`/api/positions?mapId=${selectedMapId}`)
        .then(res => res.json())
        .then(result => {
          if (result.success) setPositions(result.data)
        })
        .catch(console.error)
    } else {
      setPositions([])
      setSelectedMap(null)
    }
  }, [selectedMapId, maps])

  // Предвыбор карты и позиции из URL
  useEffect(() => {
    if (preselectedMapId && maps.length > 0) {
      setValue('mapId', preselectedMapId)
    }
  }, [preselectedMapId, maps, setValue])

  useEffect(() => {
    if (preselectedPositionId) {
      setValue('positionId', preselectedPositionId)
    }
  }, [preselectedPositionId, setValue])

  const onSubmit = async (data: LineupForm) => {
    try {
      setLoading(true)

      const response = await fetch('/api/lineups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          isUserGenerated: false,
        }),
      })

      const result = await response.json()

      if (result.success) {
        toast.success('Лайнап создан')
        router.push(`/lineups/${result.data.id}`)
      } else {
        toast.error(result.error || 'Ошибка при создании')
      }
    } catch (err) {
      toast.error('Произошла ошибка')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight">Добавить официальный лайнап</h1>
        <p className="text-muted-foreground mt-2">
          Создание официального лайнапа с видео с компьютера
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Форма */}
        <div className="lg:col-span-2">
          <Card className="bg-cs2-gray border-cs2-light">
            <CardHeader>
              <CardTitle>Информация о лайнапе</CardTitle>
              <CardDescription>Заполните данные</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Название */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Название *</label>
                  <Input
                    placeholder="Smoke на A Main"
                    {...register('title')}
                    disabled={loading}
                  />
                  {errors.title && (
                    <p className="text-sm text-destructive">{errors.title.message}</p>
                  )}
                </div>

                {/* Описание */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Описание</label>
                  <Textarea
                    placeholder="Краткое описание лайнапа"
                    {...register('description')}
                    disabled={loading}
                    rows={2}
                  />
                </div>

                {/* Карта и позиция */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Карта *</label>
                    <Select
                      onValueChange={(value) => setValue('mapId', value)}
                      disabled={loading}
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
                    {errors.mapId && (
                      <p className="text-sm text-destructive">{errors.mapId.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Позиция</label>
                    <Select
                      onValueChange={(value) => setValue('positionId', value)}
                      disabled={loading || !selectedMapId || positions.length === 0}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите позицию" />
                      </SelectTrigger>
                      <SelectContent>
                        {positions.map((pos) => (
                          <SelectItem key={pos.id} value={pos.id}>
                            {pos.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Тип гранаты и сторона */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Тип гранаты *</label>
                    <Select
                      onValueChange={(value: any) => setValue('grenadeType', value)}
                      disabled={loading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите тип" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SMOKE">Smoke</SelectItem>
                        <SelectItem value="MOLOTOV">Molotov</SelectItem>
                        <SelectItem value="FLASH">Flash</SelectItem>
                        <SelectItem value="HE">HE Grenade</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Сторона *</label>
                    <Select
                      onValueChange={(value: any) => setValue('side', value)}
                      disabled={loading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите сторону" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="T">Terrorist</SelectItem>
                        <SelectItem value="CT">Counter-Terrorist</SelectItem>
                        <SelectItem value="BOTH">Обе стороны</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Сложность */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Сложность *</label>
                  <Select
                    onValueChange={(value: any) => setValue('difficulty', value)}
                    disabled={loading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите сложность" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EASY">Легко</SelectItem>
                      <SelectItem value="MEDIUM">Средне</SelectItem>
                      <SelectItem value="HARD">Сложно</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* YouTube видео */}
                <div className="space-y-4">
                  <label className="text-sm font-medium">YouTube видео *</label>
                  <div className="space-y-2">
                    <Input
                      placeholder="YouTube ID (например: dQw4w9WgXcQ) или полная ссылка"
                      {...register('youtubeId')}
                      disabled={loading}
                      onChange={(e) => {
                        const val = e.target.value
                        // Extract ID from full URL
                        const patterns = [
                          /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/,
                          /^([a-zA-Z0-9_-]{11})$/,
                        ]
                        for (const pattern of patterns) {
                          const match = val.match(pattern)
                          if (match) {
                            setValue('youtubeId', match[1])
                            break
                          }
                        }
                      }}
                    />
                    {youtubeId && (
                      <div className="aspect-video rounded-lg overflow-hidden bg-black">
                        <img
                          src={`https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`}
                          alt="YouTube thumbnail"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Кнопки */}
                <div className="flex gap-4">
                  <Button type="submit" variant="cs2" className="flex-1" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Создать лайнап
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    disabled={loading}
                  >
                    Отмена
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar с превью */}
        <div className="lg:col-span-1">
          <Card className="bg-cs2-gray border-cs2-light sticky top-24">
            <CardHeader>
              <CardTitle>Предпросмотр</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Миникарта */}
              {selectedMap ? (
                <div className="relative w-full aspect-square rounded-lg overflow-hidden border border-gray-700 bg-gray-800">
                  <Image
                    src={`/minimaps/${selectedMap.name}.png`}
                    alt={selectedMap.displayName}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              ) : (
                <div className="aspect-square rounded-lg bg-cs2-light flex items-center justify-center border border-gray-700">
                  <p className="text-muted-foreground text-sm text-center px-4">
                    Выберите карту
                  </p>
                </div>
              )}

              {/* Видео превью */}
              {youtubeId ? (
                <div className="aspect-video rounded-lg overflow-hidden bg-black">
                  <img
                    src={`https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="aspect-video rounded-lg bg-cs2-light flex items-center justify-center">
                  <Video className="w-8 h-8 text-muted-foreground" />
                </div>
              )}

              {/* Инфо */}
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Название:</span>
                  <p className="font-medium">{watch('title') || '—'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Тип:</span>
                  <p className="font-medium">{watch('grenadeType') || '—'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Сложность:</span>
                  <p className="font-medium">{watch('difficulty') || '—'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
