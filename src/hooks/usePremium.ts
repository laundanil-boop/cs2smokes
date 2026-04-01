'use client'

import { useEffect, useState } from 'react'

interface PremiumStatus {
  isActive: boolean
  expiresAt: Date | null
  isLifetime: boolean
}

export function usePremium() {
  const [premium, setPremium] = useState<PremiumStatus | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchPremiumStatus() {
      try {
        const response = await fetch('/api/user/premium')
        const result = await response.json()
        if (result.success) {
          setPremium(result.data)
        }
      } catch (error) {
        console.error('Error fetching premium status:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPremiumStatus()
  }, [])

  return { premium, loading, hasPremium: premium?.isActive ?? false }
}
