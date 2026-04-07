'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Loader2, Map as MapIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Lineup, LineupPosition, Map as MapType } from '@/types'
import { cn } from '@/lib/utils'
import InteractiveMap from '@/components/maps/InteractiveMap'
import LineupPositionPanel from '@/components/maps/LineupPositionPanel'
import { LineupFilters } from '@/components/lineups/LineupFilters'
import { LineupCard } from '@/components/lineups/LineupCard'

export default function MapPage() {
  const params = useParams()
  const router = useRouter()
  const mapName = params.map as string

  const [map, setMap] = useState<MapType | null>(null)
  const [positions, setPositions] = useState<(LineupPosition & {
    _count?: { lineups: number }
    lineups?: Lineup[]
  })[]>([])
  const [allLineups, setAllLineups] = useState<Lineup[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPosition, setSelectedPosition] = useState<LineupPosition | null>(null)
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map')

  // Filters
  const [grenadeType, setGrenadeType] = useState<'ALL' | 'SMOKE' | 'MOLOTOV' | 'FLASH' | 'HE'>('ALL')
  const [side, setSide] = useState<'ALL' | 'CT' | 'T' | 'BOTH'>('ALL')
  const [difficulty, setDifficulty] = useState<'ALL' | 'EASY' | 'MEDIUM' | 'HARD'>('ALL')

  const fetchPositions = useCallback(async () => {
    try {
      const response = await fetch(`/api/positions?map=${mapName}`)
      const result = await response.json()

      if (result.success) {
        setPositions(result.data)
      }
    } catch (error) {
      console.error('Error fetching positions:', error)
    }
  }, [mapName])

  const fetchLineups = useCallback(async () => {
    try {
      setLoading(true)
      const queryParams = new URLSearchParams({
        map: mapName,
        ...(grenadeType !== 'ALL' && { grenadeType }),
        ...(side !== 'ALL' && { side }),
        ...(difficulty !== 'ALL' && { difficulty }),
      })

      const response = await fetch(`/api/lineups?${queryParams}`)
      const result = await response.json()

      if (result.success) {
        setAllLineups(result.data.lineups)
      }
    } catch (error) {
      console.error('Error fetching lineups:', error)
    } finally {
      setLoading(false)
    }
  }, [mapName, grenadeType, side, difficulty])

  const fetchMap = useCallback(async () => {
    try {
      const response = await fetch(`/api/maps/${mapName}`)
      const result = await response.json()
      if (result.success) {
        setMap(result.data)
      }
    } catch (error) {
      console.error('Error fetching map:', error)
    }
  }, [mapName])

  useEffect(() => {
    fetchMap()
    fetchPositions()
    fetchLineups()
  }, [fetchMap, fetchPositions, fetchLineups])

  const handleReset = () => {
    setGrenadeType('ALL')
    setSide('ALL')
    setDifficulty('ALL')
  }

  const handleLineupClick = (lineup: Lineup) => {
    router.push(`/lineups/${lineup.id}`)
  }

  if (!map) {
    return (
      <div className="container py-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-cs2-accent" />
      </div>
    )
  }

  // URL миникарты для интерактивной карты
  const minimapUrl = `/minimaps/${map.name}.png`
  // URL превью карты для карточек (если есть)
  const mapImageUrl = map.imageUrl

  return (
    <div className="container py-8">
      {/* Заголовок */}
      <div className="mb-8">
        <Link href="/maps">
          <Button variant="ghost" size="sm" className="mb-4 gap-2">
            <ArrowLeft className="h-4 w-4" />
            Назад к картам
          </Button>
        </Link>

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
            <h1 className="text-4xl font-bold tracking-tight">{map.displayName}</h1>
            <p className="text-muted-foreground mt-1">
              {positions.length} позиций • {allLineups.length} лайнапов
            </p>
          </div>
        </div>
      </div>

      {/* Переключатель режима просмотра */}
      <div className="mb-6 flex items-center gap-4">
        <div className="flex items-center gap-2 bg-gray-800 rounded-lg p-1">
          <button
            onClick={() => setViewMode('map')}
            className={cn(
              'px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2',
              viewMode === 'map'
                ? 'bg-cs2-accent text-white'
                : 'text-gray-400 hover:text-white'
            )}
          >
            <MapIcon className="w-4 h-4" />
            Карта
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={cn(
              'px-4 py-2 rounded-md text-sm font-medium transition-colors',
              viewMode === 'list'
                ? 'bg-cs2-accent text-white'
                : 'text-gray-400 hover:text-white'
            )}
          >
            Список
          </button>
        </div>

        {viewMode === 'list' && (
          <LineupFilters
            grenadeType={grenadeType}
            side={side}
            difficulty={difficulty}
            onGrenadeTypeChange={setGrenadeType}
            onSideChange={setSide}
            onDifficultyChange={setDifficulty}
            onReset={handleReset}
          />
        )}
      </div>

      {/* Контент */}
      {viewMode === 'map' ? (
        <div className="relative">
          {/* Мини-карта */}
          <div className="mb-8">
            {positions.length > 0 ? (
              <InteractiveMap
                mapImage={minimapUrl}
                mapName={map.displayName}
                positions={positions}
                onPositionClick={setSelectedPosition}
              />
            ) : (
              <div className="relative w-full aspect-square max-w-2xl mx-auto rounded-lg overflow-hidden shadow-2xl border-2 border-gray-700 bg-gray-800">
                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                  <MapIcon className="w-16 h-16 mb-4 opacity-50" />
                  <p className="text-lg font-medium">Позиции пока не добавлены</p>
                  <p className="text-sm mt-2">
                    <Link href={`/admin/positions/${mapName}`} className="text-cs2-accent hover:underline">
                      Добавить первую позицию
                    </Link>
                  </p>
                </div>
                {/* Фоновое изображение миникарты */}
                <Image
                  src={minimapUrl}
                  alt={`${map.displayName} map`}
                  fill
                  className="object-cover opacity-30"
                  unoptimized
                />
              </div>
            )}
          </div>

          {/* Список позиций */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Все позиции на карте</h2>
            {positions.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {positions.map((position) => (
                  <button
                    key={position.id}
                    onClick={() => setSelectedPosition(position)}
                    className="group p-4 bg-gray-800/50 hover:bg-gray-800 rounded-lg border border-gray-700 transition-all text-left"
                  >
                    <div className="flex items-start gap-3">
                      {position.imageUrl ? (
                        <div className="relative w-24 h-16 rounded overflow-hidden flex-shrink-0 bg-gray-900">
                          <Image
                            src={position.imageUrl}
                            alt={position.name}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-300"
                            unoptimized
                          />
                        </div>
                      ) : (
                        <div className="w-24 h-16 rounded bg-gray-900 flex items-center justify-center flex-shrink-0">
                          <MapIcon className="w-8 h-8 text-gray-700" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-medium group-hover:text-cs2-accent transition-colors truncate">
                          {position.name}
                        </h3>
                        <p className="text-gray-400 text-sm mt-1">
                          {position._count?.lineups || 0} гранат
                        </p>
                        {position.description && (
                          <p className="text-gray-500 text-xs mt-1 line-clamp-1">
                            {position.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <MapIcon className="w-16 h-16 text-gray-700 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">
                  Позиции пока не добавлены
                </p>
                <p className="text-gray-500 text-sm mt-1">
                  Будьте первыми, кто добавит позицию на эту карту!
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Режим списка */
        <div>
          {loading ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <Loader2 className="h-8 w-8 animate-spin text-cs2-accent" />
            </div>
          ) : allLineups.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg">
                Лайнапы не найдены
              </p>
              <Button
                variant="ghost"
                className="mt-4"
                onClick={handleReset}
              >
                Сбросить фильтры
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {allLineups.map((lineup) => (
                <LineupCard
                  key={lineup.id}
                  lineup={lineup}
                  showFavorite
                  onToggleFavorite={() => {}}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Панель позиции */}
      {selectedPosition && (
        <LineupPositionPanel
          position={selectedPosition}
          onClose={() => setSelectedPosition(null)}
          onLineupClick={handleLineupClick}
        />
      )}
    </div>
  )
}
