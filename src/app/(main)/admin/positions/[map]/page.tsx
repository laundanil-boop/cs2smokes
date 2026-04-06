'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Plus, Edit, Trash2, Loader2, Map as MapIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LineupPosition, Map as MapType } from '@/types'
import { cn } from '@/lib/utils'
import AddPositionDialog from '@/components/maps/AddPositionDialog'
import EditPositionDialog from '@/components/maps/EditPositionDialog'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'

export default function AdminMapPositionsPage() {
  const params = useParams()
  const router = useRouter()
  const mapName = params.map as string

  const [map, setMap] = useState<MapType | null>(null)
  const [positions, setPositions] = useState<LineupPosition[]>([])
  const [loading, setLoading] = useState(true)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [positionToDelete, setPositionToDelete] = useState<string | null>(null)
  const [positionToEdit, setPositionToEdit] = useState<LineupPosition | null>(null)
  const [selectedPositions, setSelectedPositions] = useState<Set<string>>(new Set())
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false)
  const [lineupToDelete, setLineupToDelete] = useState<string | null>(null)
  const [deleteLineupDialogOpen, setDeleteLineupDialogOpen] = useState(false)
  
  // Фильтры и поиск
  const [searchQuery, setSearchQuery] = useState('')
  const [lineupsFilter, setLineupsFilter] = useState<'all' | 'with' | 'without'>('all')
  const [sortBy, setSortBy] = useState<'name' | 'lineups' | 'date'>('name')

  const fetchMap = useCallback(async () => {
    try {
      const response = await fetch('/api/maps')
      const result = await response.json()
      if (result.success) {
        const foundMap = result.data.find((m: MapType) => m.name === mapName)
        setMap(foundMap)
      }
    } catch (error) {
      console.error('Error fetching map:', error)
    }
  }, [mapName])

  const fetchPositions = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/positions?map=${mapName}`)
      const result = await response.json()
      if (result.success) {
        setPositions(result.data)
      }
    } catch (error) {
      console.error('Error fetching positions:', error)
    } finally {
      setLoading(false)
    }
  }, [mapName])

  useEffect(() => {
    fetchMap()
    fetchPositions()
  }, [fetchMap, fetchPositions])

  // Фильтрация и сортировка позиций
  const filteredPositions = positions
    .filter(position => {
      // Поиск по названию
      if (searchQuery && !position.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false
      }
      // Фильтр по количеству лайнапов
      if (lineupsFilter === 'with' && (!position.lineups || position.lineups.length === 0)) {
        return false
      }
      if (lineupsFilter === 'without' && position.lineups && position.lineups.length > 0) {
        return false
      }
      return true
    })
    .sort((a, b) => {
      // Сортировка
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name, 'ru')
      }
      if (sortBy === 'lineups') {
        return (b.lineups?.length || 0) - (a.lineups?.length || 0)
      }
      if (sortBy === 'date') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
      return 0
    })

  const handleAddPosition = async (data: {
    name: string
    imageUrl: string
    positionX: number
    positionY: number
    description: string
  }) => {
    if (!map) return

    const response = await fetch('/api/positions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...data,
        mapId: map.id,
      }),
    })

    const result = await response.json()
    if (!result.success) {
      throw new Error(result.error)
    }

    await fetchPositions()
  }

  const handleEditPosition = async (positionId: string, data: {
    name: string
    imageUrl: string
    positionX: number
    positionY: number
    description: string
  }) => {
    const response = await fetch(`/api/positions/${positionId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    const result = await response.json()
    if (!result.success) {
      throw new Error(result.error)
    }

    await fetchPositions()
  }

  const handleDeletePosition = async () => {
    if (!positionToDelete) return

    try {
      const response = await fetch(`/api/positions/${positionToDelete}`, {
        method: 'DELETE',
      })

      const result = await response.json()
      if (result.success) {
        setPositions(positions.filter((p) => p.id !== positionToDelete))
        setDeleteDialogOpen(false)
        setPositionToDelete(null)
      }
    } catch (error) {
      console.error('Error deleting position:', error)
    }
  }

  const confirmDelete = (positionId: string) => {
    setPositionToDelete(positionId)
    setDeleteDialogOpen(true)
  }

  const confirmEdit = (position: LineupPosition) => {
    setPositionToEdit(position)
    setEditDialogOpen(true)
  }

  const toggleSelectPosition = (positionId: string) => {
    setSelectedPositions(prev => {
      const next = new Set(prev)
      if (next.has(positionId)) {
        next.delete(positionId)
      } else {
        next.add(positionId)
      }
      return next
    })
  }

  const toggleSelectAll = () => {
    if (selectedPositions.size === filteredPositions.length) {
      setSelectedPositions(new Set())
    } else {
      setSelectedPositions(new Set(filteredPositions.map(p => p.id)))
    }
  }

  const handleBulkDelete = async () => {
    try {
      setLoading(true)
      // Удаляем позиции по одной
      await Promise.all(
        Array.from(selectedPositions).map(positionId =>
          fetch(`/api/positions/${positionId}`, { method: 'DELETE' })
        )
      )
      await fetchPositions()
      setSelectedPositions(new Set())
      setBulkDeleteDialogOpen(false)
    } catch (error) {
      console.error('Error bulk deleting positions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteLineup = async () => {
    if (!lineupToDelete) return
    try {
      await fetch(`/api/lineups/${lineupToDelete}`, { method: 'DELETE' })
      await fetchPositions()
      setDeleteLineupDialogOpen(false)
      setLineupToDelete(null)
    } catch (error) {
      console.error('Error deleting lineup:', error)
    }
  }

  if (!map) {
    return (
      <div className="container py-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-cs2-accent" />
      </div>
    )
  }

  return (
    <div className="container py-8">
      {/* Заголовок */}
      <div className="mb-8">
        <Link href={`/maps/${mapName}`}>
          <Button variant="ghost" size="sm" className="mb-4 gap-2">
            <ArrowLeft className="h-4 w-4" />
            Назад к карте
          </Button>
        </Link>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={cn(
              'h-12 w-12 rounded-lg flex items-center justify-center',
              map.name === 'mirage' ? 'bg-amber-600' :
              map.name === 'dust2' ? 'bg-yellow-700' :
              map.name === 'inferno' ? 'bg-green-700' :
              map.name === 'nuke' ? 'bg-blue-700' :
              map.name === 'overpass' ? 'bg-slate-600' :
              map.name === 'ancient' ? 'bg-emerald-700' :
              'bg-orange-700'
            )}>
              <span className="text-white font-bold text-lg">{map.displayName[0]}</span>
            </div>
            <div>
              <h1 className="text-4xl font-bold tracking-tight">
                Управление позициями: {map.displayName}
              </h1>
              <p className="text-muted-foreground mt-1">
                {positions.length} позиций на карте
                {selectedPositions.size > 0 && (
                  <span className="text-cs2-accent ml-2">
                    • Выбрано: {selectedPositions.size}
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {selectedPositions.size > 0 && (
              <Button
                variant="destructive"
                onClick={() => setBulkDeleteDialogOpen(true)}
                className="gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Удалить выбранное ({selectedPositions.size})
              </Button>
            )}
            <Button onClick={() => setAddDialogOpen(true)} className="gap-2">
              <Plus className="w-5 h-5" />
              Добавить позицию
            </Button>
          </div>
        </div>
      </div>

      {/* Фильтры и поиск */}
      <div className="mb-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Поиск */}
          <div className="md:col-span-2">
            <label className="text-xs text-gray-400 mb-1 block">Поиск позиции</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Например: Окно, A Site..."
              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cs2-accent"
            />
          </div>

          {/* Фильтр по лайнапам */}
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Лайнапы</label>
            <select
              value={lineupsFilter}
              onChange={(e) => setLineupsFilter(e.target.value as any)}
              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-cs2-accent"
            >
              <option value="all">Все</option>
              <option value="with">С лайнапами</option>
              <option value="without">Без лайнапов</option>
            </select>
          </div>

          {/* Сортировка */}
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Сортировка</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-cs2-accent"
            >
              <option value="name">По названию</option>
              <option value="lineups">По кол-ву лайнапов</option>
              <option value="date">По дате</option>
            </select>
          </div>
        </div>

        {/* Результаты фильтрации */}
        <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
          <span>
            Показано: {filteredPositions.length} из {positions.length}
          </span>
          {(searchQuery || lineupsFilter !== 'all' || sortBy !== 'name') && (
            <button
              onClick={() => {
                setSearchQuery('')
                setLineupsFilter('all')
                setSortBy('name')
              }}
              className="text-cs2-accent hover:underline"
            >
              Сбросить фильтры
            </button>
          )}
        </div>
      </div>

      {/* Список позиций */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-cs2-accent" />
        </div>
      ) : positions.length === 0 ? (
        <div className="text-center py-16 bg-gray-800/50 rounded-lg border border-gray-700">
          <MapIcon className="w-16 h-16 text-gray-700 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">
            Нет позиций
          </h3>
          <p className="text-gray-400 mb-4">
            Добавьте первую позицию для этой карты
          </p>
          <Button onClick={() => setAddDialogOpen(true)} className="gap-2">
            <Plus className="w-5 h-5" />
            Добавить позицию
          </Button>
        </div>
      ) : (
        <>
          {/* Чекбокс "Выбрать все" */}
          <div className="flex items-center gap-2 mb-4 p-2 bg-gray-800/50 rounded-lg">
            <input
              type="checkbox"
              checked={selectedPositions.size === filteredPositions.length}
              onChange={toggleSelectAll}
              className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-cs2-accent focus:ring-cs2-accent"
            />
            <span className="text-sm text-gray-400">
              Выбрать все ({filteredPositions.length})
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPositions.map((position) => (
              <div
                key={position.id}
                className={cn(
                  "bg-gray-800/50 rounded-lg border overflow-hidden transition-colors",
                  selectedPositions.has(position.id)
                    ? "border-cs2-accent bg-cs2-accent/10"
                    : "border-gray-700"
                )}
              >
                {/* Изображение */}
                {position.imageUrl ? (
                  <div className="relative w-full aspect-video">
                    <Image
                      src={position.imageUrl}
                      alt={position.name}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                ) : (
                  <div className="w-full aspect-video bg-gray-900 flex items-center justify-center">
                    <MapIcon className="w-12 h-12 text-gray-700" />
                  </div>
                )}

                {/* Информация */}
                <div className="p-4">
                  <div className="flex items-start gap-2 mb-2">
                    <input
                      type="checkbox"
                      checked={selectedPositions.has(position.id)}
                      onChange={() => toggleSelectPosition(position.id)}
                      className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-cs2-accent focus:ring-cs2-accent mt-1"
                    />
                    <h3 className="font-semibold text-white flex-1">{position.name}</h3>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => confirmEdit(position)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-red-400 hover:text-red-300"
                        onClick={() => confirmDelete(position.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                {position.description && (
                  <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                    {position.description}
                  </p>
                )}

                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>
                    X: {position.positionX.toFixed(1)}%
                  </span>
                  <span>
                    Y: {position.positionY.toFixed(1)}%
                  </span>
                </div>

                {/* Статистика */}
                <div className="mt-3 pt-3 border-t border-gray-700 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">
                      Лайнапов: {position.lineups?.length || 0}
                    </span>
                    <Link
                      href={`/admin/add-lineup?positionId=${position.id}&mapId=${map.id}`}
                      className="text-cs2-accent hover:underline text-xs"
                    >
                      + Добавить
                    </Link>
                  </div>

                  {/* Список лайнапов */}
                  {position.lineups && position.lineups.length > 0 && (
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {position.lineups.map((lineup) => (
                        <div
                          key={lineup.id}
                          className="flex items-center justify-between text-xs p-1.5 bg-gray-900/50 rounded"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-gray-300 truncate">{lineup.title}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className={cn(
                                "text-[10px] px-1 rounded",
                                lineup.grenadeType === 'SMOKE' ? 'bg-gray-700 text-gray-300' :
                                lineup.grenadeType === 'MOLOTOV' ? 'bg-orange-900/50 text-orange-300' :
                                lineup.grenadeType === 'FLASH' ? 'bg-yellow-900/50 text-yellow-300' :
                                'bg-red-900/50 text-red-300'
                              )}>
                                {lineup.grenadeType}
                              </span>
                              <span className={cn(
                                "text-[10px]",
                                lineup.side === 'T' ? 'text-amber-400' :
                                lineup.side === 'CT' ? 'text-blue-400' :
                                'text-purple-400'
                              )}>
                                {lineup.side}
                              </span>
                              <span className="text-gray-500 flex items-center gap-0.5">
                                👁 {lineup.views || 0}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 ml-2">
                            <Link
                              href={`/lineups/${lineup.id}`}
                              className="p-1 hover:bg-gray-700 rounded text-blue-400"
                              title="Просмотреть"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </Link>
                            <Link
                              href={`/lineups/${lineup.id}`}
                              className="p-1 hover:bg-gray-700 rounded text-gray-400"
                              title="Редактировать"
                            >
                              <Edit className="w-3 h-3" />
                            </Link>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setLineupToDelete(lineup.id)
                                setDeleteLineupDialogOpen(true)
                              }}
                              className="p-1 hover:bg-gray-700 rounded text-red-400"
                              title="Удалить"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          </div>
        </>
      )}

      {/* Диалоги */}
      <AddPositionDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        map={map}
        existingPositions={positions}
        onAddPosition={handleAddPosition}
      />

      <EditPositionDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        position={positionToEdit}
        mapImage={`/minimaps/${map.name}.png`}
        onSave={handleEditPosition}
      />

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Удалить позицию?</DialogTitle>
          </DialogHeader>
          <p className="text-gray-400">
            Вы уверены, что хотите удалить эту позицию? Связанные лайнапы останутся, но потеряют привязку к позиции.
          </p>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Отмена
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeletePosition}
            >
              Удалить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={bulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Удалить выбранные позиции?</DialogTitle>
          </DialogHeader>
          <p className="text-gray-400">
            Вы собираетесь удалить <span className="text-white font-medium">{selectedPositions.size} поз.</span>
            Связанные лайнапы останутся, но потеряют привязку к позициям.
          </p>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setBulkDeleteDialogOpen(false)}
              disabled={loading}
            >
              Отмена
            </Button>
            <Button
              variant="destructive"
              onClick={handleBulkDelete}
              disabled={loading}
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Удалить ({selectedPositions.size})
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteLineupDialogOpen} onOpenChange={setDeleteLineupDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Удалить лайнап?</DialogTitle>
          </DialogHeader>
          <p className="text-gray-400">
            Вы уверены, что хотите удалить этот лайнап? Это действие нельзя отменить.
          </p>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setDeleteLineupDialogOpen(false)}
            >
              Отмена
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteLineup}
            >
              Удалить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
