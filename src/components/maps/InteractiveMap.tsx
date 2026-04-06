'use client'

import { useState, useRef, useCallback } from 'react'
import { LineupPosition, Lineup } from '@/types'
import { Cloud, Flame, Sun, Bomb, ZoomIn, ZoomOut } from 'lucide-react'

interface InteractiveMapProps {
  mapImage: string
  mapName: string
  positions: (LineupPosition & {
    _count?: { lineups: number }
    lineups?: Lineup[]
  })[]
  onPositionClick: (position: LineupPosition) => void
}

const grenadeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  SMOKE: Cloud,
  MOLOTOV: Flame,
  FLASH: Sun,
  HE: Bomb,
}

const grenadeColors: Record<string, string> = {
  SMOKE: 'text-gray-400 bg-gray-500/20 border-gray-500',
  MOLOTOV: 'text-orange-400 bg-orange-500/20 border-orange-500',
  FLASH: 'text-yellow-400 bg-yellow-500/20 border-yellow-500',
  HE: 'text-red-400 bg-red-500/20 border-red-500',
}

export default function InteractiveMap({
  mapImage,
  mapName,
  positions,
  onPositionClick,
}: InteractiveMapProps) {
  const [hoveredPosition, setHoveredPosition] = useState<string | null>(null)
  const [zoom, setZoom] = useState(1)
  const mapContainerRef = useRef<HTMLDivElement>(null)

  const MIN_ZOOM = 1
  const MAX_ZOOM = 4
  const ZOOM_STEP = 0.25

  const zoomIn = useCallback(() => {
    setZoom(prev => Math.min(prev + ZOOM_STEP, MAX_ZOOM))
  }, [])

  const zoomOut = useCallback(() => {
    setZoom(prev => Math.max(prev - ZOOM_STEP, MIN_ZOOM))
  }, [])

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    if (e.deltaY < 0) {
      zoomIn()
    } else {
      zoomOut()
    }
  }, [zoomIn, zoomOut])

  const resetZoom = useCallback(() => {
    setZoom(1)
  }, [])

  // Группируем лайнапы по типам гранат для каждой позиции
  const getLineupsByType = (position: typeof positions[0]) => {
    const lineups = position.lineups || []
    const grouped = lineups.reduce((acc, lineup) => {
      if (!acc[lineup.grenadeType]) {
        acc[lineup.grenadeType] = 0
      }
      acc[lineup.grenadeType]++
      return acc
    }, {} as Record<string, number>)
    return grouped
  }

  return (
    <div className="relative w-full max-w-2xl mx-auto" style={{ aspectRatio: '1/1', minHeight: '400px' }}>
      {/* Карта с зумом */}
      <div
        ref={mapContainerRef}
        onWheel={handleWheel}
        className="absolute inset-0 rounded-lg overflow-hidden shadow-2xl border-2 border-gray-700 bg-gray-900 cursor-grab active:cursor-grabbing"
      >
        <div
          className="w-full h-full transition-transform duration-200 ease-out origin-center"
          style={{ transform: `scale(${zoom})` }}
        >
          <img
            src={mapImage || '/minimaps/placeholder.svg'}
            alt={`${mapName} map`}
            className="w-full h-full object-cover pointer-events-none"
            onError={(e) => {
              console.log('Image load error for:', e.currentTarget.src)
              e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="800"%3E%3Crect fill="%231f2937" width="800" height="800"/%3E%3Ctext fill="%236b7280" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3ENo Map Image%3C/text%3E%3C/svg%3E'
            }}
          />

          {/* Позиции на карте */}
          {positions.map((position) => {
            const lineupsByType = getLineupsByType(position)
            const totalLineups = position._count?.lineups || 0

            return (
              <button
                key={position.id}
                onClick={() => onPositionClick(position)}
                onMouseEnter={() => setHoveredPosition(position.id)}
                onMouseLeave={() => setHoveredPosition(null)}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 group"
                style={{
                  left: `${position.positionX}%`,
                  top: `${position.positionY}%`,
                }}
              >
                {/* Маркер позиции */}
                <div className="relative">
                  {/* Пульсирующая анимация */}
                  <div className="absolute inset-0 rounded-full bg-blue-500/30 animate-ping" />

                  {/* Основной маркер */}
                  <div className={`
                    relative w-10 h-10 rounded-full border-2 border-blue-400
                    bg-blue-500/80 backdrop-blur-sm
                    flex items-center justify-center
                    transition-all duration-200
                    group-hover:scale-125 group-hover:border-blue-300
                    shadow-lg shadow-blue-500/50
                  `}>
                    <span className="text-white font-bold text-xs">
                      {totalLineups}
                    </span>
                  </div>

                  {/* Тултип с названием позиции */}
                  <div className={`
                    absolute bottom-full left-1/2 -translate-x-1/2 mb-2
                    px-3 py-1.5 bg-gray-900/95 backdrop-blur-sm
                    border border-gray-700 rounded-lg
                    whitespace-nowrap z-10
                    transition-opacity duration-200
                    ${hoveredPosition === position.id ? 'opacity-100' : 'opacity-0 pointer-events-none'}
                  `}>
                    <p className="text-white text-sm font-medium">{position.name}</p>
                    <p className="text-gray-400 text-xs">{totalLineups} гранат</p>

                    {/* Индикаторы типов гранат */}
                    {Object.entries(lineupsByType).length > 0 && (
                      <div className="flex gap-1 mt-1.5 pt-1.5 border-t border-gray-700">
                        {Object.entries(lineupsByType).map(([type, count]) => {
                          const Icon = grenadeIcons[type] || Cloud
                          const colorClass = grenadeColors[type] || grenadeColors.SMOKE
                          return (
                            <div
                              key={type}
                              className={`flex items-center gap-1 px-1.5 py-0.5 rounded ${colorClass}`}
                              title={type}
                            >
                              <Icon className="w-3 h-3" />
                              <span className="text-xs font-medium">{count}</span>
                            </div>
                          )
                        })}
                      </div>
                    )}

                    {/* Стрелочка вниз */}
                    <div className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-3 h-3 bg-gray-900/95 border-r border-b border-gray-700 rotate-45" />
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Контролы зума */}
      <div className="absolute top-3 right-3 flex flex-col gap-1 z-20">
        <button
          onClick={zoomIn}
          disabled={zoom >= MAX_ZOOM}
          className="w-8 h-8 rounded-lg bg-gray-900/90 backdrop-blur-sm border border-gray-700 flex items-center justify-center text-gray-300 hover:text-white hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="Приблизить"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={zoomOut}
          disabled={zoom <= MIN_ZOOM}
          className="w-8 h-8 rounded-lg bg-gray-900/90 backdrop-blur-sm border border-gray-700 flex items-center justify-center text-gray-300 hover:text-white hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="Отдалить"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        {zoom > 1 && (
          <button
            onClick={resetZoom}
            className="w-8 h-8 rounded-lg bg-gray-900/90 backdrop-blur-sm border border-gray-700 flex items-center justify-center text-gray-300 hover:text-white hover:bg-gray-800 transition-colors text-xs font-bold"
            title="Сбросить зум"
          >
            1x
          </button>
        )}
      </div>

      {/* Индикатор зума */}
      {zoom > 1 && (
        <div className="absolute bottom-3 right-3 z-20 px-2 py-1 rounded-md bg-gray-900/90 backdrop-blur-sm border border-gray-700 text-gray-400 text-xs font-mono">
          {zoom.toFixed(2)}x
        </div>
      )}

      {/* Легенда */}
      <div className="absolute -bottom-16 left-0 right-0 flex justify-center gap-4">
        <div className="flex items-center gap-3 px-4 py-2 bg-gray-900/80 backdrop-blur-sm rounded-lg border border-gray-700">
          <span className="text-gray-400 text-sm">Типы гранат:</span>
          {Object.entries(grenadeIcons).map(([type, Icon]) => {
            const colorClass = grenadeColors[type] || grenadeColors.SMOKE
            return (
              <div key={type} className={`flex items-center gap-1.5 px-2 py-1 rounded ${colorClass}`}>
                <Icon className="w-4 h-4" />
                <span className="text-xs font-medium">{type}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
