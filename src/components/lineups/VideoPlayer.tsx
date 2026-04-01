'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { Skeleton } from '@/components/ui/skeleton'

const ReactPlayer = dynamic(() => import('react-player/youtube'), {
  ssr: false,
  loading: () => <Skeleton className="w-full aspect-video" />,
})

interface VideoPlayerProps {
  youtubeId?: string | null
  videoPath?: string | null
  title: string
}

export function VideoPlayer({ youtubeId, videoPath, title }: VideoPlayerProps) {
  const [isLoading, setIsLoading] = useState(true)

  // Если есть видеофайл
  if (videoPath) {
    return (
      <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-black">
        {isLoading && (
          <Skeleton className="absolute inset-0 w-full h-full" />
        )}
        <video
          src={videoPath}
          controls
          className="w-full h-full"
          onLoadedData={() => setIsLoading(false)}
        />
      </div>
    )
  }

  // Если есть YouTube ID
  if (youtubeId) {
    return (
      <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-black">
        <ReactPlayer
          url={`https://www.youtube.com/watch?v=${youtubeId}`}
          width="100%"
          height="100%"
          controls
        />
      </div>
    )
  }

  return null
}
