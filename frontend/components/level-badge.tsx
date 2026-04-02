'use client'

import { cn } from '@/lib/utils'
import { type UserLevel, levelLabels } from '@/lib/mock-data'
import { Eye, Zap, Crown } from 'lucide-react'

interface LevelBadgeProps {
  level: UserLevel
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  className?: string
}

const levelConfig: Record<UserLevel, { 
  icon: React.ElementType
  bg: string
  text: string
  border: string
  glow?: string
}> = {
  1: { 
    icon: Eye, 
    bg: 'bg-gray-100', 
    text: 'text-gray-700', 
    border: 'border-gray-200' 
  },
  2: { 
    icon: Zap, 
    bg: 'bg-blue-100', 
    text: 'text-blue-700', 
    border: 'border-blue-200' 
  },
  3: { 
    icon: Crown, 
    bg: 'bg-gradient-to-r from-lime/20 to-yellow-100', 
    text: 'text-forest', 
    border: 'border-lime/50',
    glow: 'shadow-[0_0_12px_rgba(122,230,83,0.3)]'
  },
}

const sizeConfig = {
  sm: { icon: 12, padding: 'px-2 py-0.5', text: 'text-xs', iconPadding: 'p-0.5' },
  md: { icon: 14, padding: 'px-2.5 py-1', text: 'text-sm', iconPadding: 'p-1' },
  lg: { icon: 18, padding: 'px-3 py-1.5', text: 'text-base', iconPadding: 'p-1.5' },
}

export function LevelBadge({
  level,
  size = 'md',
  showLabel = true,
  className,
}: LevelBadgeProps) {
  const config = levelConfig[level]
  const sizes = sizeConfig[size]
  const Icon = config.icon

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border font-medium',
        config.bg,
        config.text,
        config.border,
        config.glow,
        sizes.padding,
        sizes.text,
        className
      )}
    >
      <Icon size={sizes.icon} />
      {showLabel && <span>{levelLabels[level]}</span>}
    </span>
  )
}

// Large level card for profile
interface LevelCardProps {
  level: UserLevel
  points: number
  className?: string
}

export function LevelCard({ level, points, className }: LevelCardProps) {
  const config = levelConfig[level]
  const Icon = config.icon
  
  // Calculate progress to next level
  const levelThresholds = { 1: 0, 2: 200, 3: 500 }
  const nextLevel = level < 3 ? (level + 1) as UserLevel : 3
  const currentThreshold = levelThresholds[level]
  const nextThreshold = levelThresholds[nextLevel]
  const progress = level === 3 
    ? 100 
    : Math.min(((points - currentThreshold) / (nextThreshold - currentThreshold)) * 100, 100)
  const pointsToNext = level === 3 ? 0 : nextThreshold - points

  return (
    <div className={cn(
      'p-6 rounded-2xl border-2',
      config.bg,
      config.border,
      config.glow,
      className
    )}>
      <div className="flex items-center gap-4 mb-4">
        <div className={cn(
          'p-4 rounded-xl',
          level === 3 ? 'bg-gradient-to-br from-lime to-green-400' : 'bg-white/80'
        )}>
          <Icon size={32} className={level === 3 ? 'text-forest' : config.text} />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Текущо ниво</p>
          <h3 className={cn('text-xl font-heading font-bold', config.text)}>
            {levelLabels[level]}
          </h3>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="font-medium">{points} точки</span>
          {level < 3 && (
            <span className="text-muted-foreground">
              {pointsToNext} до {levelLabels[nextLevel]}
            </span>
          )}
        </div>
        <div className="h-2 bg-white/50 rounded-full overflow-hidden">
          <div 
            className="h-full bg-forest rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  )
}
