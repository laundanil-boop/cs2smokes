import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatGrenadeType(type: string): string {
  const types: Record<string, string> = {
    SMOKE: 'Smoke',
    MOLOTOV: 'Molotov',
    FLASH: 'Flash',
    HE: 'HE Grenade',
  }
  return types[type] || type
}

export function getGrenadeColor(type: string): string {
  const colors: Record<string, string> = {
    SMOKE: 'text-cs2-smoke',
    MOLOTOV: 'text-cs2-molotov',
    FLASH: 'text-cs2-flash',
    HE: 'text-cs2-he',
  }
  return colors[type] || 'text-gray-400'
}

export function getGrenadeBgColor(type: string): string {
  const colors: Record<string, string> = {
    SMOKE: 'bg-cs2-smoke',
    MOLOTOV: 'bg-cs2-molotov',
    FLASH: 'bg-cs2-flash',
    HE: 'bg-cs2-he',
  }
  return colors[type] || 'bg-gray-400'
}

export function formatSide(side: string): string {
  const sides: Record<string, string> = {
    CT: 'Counter-Terrorist',
    T: 'Terrorist',
    BOTH: 'Both Sides',
  }
  return sides[side] || side
}

export function getSideColor(side: string): string {
  const colors: Record<string, string> = {
    CT: 'text-cs2-ct',
    T: 'text-cs2-t',
    BOTH: 'text-gray-400',
  }
  return colors[side] || 'text-gray-400'
}

export function formatDifficulty(difficulty: string): string {
  const difficulties: Record<string, string> = {
    EASY: 'Easy',
    MEDIUM: 'Medium',
    HARD: 'Hard',
  }
  return difficulties[difficulty] || difficulty
}

export function getDifficultyColor(difficulty: string): string {
  const colors: Record<string, string> = {
    EASY: 'text-green-500',
    MEDIUM: 'text-yellow-500',
    HARD: 'text-red-500',
  }
  return colors[difficulty] || 'text-gray-400'
}

export function getYouTubeThumbnail(youtubeId: string): string {
  return `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`
}

export function getVideoThumbnail(videoPath: string | null): string {
  if (!videoPath) return '/images/placeholder-video.jpg'
  // Для локальных видео используем placeholder с градиентом
  return '/images/video-placeholder.jpg'
}

export function timeAgo(date: Date): string {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return 'just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
  return date.toLocaleDateString()
}
