'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Plus, X, MapPin, HelpCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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

const lineupSchema = z.object({
  title: z.string().min(1, 'Название обязательно').max(100),
  description: z.string().max(500).optional(),
  mapId: z.string().min(1, 'Выберите карту'),
  positionId: z.string().optional(),
  grenadeType: z.enum(['SMOKE', 'MOLOTOV', 'FLASH', 'HE']),
  side: z.enum(['CT', 'T', 'BOTH']),
  youtubeId: z.string().optional(),
  videoPath: z.string().optional(),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']),
  throwPosition: z.object({
    x: z.coerce.number().optional(),
    y: z.coerce.number().optional(),
    z: z.coerce.number().optional(),
  }).optional(),
  steps: z.array(z.object({
    x: z.coerce.number(),
    y: z.coerce.number(),
    description: z.string(),
  })).optional(),
})

type LineupForm = z.infer<typeof lineupSchema>

function UploadContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const preselectedPositionId = searchParams.get('positionId')
  
  const [maps, setMaps] = useState<GameMap[]>([])
  const [positions, setPositions] = useState<LineupPosition[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [youtubePreview, setYoutubePreview] = useState('')
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [videoPreview, setVideoPreview] = useState('')
  const [uploadingVideo, setUploadingVideo] = useState(false)

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

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'steps',
  })

  const youtubeId = watch('youtubeId')
  const selectedMapId = watch('mapId')

  // Загрузка позиций при выборе карты
  useEffect(() => {
    if (selectedMapId) {
      fetch(`/api/positions?mapId=${selectedMapId}`)
        .then(res => res.json())
        .then(result => {
          if (result.success) {
            setPositions(result.data)
          }
        })
        .catch(console.error)
    } else {
      setPositions([])
    }
  }, [selectedMapId])

  // Установка предвыбранной позиции из URL параметра
  useEffect(() => {
    if (preselectedPositionId) {
      setValue('positionId', preselectedPositionId)
    }
  }, [preselectedPositionId, setValue])

  useEffect(() => {
    async function fetchMaps() {
      try {
        const response = await fetch('/api/maps')
        const result = await response.json()
        if (result.success) {
          setMaps(result.data)
        }
      } catch (error) {
        console.error('Error fetching maps:', error)
      }
    }

    fetchMaps()
  }, [])

  useEffect(() => {
    // Extract YouTube ID from URL
    if (youtubeId) {
      const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/,
        /^([a-zA-Z0-9_-]{11})$/,
      ]

      for (const pattern of patterns) {
        const match = youtubeId.match(pattern)
        if (match) {
          setYoutubePreview(match[1])
          setValue('youtubeId', match[1])
          break
        }
      }
    }
  }, [youtubeId, setValue])

  const onSubmit = async (data: LineupForm) => {
    try {
      setLoading(true)
      setError('')

      // Сначала загружаем видеофайл если он есть
      let videoPath = data.videoPath
      if (videoFile) {
        setUploadingVideo(true)
        const formData = new FormData()
        formData.append('video', videoFile)

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        const uploadResult = await uploadResponse.json()

        if (!uploadResult.success) {
          setError(uploadResult.error || 'Ошибка при загрузке видео')
          setLoading(false)
          setUploadingVideo(false)
          return
        }

        videoPath = uploadResult.data.videoPath
        setUploadingVideo(false)
      }

      // Проверяем что есть либо видеофайл либо YouTube ID
      if (!videoPath && !data.youtubeId) {
        setError('Загрузите видеофайл или укажите YouTube ссылку')
        setLoading(false)
        return
      }

      const response = await fetch('/api/lineups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          videoPath,
          isUserGenerated: true, // Пользовательский лайнап
        }),
      })

      const result = await response.json()

      if (result.success) {
        router.push(`/lineups/${result.data.id}`)
      } else {
        setError(result.error || 'Ошибка при загрузке лайнапа')
      }
    } catch (err) {
      setError('Произошла ошибка. Попробуйте позже.')
    } finally {
      setLoading(false)
    }
  }

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg']
      if (!allowedTypes.includes(file.type)) {
        setError('Недопустимый формат видео. Разрешены: MP4, WebM, OGG')
        return
      }
      
      const maxSize = 100 * 1024 * 1024
      if (file.size > maxSize) {
        setError('Файл слишком большой. Максимум 100MB')
        return
      }

      setVideoFile(file)
      setVideoPreview(URL.createObjectURL(file))
      setError('')
    }
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight">Загрузить лайнап</h1>
        <p className="text-muted-foreground mt-2">
          Добавьте свой гранатный лайнап для сообщества
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className="bg-cs2-gray border-cs2-light">
            <CardHeader>
              <CardTitle>Основная информация</CardTitle>
              <CardDescription>
                Заполните данные о вашем лайнапе
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {error && (
                  <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <label htmlFor="title" className="text-sm font-medium">
                    Название *
                  </label>
                  <Input
                    id="title"
                    placeholder="Smoke на A Main"
                    {...register('title')}
                    disabled={loading}
                  />
                  {errors.title && (
                    <p className="text-sm text-destructive">{errors.title.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="description" className="text-sm font-medium">
                    Описание
                  </label>
                  <Input
                    id="description"
                    placeholder="Краткое описание лайнапа"
                    {...register('description')}
                    disabled={loading}
                  />
                  {errors.description && (
                    <p className="text-sm text-destructive">{errors.description.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="mapId" className="text-sm font-medium">
                      Карта *
                    </label>
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
                    <label htmlFor="positionId" className="text-sm font-medium">
                      Позиция (опционально)
                    </label>
                    <Select
                      onValueChange={(value) => setValue('positionId', value)}
                      disabled={loading || !selectedMapId || positions.length === 0}
                      value={watch('positionId')}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите позицию" />
                      </SelectTrigger>
                      <SelectContent>
                        {positions.map((position) => (
                          <SelectItem key={position.id} value={position.id}>
                            {position.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {positions.length === 0 && selectedMapId && (
                      <p className="text-xs text-muted-foreground">
                        Для этой карты нет позиций
                      </p>
                    )}
                    {errors.positionId && (
                      <p className="text-sm text-destructive">{errors.positionId.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="grenadeType" className="text-sm font-medium">
                      Тип гранаты *
                    </label>
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
                    {errors.grenadeType && (
                      <p className="text-sm text-destructive">{errors.grenadeType.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="side" className="text-sm font-medium">
                      Сторона *
                    </label>
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
                    {errors.side && (
                      <p className="text-sm text-destructive">{errors.side.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="difficulty" className="text-sm font-medium">
                    Сложность *
                  </label>
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
                  {errors.difficulty && (
                    <p className="text-sm text-destructive">{errors.difficulty.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Видео *
                  </label>
                  <div className="border-2 border-dashed border-cs2-light rounded-lg p-6 text-center hover:border-cs2-orange transition-colors">
                    <input
                      type="file"
                      id="video"
                      accept="video/mp4,video/webm,video/ogg"
                      onChange={handleVideoChange}
                      disabled={loading || uploadingVideo}
                      className="hidden"
                    />
                    <label htmlFor="video" className="cursor-pointer">
                      {videoPreview ? (
                        <div className="space-y-2">
                          <video
                            src={videoPreview}
                            controls
                            className="max-h-48 mx-auto rounded-lg"
                          />
                          <p className="text-sm text-muted-foreground">
                            {videoFile?.name}
                          </p>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setVideoFile(null)
                              setVideoPreview('')
                            }}
                            disabled={loading}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Удалить
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="w-12 h-12 mx-auto rounded-full bg-cs2-light flex items-center justify-center">
                            <svg className="w-6 h-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm font-medium">
                              Нажмите для загрузки или перетащите файл
                            </p>
                            <p className="text-xs text-muted-foreground">
                              MP4, WebM, OGG (макс. 100MB)
                            </p>
                          </div>
                        </div>
                      )}
                    </label>
                  </div>
                  {errors.videoPath && (
                    <p className="text-sm text-destructive">{errors.videoPath.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="youtubeId" className="text-sm font-medium">
                    YouTube ID или ссылка (опционально)
                  </label>
                  <Input
                    id="youtubeId"
                    placeholder="dQw4w9WgXcQ или https://youtube.com/watch?v=..."
                    {...register('youtubeId')}
                    disabled={loading || !!videoFile}
                  />
                  {errors.youtubeId && (
                    <p className="text-sm text-destructive">{errors.youtubeId.message}</p>
                  )}
                  {youtubePreview && (
                    <p className="text-sm text-muted-foreground">
                      Распознанный ID: {youtubePreview}
                    </p>
                  )}
                </div>

                {/* Throw Position fields */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <label className="text-sm font-medium">
                      Позиция броска (опционально)
                    </label>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm text-muted-foreground">X</label>
                      <Input
                        type="number"
                        placeholder="0"
                        {...register('throwPosition.x')}
                        disabled={loading}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-muted-foreground">Y</label>
                      <Input
                        type="number"
                        placeholder="0"
                        {...register('throwPosition.y')}
                        disabled={loading}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-muted-foreground">Z</label>
                      <Input
                        type="number"
                        placeholder="0"
                        {...register('throwPosition.z')}
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>

                {/* Steps */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                      <label className="text-sm font-medium">
                        Шаги выполнения (опционально)
                      </label>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => append({ x: 0, y: 0, description: '' })}
                      disabled={loading}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Добавить шаг
                    </Button>
                  </div>

                  {fields.map((field, index) => (
                    <div key={field.id} className="flex items-center gap-4 p-4 rounded-lg bg-cs2-light">
                      <span className="text-sm font-medium text-muted-foreground w-6">
                        {index + 1}.
                      </span>
                      <Input
                        placeholder="Описание шага"
                        {...register(`steps.${index}.description`)}
                        disabled={loading}
                      />
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          placeholder="X"
                          className="w-20"
                          {...register(`steps.${index}.x`)}
                          disabled={loading}
                        />
                        <Input
                          type="number"
                          placeholder="Y"
                          className="w-20"
                          {...register(`steps.${index}.y`)}
                          disabled={loading}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(index)}
                        disabled={loading}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-4">
                  <Button
                    type="submit"
                    variant="cs2"
                    className="flex-1"
                    disabled={loading}
                  >
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Загрузить лайнап
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

        {/* Preview sidebar */}
        <div className="lg:col-span-1">
          <Card className="bg-cs2-gray border-cs2-light sticky top-24">
            <CardHeader>
              <CardTitle>Предпросмотр</CardTitle>
              <CardDescription>
                Как будет выглядеть ваш лайнап
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {videoPreview ? (
                <video
                  src={videoPreview}
                  controls
                  className="w-full rounded-lg"
                />
              ) : youtubePreview ? (
                <div className="aspect-video rounded-lg overflow-hidden bg-black">
                  <img
                    src={`https://img.youtube.com/vi/${youtubePreview}/mqdefault.jpg`}
                    alt="YouTube thumbnail"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="aspect-video rounded-lg bg-cs2-light flex items-center justify-center">
                  <p className="text-muted-foreground text-sm">
                    Загрузите видео для предпросмотра
                  </p>
                </div>
              )}

              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Название:</span>
                  <p className="font-medium">{watch('title') || '—'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Описание:</span>
                  <p className="text-muted-foreground">
                    {watch('description') || '—'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function UploadPage() {
  return (
    <Suspense fallback={<div className="container py-8 flex items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-cs2-accent border-t-transparent" /></div>}>
      <UploadContent />
    </Suspense>
  )
}
