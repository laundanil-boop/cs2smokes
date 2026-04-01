'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Loader2, MapPin, Plus, Trash2, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Map as MapType } from '@/types'

export default function AdminMapsPage() {
  const [maps, setMaps] = useState<MapType[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedMap, setSelectedMap] = useState<MapType | null>(null)
  const [newMap, setNewMap] = useState({
    name: '',
    displayName: '',
    imageUrl: '',
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchMaps()
  }, [])

  async function fetchMaps() {
    try {
      const response = await fetch('/api/maps')
      const result = await response.json()
      if (result.success) {
        setMaps(result.data)
      }
    } catch (error) {
      console.error('Error fetching maps:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  async function handleAddMap() {
    try {
      let imageUrl = ''

      if (selectedFile) {
        setIsUploading(true)
        const formData = new FormData()
        formData.append('file', selectedFile)

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })
        const uploadResult = await uploadResponse.json()

        if (uploadResult.success) {
          imageUrl = uploadResult.path
        } else {
          alert('Ошибка загрузки изображения: ' + uploadResult.error)
          setIsUploading(false)
          return
        }
        setIsUploading(false)
      }

      const response = await fetch('/api/maps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newMap,
          imageUrl,
        }),
      })
      const result = await response.json()
      if (result.success) {
        setNewMap({ name: '', displayName: '', imageUrl: '' })
        setSelectedFile(null)
        setPreviewUrl('')
        setIsAddDialogOpen(false)
        fetchMaps()
      } else {
        alert('Ошибка: ' + result.error)
      }
    } catch (error) {
      console.error('Error adding map:', error)
      alert('Ошибка при добавлении карты')
    }
  }

  async function handleDeleteMap() {
    if (!selectedMap) return
    try {
      const response = await fetch(`/api/maps?name=${selectedMap.name}`, {
        method: 'DELETE',
      })
      const result = await response.json()
      if (result.success) {
        setIsDeleteDialogOpen(false)
        setSelectedMap(null)
        fetchMaps()
      } else {
        alert('Ошибка: ' + result.error)
      }
    } catch (error) {
      console.error('Error deleting map:', error)
      alert('Ошибка при удалении карты')
    }
  }

  function openDeleteDialog(map: MapType) {
    setSelectedMap(map)
    setIsDeleteDialogOpen(true)
  }

  function resetForm() {
    setNewMap({ name: '', displayName: '', imageUrl: '' })
    setSelectedFile(null)
    setPreviewUrl('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="container py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">Управление картами</h1>
          <p className="text-muted-foreground">
            Добавление и удаление карт
          </p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Добавить карту
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-cs2-accent" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {maps.map((map) => (
            <Card key={map.id} className="bg-cs2-gray border-cs2-light overflow-hidden hover:border-cs2-accent transition-colors">
              <CardContent className="p-0">
                <div className="relative h-40 w-full">
                  {map.imageUrl ? (
                    <Image
                      src={map.imageUrl}
                      alt={map.displayName}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                      <MapPin className="w-12 h-12 text-gray-600" />
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-1">{map.displayName}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{map.name}</p>
                  <div className="flex gap-2">
                    <Link href={`/admin/positions/${map.name}`} className="flex-1">
                      <Button className="w-full gap-2" size="sm">
                        <MapPin className="w-4 h-4" />
                        Позиции
                      </Button>
                    </Link>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => openDeleteDialog(map)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog для добавления карты */}
      <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
        setIsAddDialogOpen(open)
        if (!open) resetForm()
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Добавить карту</DialogTitle>
            <DialogDescription>
              Заполните информацию о новой карте
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Название (ID)</Label>
              <Input
                id="name"
                placeholder="mirage, dust2, inferno..."
                value={newMap.name}
                onChange={(e) => setNewMap({ ...newMap, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="displayName">Отображаемое название</Label>
              <Input
                id="displayName"
                placeholder="Mirage, Dust II, Inferno..."
                value={newMap.displayName}
                onChange={(e) => setNewMap({ ...newMap, displayName: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="image">Изображение</Label>
              <div className="flex items-center gap-4">
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="flex-1"
                />
              </div>
              {previewUrl && (
                <div className="relative h-32 w-full rounded-md overflow-hidden bg-gray-800">
                  <Image
                    src={previewUrl}
                    alt="Preview"
                    fill
                    className="object-cover"
                  />
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleAddMap} disabled={isUploading}>
              {isUploading ? 'Загрузка...' : 'Добавить'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog для подтверждения удаления */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Удалить карту</DialogTitle>
            <DialogDescription>
              Вы уверены, что хотите удалить карту &quot;{selectedMap?.displayName}&quot;?
              Это действие нельзя отменить. Все лайнапы и позиции этой карты будут удалены.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Отмена
            </Button>
            <Button variant="destructive" onClick={handleDeleteMap}>
              Удалить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
