'use client'

import { cn } from '@/lib/utils'
import { Flame } from 'lucide-react'

interface HeatScoreProps {
  score: number // 0-10
  showLabel?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

function getHeatColor(score: number): string {
  if (score >= 8) return 'text-red-500'
  if (score >= 6) return 'text-orange-500'
  if (score >= 4) return 'text-yellow-500'
  return 'text-gray-400'
}

function getHeatBg(score: number): string {
  if (score >= 8) return 'bg-red-100'
  if (score >= 6) return 'bg-orange-100'
  if (score >= 4) return 'bg-yellow-100'
  return 'bg-gray-100'
}

function getHeatBarColor(score: number): string {
  if (score >= 8) return 'bg-gradient-to-r from-orange-500 to-red-500'
  if (score >= 6) return 'bg-gradient-to-r from-yellow-500 to-orange-500'
  if (score >= 4) return 'bg-gradient-to-r from-green-400 to-yellow-500'
  return 'bg-gray-300'
}

const sizeConfig = {
  sm: { icon: 14, text: 'text-xs', padding: 'px-2 py-0.5' },
  md: { icon: 16, text: 'text-sm', padding: 'px-2.5 py-1' },
  lg: { icon: 20, text: 'text-base', padding: 'px-3 py-1.5' },
}

export function HeatScore({
  score,
  showLabel = true,
  size = 'md',
  className,
}: HeatScoreProps) {
  const config = sizeConfig[size]
  const normalizedScore = Math.min(Math.max(score, 0), 10)

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium',
        getHeatBg(normalizedScore),
        config.padding,
        config.text,
        className
      )}
    >
      <Flame size={config.icon} className={getHeatColor(normalizedScore)} />
      <span className={getHeatColor(normalizedScore)}>
        {normalizedScore.toFixed(1)}
      </span>
      {showLabel && (
        <span className="text-muted-foreground">/10</span>
      )}
    </span>
  )
}

// Gauge visualization variant
interface HeatGaugeProps {
  score: number
  className?: string
}

export function HeatGauge({ score, className }: HeatGaugeProps) {
  const normalizedScore = Math.min(Math.max(score, 0), 10)
  const percentage = normalizedScore * 10

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Flame size={18} className={getHeatColor(normalizedScore)} />
          <span className="text-sm font-medium">Heat Score</span>
        </div>
        <span className={cn('text-lg font-bold', getHeatColor(normalizedScore))}>
          {normalizedScore.toFixed(1)}
        </span>
      </div>
      <div className="h-3 bg-muted rounded-full overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500',
            getHeatBarColor(normalizedScore)
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Нисък</span>
        <span>Висок</span>
      </div>
    </div>
  )
}
