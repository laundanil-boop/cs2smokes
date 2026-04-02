'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import ImageUpload from '@/components/ui/ImageUpload'
import { Map, X, Plus, Save } from 'lucide-react'
import { Map as MapType, LineupPosition } from '@/types'

interface AddPositionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  map: MapType
  existingPositions: LineupPosition[]
  onAddPosition: (position: {
    name: string
    imageUrl: string
    positionX: number
    positionY: number
    description: string
  }) => Promise<void>
}

export default function AddPositionDialog({
  open,
  onOpenChange,
  map,
  existingPositions,
  onAddPosition,
}: AddPositionDialogProps) {
  const [name, setName] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [description, setDescription] = useState('')
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null)
  const [loading, setLoading] = useState(false)
  const mapContainerRef = useRef<HTMLDivElement>(null)

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!mapContainerRef.current) return

    const rect = mapContainerRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100

    setPosition({ x, y })
  }

  const handleMarkerDrag = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!mapContainerRef.current || !position) return

    const rect = mapContainerRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100

    // Ограничиваем координаты от 0 до 100
    const clampedX = Math.max(0, Math.min(100, x))
    const clampedY = Math.max(0, Math.min(100, y))

    setPosition({ x: clampedX, y: clampedY })
  }

  const handleSubmit = async () => {
    if (!name || !position) return

    setLoading(true)
    try {
      await onAddPosition({
        name,
        imageUrl,
        positionX: position.x,
        positionY: position.y,
        description,
      })
      // Reset form
      setName('')
      setImageUrl('')
      setDescription('')
      setPosition(null)
      onOpenChange(false)
    } catch (error) {
      console.error('Error adding position:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setName('')
    setImageUrl('')
    setDescription('')
    setPosition(null)
  }

  const mapImageUrl = map.imageUrl || `/minimaps/${map.name}.png`

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Добавить новую позицию</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Выбор координат на карте */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">
              1. Выберите позицию на карте (кликните)
            </label>
            <div
              ref={mapContainerRef}
              onClick={handleMapClick}
              className="relative w-full aspect-square max-w-2xl mx-auto rounded-lg overflow-hidden border-2 border-gray-700 cursor-crosshair"
            >
              <Image
                src={mapImageUrl}
                alt={map.displayName}
                fill
                className="object-cover"
                unoptimized
              />
              
              {/* Существующие позиции */}
              {existingPositions.map((pos) => (
                <div
                  key={pos.id}
                  className="absolute w-4 h-4 rounded-full bg-gray-500/50 border-2 border-gray-400 transform -translate-x-1/2 -translate-y-1/2"
                  style={{
                    left: `${pos.positionX}%`,
                    top: `${pos.positionY}%`,
                  }}
                  title={pos.name}
                />
              ))}

              {/* Выбранная позиция */}
              {position && (
                <div
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing z-10"
                  style={{
                    left: `${position.x}%`,
                    top: `${position.y}%`,
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
                      setPosition({ x: clampedX, y: clampedY })
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
            {position && (
              <p className="text-sm text-gray-400 text-center">
                Координаты: X: {position.x.toFixed(1)}%, Y: {position.y.toFixed(1)}%
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
              placeholder="Например: Окно, A Site, B Apartments"
              className="bg-gray-800 border-gray-700"
            />
          </div>

          {/* Загрузка изображения */}
          <div className="space-y-2">
            <ImageUpload
              value={imageUrl}
              onChange={setImageUrl}
              label="3. Загрузить скриншот позиции"
            />
          </div>

          {/* Описание */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">
              4. Описание (опционально)
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
            disabled={loading || !name || !position}
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
