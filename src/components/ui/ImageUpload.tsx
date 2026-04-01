'use client'

import { useState, useCallback } from 'react'
import { Upload, X, Check, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ImageUploadProps {
  value?: string
  onChange: (url: string) => void
  label?: string
  className?: string
}

export default function ImageUpload({
  value,
  onChange,
  label = 'Загрузить изображение',
  className,
}: ImageUploadProps) {
  const [dragOver, setDragOver] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [preview, setPreview] = useState(value)

  const handleUpload = useCallback(async (file: File) => {
    // Проверка типа
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      setError('Недопустимый формат. Разрешены: JPEG, PNG, WebP, GIF')
      return
    }

    // Проверка размера
    if (file.size > 5 * 1024 * 1024) {
      setError('Файл слишком большой. Максимум 5MB')
      return
    }

    setUploading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('image', file)

      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (!result.success) {
        setError(result.error || 'Ошибка загрузки')
        return
      }

      onChange(result.data.imageUrl)
      setPreview(result.data.imageUrl)
    } catch (err) {
      setError('Произошла ошибка при загрузке')
    } finally {
      setUploading(false)
    }
  }, [onChange])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)

    const file = e.dataTransfer.files[0]
    if (file) {
      handleUpload(file)
    }
  }, [handleUpload])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleUpload(file)
    }
  }, [handleUpload])

  const handleRemove = () => {
    onChange('')
    setPreview('')
    setError('')
  }

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <label className="text-sm font-medium text-gray-300">{label}</label>
      )}

      {preview ? (
        /* Предпросмотр */
        <div className="relative rounded-lg overflow-hidden border border-gray-700 bg-gray-800">
          <div className="relative aspect-video w-full">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-cover"
            />
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 rounded-full transition-colors"
            disabled={uploading}
          >
            <X className="w-4 h-4 text-white" />
          </button>
          {uploading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-white" />
            </div>
          )}
        </div>
      ) : (
        /* Drag & Drop зона */
        <div
          onDragOver={(e) => {
            e.preventDefault()
            setDragOver(true)
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={cn(
            'relative border-2 border-dashed rounded-lg p-8 text-center transition-colors',
            dragOver
              ? 'border-cs2-accent bg-cs2-accent/10'
              : 'border-gray-700 hover:border-gray-600',
            uploading && 'opacity-50 pointer-events-none'
          )}
        >
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={uploading}
          />

          <div className="flex flex-col items-center gap-3">
            {uploading ? (
              <>
                <Loader2 className="w-10 h-10 animate-spin text-cs2-accent" />
                <p className="text-sm text-gray-400">Загрузка...</p>
              </>
            ) : (
              <>
                <Upload className="w-10 h-10 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-300">
                    Перетащите изображение сюда или нажмите для выбора
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    JPEG, PNG, WebP, GIF (макс. 5MB)
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}

      {preview && !error && (
        <p className="text-sm text-green-400 flex items-center gap-1">
          <Check className="w-4 h-4" />
          Изображение загружено
        </p>
      )}
    </div>
  )
}
