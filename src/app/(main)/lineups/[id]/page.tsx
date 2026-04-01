'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowLeft,
  Heart,
  Eye,
  MessageSquare,
  Share2,
  MapPin,
  Clock,
  Star,
  Copy,
  Check,
  ExternalLink,
  Loader2,
  Crown,
  Lock,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { VideoPlayer } from '@/components/lineups/VideoPlayer'
import { Lineup } from '@/types'
import { usePremium } from '@/hooks/usePremium'
import {
  getGrenadeBgColor,
  formatGrenadeType,
  formatSide,
  getSideColor,
  formatDifficulty,
  getDifficultyColor,
  getYouTubeThumbnail,
  timeAgo,
  cn,
} from '@/lib/utils'

export default function LineupPage() {
  const params = useParams()
  const router = useRouter()
  const lineupId = params.id as string
  const { hasPremium, loading: premiumLoading } = usePremium()

  const [lineup, setLineup] = useState<Lineup | null>(null)
  const [loading, setLoading] = useState(true)
  const [isFavorite, setIsFavorite] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    async function fetchLineup() {
      try {
        const response = await fetch(`/api/lineups/${lineupId}`)
        const result = await response.json()

        if (result.success) {
          setLineup(result.data)
          setIsFavorite(result.data.isFavorite)
        } else {
          router.push('/maps')
        }
      } catch (error) {
        console.error('Error fetching lineup:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchLineup()
  }, [lineupId, router])

  const handleToggleFavorite = async () => {
    try {
      const response = await fetch('/api/user/favorites', {
        method: isFavorite ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lineupId }),
      })

      if (response.ok) {
        setIsFavorite(!isFavorite)
        setLineup(prev => prev ? {
          ...prev,
          _count: {
            ...prev._count,
            favorites: (prev._count?.favorites ?? 0) + (isFavorite ? -1 : 1)
          }
        } : null)
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
    }
  }

  const handleShare = async () => {
    const url = window.location.href
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Error copying URL:', error)
    }
  }

  if (loading || premiumLoading) {
    return (
      <div className="container py-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-cs2-accent" />
      </div>
    )
  }

  if (!lineup) {
    return null
  }

  // Проверка Premium доступа
  if (lineup.isPremium && !hasPremium) {
    return (
      <div className="container py-8">
        <div className="mb-6">
          <Link href={`/maps/${lineup.map.name}`}>
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Назад к {lineup.map.displayName}
            </Button>
          </Link>
        </div>
        <div className="max-w-2xl mx-auto text-center py-16">
          <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-yellow-500/20 mb-6">
            <Lock className="h-10 w-10 text-yellow-500" />
          </div>
          <h1 className="text-3xl font-bold mb-4">Premium контент</h1>
          <p className="text-muted-foreground mb-6">
            Этот лайнап доступен только для пользователей с Premium подпиской
          </p>
          <Button
            className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold h-12 px-8"
            onClick={() => router.push('/profile?tab=premium')}
          >
            <Crown className="h-5 w-5 mr-2" />
            Оформить Premium за 69 ₽
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="mb-6">
        <Link href={`/maps/${lineup.map.name}`}>
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Назад к {lineup.map.displayName}
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content - Video and instructions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Video Player */}
          <div className="rounded-xl overflow-hidden border border-cs2-light bg-cs2-gray">
            <VideoPlayer youtubeId={lineup.youtubeId} videoPath={lineup.videoPath} title={lineup.title} />
          </div>

          {/* Title and actions */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">{lineup.title}</h1>
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {lineup.map.displayName}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {timeAgo(new Date(lineup.createdAt))}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  {lineup.views} просмотров
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant={isFavorite ? 'default' : 'outline'}
                size="icon"
                onClick={handleToggleFavorite}
                className={cn(isFavorite && 'bg-red-500 hover:bg-red-600')}
              >
                <Heart className={cn('h-5 w-5', isFavorite && 'fill-current')} />
              </Button>
              <Button variant="outline" size="icon" onClick={handleShare}>
                {copied ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <Share2 className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            <span className={cn(
              'px-3 py-1 rounded-full text-sm font-medium text-white',
              getGrenadeBgColor(lineup.grenadeType)
            )}>
              {formatGrenadeType(lineup.grenadeType)}
            </span>
            <span className={cn(
              'px-3 py-1 rounded-full text-sm font-medium',
              getSideColor(lineup.side),
              lineup.side === 'CT' ? 'bg-cs2-ct/20' : lineup.side === 'T' ? 'bg-cs2-t/20' : 'bg-gray-500/20'
            )}>
              {formatSide(lineup.side)}
            </span>
            <span className={cn(
              'px-3 py-1 rounded-full text-sm font-medium',
              getDifficultyColor(lineup.difficulty),
              lineup.difficulty === 'EASY' ? 'bg-green-500/20' :
              lineup.difficulty === 'MEDIUM' ? 'bg-yellow-500/20' : 'bg-red-500/20'
            )}>
              {formatDifficulty(lineup.difficulty)}
            </span>
            {lineup.isPremium && (
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-yellow-500 to-yellow-600 text-black flex items-center gap-1">
                <Crown className="h-4 w-4" />
                Premium
              </span>
            )}
          </div>

          {/* Description */}
          {lineup.description && (
            <div className="p-4 rounded-lg bg-cs2-gray border border-cs2-light">
              <h3 className="font-semibold mb-2">Описание</h3>
              <p className="text-muted-foreground">{lineup.description}</p>
            </div>
          )}

          {/* Instructions */}
          {lineup.steps && Array.isArray(lineup.steps) && lineup.steps.length > 0 && (
            <div className="p-4 rounded-lg bg-cs2-gray border border-cs2-light">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Star className="h-5 w-5 text-cs2-accent" />
                Инструкция
              </h3>
              <div className="space-y-4">
                {lineup.steps.map((step: any, index: number) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-cs2-accent flex items-center justify-center text-white font-bold text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1 pt-1">
                      <p className="text-muted-foreground">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {lineup.tags && lineup.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {lineup.tags.map((item) => (
                item.tag && (
                  <span
                    key={item.tagId}
                    className="px-3 py-1 rounded-full text-xs font-medium bg-cs2-light text-muted-foreground"
                  >
                    #{item.tag.name}
                  </span>
                )
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Map info card */}
          <div className="p-4 rounded-lg bg-cs2-gray border border-cs2-light">
            <h3 className="font-semibold mb-4">Информация о карте</h3>
            <div className="relative aspect-video rounded-md overflow-hidden mb-4">
              <Image
                src={`/images/maps/${lineup.map.name}.jpg` || '/images/maps/placeholder.jpg'}
                alt={lineup.map.displayName}
                fill
                className="object-cover"
              />
            </div>
            <Link href={`/maps/${lineup.map.name}`}>
              <Button variant="outline" className="w-full">
                Все лайнапы на {lineup.map.displayName}
              </Button>
            </Link>
          </div>

          {/* Author info */}
          <div className="p-4 rounded-lg bg-cs2-gray border border-cs2-light">
            <h3 className="font-semibold mb-4">Автор</h3>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-cs2-accent flex items-center justify-center">
                <span className="text-white font-bold">
                  {lineup.user.username[0].toUpperCase()}
                </span>
              </div>
              <div>
                <p className="font-medium">{lineup.user.username}</p>
                <p className="text-sm text-muted-foreground">
                  {lineup._count?.favorites ?? 0} избранных
                </p>
              </div>
            </div>
          </div>

          {/* YouTube link */}
          {lineup.youtubeId && (
            <div className="p-4 rounded-lg bg-cs2-gray border border-cs2-light">
              <h3 className="font-semibold mb-4">Оригинальное видео</h3>
              <a
                href={`https://www.youtube.com/watch?v=${lineup.youtubeId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-cs2-accent hover:underline"
              >
                <ExternalLink className="h-4 w-4" />
                Открыть на YouTube
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
