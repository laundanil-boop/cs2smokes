'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import ImageUpload from '@/components/ui/ImageUpload'
import { X, Save } from 'lucide-react'
import { LineupPosition } from '@/types'

interface EditPositionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  position: LineupPosition | null
  mapImage: string
  onSave: (positionId: string, data: {
    name: string
    imageUrl: string
    positionX: number
    positionY: number
    description: string
  }) => Promise<void>
}

export default function EditPositionDialog({
  open,
  onOpenChange,
  position,
  mapImage,
  onSave,
}: EditPositionDialogProps) {
  const [name, setName] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [description, setDescription] = useState('')
  const [positionCoords, setPositionCoords] = useState<{ x: number; y: number } | null>(null)
  const [loading, setLoading] = useState(false)
  const mapContainerRef = useRef<HTMLDivElement>(null)

  // Загрузка данных позиции при открытии
  useEffect(() => {
    if (position && open) {
      setName(position.name)
      setImageUrl(position.imageUrl || '')
      setDescription(position.description || '')
      setPositionCoords({ x: position.positionX, y: position.positionY })
    }
  }, [position, open])

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!mapContainerRef.current) return

    const rect = mapContainerRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100

    setPositionCoords({ x, y })
  }

  const handleSubmit = async () => {
    if (!name || !positionCoords || !position) return

    setLoading(true)
    try {
      await onSave(position.id, {
        name,
        imageUrl,
        positionX: positionCoords.x,
        positionY: positionCoords.y,
        description,
      })
      onOpenChange(false)
    } catch (error) {
      console.error('Error updating position:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    if (position) {
      setName(position.name)
      setImageUrl(position.imageUrl || '')
      setDescription(position.description || '')
      setPositionCoords({ x: position.positionX, y: position.positionY })
    }
  }

  if (!position) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Редактировать позицию</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Выбор координат на карте */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">
              1. Переместите маркер (кликните на карту)
            </label>
            <div
              ref={mapContainerRef}
              onClick={handleMapClick}
              className="relative w-full aspect-square max-w-2xl mx-auto rounded-lg overflow-hidden border-2 border-gray-700 cursor-crosshair"
            >
              <Image
                src={mapImage}
                alt="Map"
                fill
                className="object-cover"
                unoptimized
              />
              
              {/* Текущий маркер */}
              {positionCoords && (
                <div
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing z-10"
                  style={{
                    left: `${positionCoords.x}%`,
                    top: `${positionCoords.y}%`,
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault()
                    const handleMouseMove = (moveEvent: MouseEvent) => {
                      if (!mapContainerRef.current) return
                      const rect = mapContainerRef.current.getBoundingClientRect()
                      const x = ((moveEvent.clientX - rect.left) / rect.width) * 100
                      const y = ((moveEvent.clientY - rect.top) / rect.height) * 100
                      const clampedX = Math.max(0, Math.min(100, x))
                      const clampedY = Math.max(0, Math.min(100, y))
                      setPositionCoords({ x: clampedX, y: clampedY })
                    }
                    const handleMouseUp = () => {
                      document.removeEventListener('mousemove', handleMouseMove)
                      document.removeEventListener('mouseup', handleMouseUp)
                    }
                    document.addEventListener('mousemove', handleMouseMove)
                    document.addEventListener('mouseup', handleMouseUp)
                  }}
                  title="Перетащите маркер"
                >
                  <div className="w-8 h-8 rounded-full bg-cs2-accent border-4 border-white shadow-lg transform hover:scale-110 transition-transform flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-white" />
                  </div>
                </div>
              )}
            </div>
            {positionCoords && (
              <p className="text-sm text-gray-400 text-center">
                Координаты: X: {positionCoords.x.toFixed(1)}%, Y: {positionCoords.y.toFixed(1)}%
              </p>
            )}
          </div>

          {/* Название позиции */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">
              2. Название позиции
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Например: Окно, A Site"
              className="bg-gray-800 border-gray-700"
            />
          </div>

          {/* Загрузка изображения */}
          <div className="space-y-2">
            <ImageUpload
              value={imageUrl}
              onChange={setImageUrl}
              label="3. Загрузить/обновить скриншот позиции"
            />
          </div>

          {/* Описание */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">
              4. Описание
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Краткое описание позиции..."
              className="bg-gray-800 border-gray-700 min-h-[80px]"
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={handleReset}
            disabled={loading}
          >
            <X className="w-4 h-4 mr-2" />
            Сбросить
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={loading || !name || !positionCoords}
            className="gap-2"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Сохранение...' : 'Сохранить'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
