import Link from 'next/link'
import Image from 'next/image'
import { Heart, Eye, MessageSquare, MapPin, Clock, PlayCircle, Crown } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Lineup } from '@/types'
import {
  getGrenadeBgColor,
  getGrenadeColor,
  formatGrenadeType,
  formatSide,
  getSideColor,
  formatDifficulty,
  getDifficultyColor,
  getYouTubeThumbnail,
  timeAgo,
  cn,
} from '@/lib/utils'

interface LineupCardProps {
  lineup: Lineup
  showFavorite?: boolean
  onToggleFavorite?: (id: string) => void
}

export function LineupCard({ lineup, showFavorite = false, onToggleFavorite }: LineupCardProps) {
  const hasVideo = !!lineup.videoPath
  const thumbnailSrc = hasVideo
    ? null
    : lineup.youtubeId
      ? getYouTubeThumbnail(lineup.youtubeId)
      : null

  return (
    <Card className="group overflow-hidden bg-cs2-gray border-cs2-light card-hover">
      <div className="relative aspect-video overflow-hidden bg-cs2-darker">
        {thumbnailSrc ? (
          <Image
            src={thumbnailSrc}
            alt={lineup.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-cs2-accent/20 to-cs2-darker">
            <PlayCircle className="h-16 w-16 text-cs2-accent/50" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-cs2-darker/80 to-transparent" />
        
        {/* Grenade type badge */}
        <div className={cn(
          'absolute top-2 left-2 px-2 py-1 rounded text-xs font-medium text-white',
          getGrenadeBgColor(lineup.grenadeType)
        )}>
          {formatGrenadeType(lineup.grenadeType)}
        </div>

        {/* Side badge */}
        <div className={cn(
          'absolute top-2 right-2 px-2 py-1 rounded text-xs font-medium',
          getSideColor(lineup.side),
          lineup.side === 'CT' ? 'bg-cs2-ct/20' : lineup.side === 'T' ? 'bg-cs2-t/20' : 'bg-gray-500/20'
        )}>
          {lineup.side}
        </div>

        {/* Difficulty indicator */}
        <div className="absolute bottom-2 left-2 flex items-center gap-1">
          <div className={cn('w-2 h-2 rounded-full',
            lineup.difficulty === 'EASY' ? 'bg-green-500' :
            lineup.difficulty === 'MEDIUM' ? 'bg-yellow-500' : 'bg-red-500'
          )} />
          <span className="text-xs text-white/80">{formatDifficulty(lineup.difficulty)}</span>
        </div>

        {/* Premium badge */}
        {lineup.isPremium && (
          <div className="absolute bottom-2 right-2 px-2 py-1 rounded text-xs font-medium bg-gradient-to-r from-yellow-500 to-yellow-600 text-black flex items-center gap-1">
            <Crown className="h-3 w-3" />
            Premium
          </div>
        )}

        {/* Favorite button */}
        {showFavorite && onToggleFavorite && (
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              'absolute bottom-2 right-2 h-8 w-8 rounded-full bg-black/50 hover:bg-black/70',
              lineup.isFavorite ? 'text-red-500' : 'text-white'
            )}
            onClick={(e) => {
              e.preventDefault()
              onToggleFavorite(lineup.id)
            }}
          >
            <Heart className={cn('h-4 w-4', lineup.isFavorite && 'fill-current')} />
          </Button>
        )}
      </div>

      <CardContent className="p-4 space-y-3">
        <Link href={`/lineups/${lineup.id}`}>
          <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-cs2-accent transition-colors">
            {lineup.title}
          </h3>
        </Link>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3" />
          <span>{lineup.map.displayName}</span>
        </div>

        {lineup.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {lineup.description}
          </p>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-cs2-light">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {lineup.views}
            </span>
            <span className="flex items-center gap-1">
              <MessageSquare className="h-3 w-3" />
              {lineup._count?.comments ?? 0}
            </span>
          </div>
          <span className="text-xs text-muted-foreground">
            {timeAgo(new Date(lineup.createdAt))}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
