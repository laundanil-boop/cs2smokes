export interface LineupPosition {
  id: string
  name: string
  mapId: string
  map: {
    name: string
    displayName: string
    imageUrl: string | null
  }
  imageUrl: string | null
  positionX: number
  positionY: number
  description: string | null
  createdAt: Date
  updatedAt: Date
  _count?: {
    lineups: number
  }
  lineups?: Lineup[]
}

export interface Lineup {
  id: string
  title: string
  description: string | null
  mapId: string
  map: {
    name: string
    displayName: string
    imageUrl: string | null
  }
  positionId: string | null
  position?: LineupPosition | null
  grenadeType: string
  side: string
  youtubeId: string | null
  videoPath: string | null
  thumbnailUrl: string | null
  throwPosition?: any
  steps?: any
  difficulty: string
  views: number
  isUserGenerated: boolean
  isPremium: boolean
  moderationStatus?: string // PENDING, APPROVED, REJECTED
  rejectionReason?: string | null
  userId: string
  user: {
    username: string
    avatar: string | null
  }
  createdAt: Date
  updatedAt: Date
  _count?: {
    favorites: number
    comments?: number
  }
  isFavorite?: boolean
  tags?: { tagId: string; lineupId: string; tag?: { name: string; id: string } }[]
}

export interface Map {
  id: string
  name: string
  displayName: string
  imageUrl: string | null
  description: string | null
  _count?: {
    lineups: number
  }
}

export interface User {
  id: string
  email: string
  username: string
  avatar: string | null
  role?: string
  createdAt: Date
  premium?: {
    isActive: boolean
    expiresAt: Date | null
    isLifetime: boolean
  } | null
}

export interface Comment {
  id: string
  content: string
  userId: string
  lineupId: string
  user: {
    username: string
    avatar: string | null
  }
  createdAt: Date
  updatedAt: Date
}

export type GrenadeType = 'SMOKE' | 'MOLOTOV' | 'FLASH' | 'HE'
export type Side = 'CT' | 'T' | 'BOTH'
export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD'

export type GrenadeTypeFilter = GrenadeType | 'ALL'
export type SideFilter = Side | 'ALL'
export type DifficultyFilter = Difficulty | 'ALL'

export interface LineupFilters {
  grenadeType?: GrenadeTypeFilter
  side?: SideFilter
  difficulty?: DifficultyFilter
  search?: string
  map?: string
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}
