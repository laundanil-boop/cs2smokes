'use client'

import { Filter, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { GrenadeTypeFilter, SideFilter, DifficultyFilter } from '@/types'
import { cn } from '@/lib/utils'

interface LineupFiltersProps {
  grenadeType: GrenadeTypeFilter
  side: SideFilter
  difficulty: DifficultyFilter
  onGrenadeTypeChange: (value: GrenadeTypeFilter) => void
  onSideChange: (value: SideFilter) => void
  onDifficultyChange: (value: DifficultyFilter) => void
  onReset: () => void
}

export function LineupFilters({
  grenadeType,
  side,
  difficulty,
  onGrenadeTypeChange,
  onSideChange,
  onDifficultyChange,
  onReset,
}: LineupFiltersProps) {
  const hasActiveFilters = grenadeType !== 'ALL' || side !== 'ALL' || difficulty !== 'ALL'

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2 bg-cs2-gray rounded-lg p-2">
        <Filter className="h-4 w-4 text-cs2-accent" />
        <Select value={grenadeType} onValueChange={onGrenadeTypeChange}>
          <SelectTrigger className="bg-cs2-light border-cs2-gray h-8 text-sm">
            <SelectValue placeholder="Тип гранаты" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Все типы</SelectItem>
            <SelectItem value="SMOKE">Smoke</SelectItem>
            <SelectItem value="MOLOTOV">Molotov</SelectItem>
            <SelectItem value="FLASH">Flash</SelectItem>
            <SelectItem value="HE">HE Grenade</SelectItem>
          </SelectContent>
        </Select>

        <Select value={side} onValueChange={onSideChange}>
          <SelectTrigger className="bg-cs2-light border-cs2-gray h-8 text-sm">
            <SelectValue placeholder="Сторона" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Все стороны</SelectItem>
            <SelectItem value="T">Terrorist</SelectItem>
            <SelectItem value="CT">Counter-Terrorist</SelectItem>
            <SelectItem value="BOTH">Обе стороны</SelectItem>
          </SelectContent>
        </Select>

        <Select value={difficulty} onValueChange={onDifficultyChange}>
          <SelectTrigger className="bg-cs2-light border-cs2-gray h-8 text-sm">
            <SelectValue placeholder="Сложность" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Любая сложность</SelectItem>
            <SelectItem value="EASY">Легко</SelectItem>
            <SelectItem value="MEDIUM">Средне</SelectItem>
            <SelectItem value="HARD">Сложно</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onReset}
          className="text-muted-foreground hover:text-white"
        >
          <X className="h-4 w-4 mr-1" />
          Сбросить
        </Button>
      )}
    </div>
  )
}
