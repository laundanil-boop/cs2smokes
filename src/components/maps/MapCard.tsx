import Link from 'next/link'
import Image from 'next/image'
import { MapPin } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import type { Map as GameMap } from '@/types'
import { cn } from '@/lib/utils'

interface MapCardProps {
  map: GameMap
  variant?: 'default' | 'compact'
}

const mapImages: Record<string, string> = {
  mirage: '/images/maps/mirage.jpg',
  dust2: '/images/maps/dust2.jpg',
  inferno: '/images/maps/inferno.jpg',
  nuke: '/images/maps/nuke.jpg',
  overpass: '/images/maps/overpass.jpg',
  ancient: '/images/maps/ancient.jpg',
  anubis: '/images/maps/anubis.jpg',
}

export function MapCard({ map, variant = 'default' }: MapCardProps) {
  if (variant === 'compact') {
    return (
      <Link href={`/maps/${map.name}`}>
        <Card className="group overflow-hidden bg-cs2-gray border-cs2-light card-hover">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="relative h-16 w-24 rounded-md overflow-hidden flex-shrink-0 map-placeholder">
              <Image
                src={map.imageUrl || mapImages[map.name] || '/images/maps/placeholder.jpg'}
                alt={map.displayName}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold group-hover:text-cs2-accent transition-colors truncate">
                {map.displayName}
              </h3>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {map._count?.lineups ?? 0} лайнапов
              </p>
            </div>
          </CardContent>
        </Card>
      </Link>
    )
  }

  return (
    <Link href={`/maps/${map.name}`}>
      <Card className="group overflow-hidden bg-cs2-gray border-cs2-light card-hover h-full">
        <div className="relative aspect-[16/10] overflow-hidden">
          <Image
            src={map.imageUrl || mapImages[map.name] || '/images/maps/placeholder.jpg'}
            alt={map.displayName}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-cs2-darker via-cs2-darker/50 to-transparent" />

          <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
            <h3 className="text-base sm:text-xl font-bold text-white group-hover:text-cs2-accent transition-colors line-clamp-2">
              {map.displayName}
            </h3>
            <div className="flex items-center gap-1 sm:gap-2 mt-1 sm:mt-2 text-xs sm:text-sm text-white/80">
              <MapPin className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
              <span>{map._count?.lineups ?? 0} лайнапов</span>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  )
}
