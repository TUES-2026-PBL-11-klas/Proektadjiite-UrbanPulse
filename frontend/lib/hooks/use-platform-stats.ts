'use client'

import { useState, useEffect } from 'react'
import { apiGet } from '@/lib/api'

export interface PlatformStats {
  total_reports: number
  total_users: number
  resolved_percentage: number
  weekly_trend_pct: number | null
}

interface UsePlatformStatsResult {
  stats: PlatformStats | null
  isLoading: boolean
  error: string | null
}

export function usePlatformStats(): UsePlatformStatsResult {
  const [stats, setStats] = useState<PlatformStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    apiGet<PlatformStats>('/api/stats')
      .then(setStats)
      .catch((err: Error) => setError(err.message))
      .finally(() => setIsLoading(false))
  }, [])

  return { stats, isLoading, error }
}
