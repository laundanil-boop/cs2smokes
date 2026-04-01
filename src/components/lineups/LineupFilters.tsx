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
import { Input } from '@/components/ui/input'
import { GrenadeTypeFilter, SideFilter, DifficultyFilter } from '@/types'
import { cn } from '@/lib/utils'

interface LineupFiltersProps {
  grenadeType: GrenadeTypeFilter
  side: SideFilter
  difficulty: DifficultyFilter
  search: string
  onGrenadeTypeChange: (value: GrenadeTypeFilter) => void
  onSideChange: (value: SideFilter) => void
  onDifficultyChange: (value: DifficultyFilter) => void
  onSearchChange: (value: string) => void
  onReset: () => void
}

export function LineupFilters({
  grenadeType,
  side,
  difficulty,
  search,
  onGrenadeTypeChange,
  onSideChange,
  onDifficultyChange,
  onSearchChange,
  onReset,
}: LineupFiltersProps) {
  const hasActiveFilters = grenadeType !== 'ALL' || side !== 'ALL' || difficulty !== 'ALL' || search

  return (
    <div className="space-y-4 p-4 bg-cs2-gray rounded-lg border border-cs2-light">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-cs2-accent" />
          <h3 className="font-semibold">Фильтры</h3>
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="space-y-2">
          <label className="text-sm text-muted-foreground">Тип гранаты</label>
          <Select value={grenadeType} onValueChange={onGrenadeTypeChange}>
            <SelectTrigger className="bg-cs2-light border-cs2-gray">
              <SelectValue placeholder="Все типы" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Все типы</SelectItem>
              <SelectItem value="SMOKE">Smoke</SelectItem>
              <SelectItem value="MOLOTOV">Molotov</SelectItem>
              <SelectItem value="FLASH">Flash</SelectItem>
              <SelectItem value="HE">HE Grenade</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm text-muted-foreground">Сторона</label>
          <Select value={side} onValueChange={onSideChange}>
            <SelectTrigger className="bg-cs2-light border-cs2-gray">
              <SelectValue placeholder="Все стороны" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Все стороны</SelectItem>
              <SelectItem value="T">Terrorist</SelectItem>
              <SelectItem value="CT">Counter-Terrorist</SelectItem>
              <SelectItem value="BOTH">Обе стороны</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm text-muted-foreground">Сложность</label>
          <Select value={difficulty} onValueChange={onDifficultyChange}>
            <SelectTrigger className="bg-cs2-light border-cs2-gray">
              <SelectValue placeholder="Любая сложность" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Любая сложность</SelectItem>
              <SelectItem value="EASY">Легко</SelectItem>
              <SelectItem value="MEDIUM">Средне</SelectItem>
              <SelectItem value="HARD">Сложно</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm text-muted-foreground">Поиск</label>
          <Input
            type="text"
            placeholder="Название..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="bg-cs2-light border-cs2-gray"
          />
        </div>
      </div>
    </div>
  )
}
