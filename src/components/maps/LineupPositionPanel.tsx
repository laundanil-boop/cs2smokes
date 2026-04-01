'use client'

import Image from 'next/image'
import { LineupPosition, Lineup } from '@/types'
import { X, Cloud, Flame, Sun, Bomb, Video, ChevronRight } from 'lucide-react'

interface LineupPositionPanelProps {
  position: LineupPosition & {
    lineups?: Lineup[]
  } | null
  onClose: () => void
  onLineupClick?: (lineup: Lineup) => void
}

const grenadeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  SMOKE: Cloud,
  MOLOTOV: Flame,
  FLASH: Sun,
  HE: Bomb,
}

const grenadeColors: Record<string, string> = {
  SMOKE: 'text-gray-400 bg-gray-500/10 border-gray-500 hover:bg-gray-500/20',
  MOLOTOV: 'text-orange-400 bg-orange-500/10 border-orange-500 hover:bg-orange-500/20',
  FLASH: 'text-yellow-400 bg-yellow-500/10 border-yellow-500 hover:bg-yellow-500/20',
  HE: 'text-red-400 bg-red-500/10 border-red-500 hover:bg-red-500/20',
}

const sideColors: Record<string, string> = {
  CT: 'bg-blue-500/20 text-blue-400 border-blue-500',
  T: 'bg-amber-500/20 text-amber-400 border-amber-500',
  BOTH: 'bg-purple-500/20 text-purple-400 border-purple-500',
}

const difficultyColors: Record<string, string> = {
  EASY: 'text-green-400',
  MEDIUM: 'text-yellow-400',
  HARD: 'text-red-400',
}

export default function LineupPositionPanel({
  position,
  onClose,
  onLineupClick,
}: LineupPositionPanelProps) {
  if (!position) return null

  // Группируем лайнапы по типам гранат
  const lineupsByType = (position.lineups || []).reduce((acc, lineup) => {
    if (!acc[lineup.grenadeType]) {
      acc[lineup.grenadeType] = []
    }
    acc[lineup.grenadeType].push(lineup)
    return acc
  }, {} as Record<string, Lineup[]>)

  return (
    <div className="fixed inset-y-0 right-0 w-full max-w-md bg-gray-900/95 backdrop-blur-xl border-l border-gray-700 shadow-2xl z-50 overflow-hidden flex flex-col">
      {/* Заголовок */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <h2 className="text-xl font-bold text-white">{position.name}</h2>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      {/* Контент */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Изображение позиции */}
        {position.imageUrl && (
          <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-gray-700">
            <Image
              src={position.imageUrl}
              alt={position.name}
              fill
              className="object-cover"
              unoptimized
            />
          </div>
        )}

        {/* Описание */}
        {position.description && (
          <p className="text-gray-400 text-sm">{position.description}</p>
        )}

        {/* Статистика */}
        <div className="flex items-center gap-4 text-sm">
          <span className="text-gray-400">
            Всего гранат: <span className="text-white font-medium">{position.lineups?.length || 0}</span>
          </span>
        </div>

        {/* Список гранат по типам */}
        {Object.entries(lineupsByType).map(([grenadeType, lineups]) => {
          const Icon = grenadeIcons[grenadeType] || Cloud
          const colorClass = grenadeColors[grenadeType] || grenadeColors.SMOKE

          return (
            <div key={grenadeType} className="space-y-3">
              {/* Заголовок типа гранаты */}
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${colorClass}`}>
                <Icon className="w-5 h-5" />
                <span className="font-semibold">{grenadeType}</span>
                <span className="ml-auto text-sm opacity-75">{lineups.length}</span>
              </div>

              {/* Список лайнапов */}
              <div className="space-y-2">
                {lineups.map((lineup) => (
                  <button
                    key={lineup.id}
                    onClick={() => onLineupClick?.(lineup)}
                    className="w-full p-3 bg-gray-800/50 hover:bg-gray-800 rounded-lg border border-gray-700 transition-all text-left group"
                  >
                    <div className="flex items-start gap-3">
                      {/* Превью */}
                      {lineup.thumbnailUrl ? (
                        <div className="relative w-20 h-12 rounded overflow-hidden flex-shrink-0 bg-gray-900">
                          <Image
                            src={lineup.thumbnailUrl}
                            alt={lineup.title}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                          {lineup.videoPath && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                              <Video className="w-5 h-5 text-white" />
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="w-20 h-12 rounded bg-gray-900 flex items-center justify-center flex-shrink-0">
                          <Icon className="w-6 h-6 opacity-50" />
                        </div>
                      )}

                      {/* Информация */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-white font-medium text-sm truncate group-hover:text-blue-400 transition-colors">
                          {lineup.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          {/* Сторона */}
                          <span className={`text-xs px-1.5 py-0.5 rounded border ${sideColors[lineup.side] || sideColors.BOTH}`}>
                            {lineup.side}
                          </span>
                          {/* Сложность */}
                          <span className={`text-xs ${difficultyColors[lineup.difficulty] || difficultyColors.MEDIUM}`}>
                            {lineup.difficulty}
                          </span>
                          {/* Просмотры */}
                          {lineup.views > 0 && (
                            <span className="text-xs text-gray-500">
                              👁 {lineup.views}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Стрелочка */}
                      <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-white transition-colors flex-shrink-0" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )
        })}

        {/* Если нет гранат */}
        {(!position.lineups || position.lineups.length === 0) && (
          <div className="text-center py-12">
            <Cloud className="w-16 h-16 text-gray-700 mx-auto mb-4" />
            <p className="text-gray-400">Пока нет гранат для этой позиции</p>
            <p className="text-gray-500 text-sm mt-1">Будьте первыми, кто добавит лайнап!</p>
          </div>
        )}
      </div>
    </div>
  )
}
