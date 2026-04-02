'use client'

import { cn } from '@/lib/utils'
import { type ReportCategory, categoryLabels } from '@/lib/mock-data'
import { Trash2, Wind, Droplets, Package, Volume2, AlertTriangle } from 'lucide-react'

interface CategoryIconProps {
  category: ReportCategory
  showLabel?: boolean
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'muted' | 'solid'
  className?: string
}

const iconComponents: Record<ReportCategory, React.ElementType> = {
  illegal_dump: Trash2,
  air_pollution: Wind,
  water_pollution: Droplets,
  broken_container: Package,
  noise_pollution: Volume2,
  other: AlertTriangle,
}

const categoryColors: Record<ReportCategory, { bg: string; text: string; solid: string }> = {
  illegal_dump: { bg: 'bg-orange-100', text: 'text-orange-600', solid: 'bg-orange-500 text-white' },
  air_pollution: { bg: 'bg-slate-100', text: 'text-slate-600', solid: 'bg-slate-500 text-white' },
  water_pollution: { bg: 'bg-cyan-100', text: 'text-cyan-600', solid: 'bg-cyan-500 text-white' },
  broken_container: { bg: 'bg-amber-100', text: 'text-amber-600', solid: 'bg-amber-500 text-white' },
  noise_pollution: { bg: 'bg-purple-100', text: 'text-purple-600', solid: 'bg-purple-500 text-white' },
  other: { bg: 'bg-gray-100', text: 'text-gray-600', solid: 'bg-gray-500 text-white' },
}

const sizeConfig = {
  sm: { icon: 14, padding: 'p-1.5', text: 'text-xs' },
  md: { icon: 18, padding: 'p-2', text: 'text-sm' },
  lg: { icon: 24, padding: 'p-3', text: 'text-base' },
}

export function CategoryIcon({
  category,
  showLabel = false,
  size = 'md',
  variant = 'default',
  className,
}: CategoryIconProps) {
  const Icon = iconComponents[category]
  const colors = categoryColors[category]
  const config = sizeConfig[size]

  const containerClasses = cn(
    'inline-flex items-center gap-2',
    className
  )

  const iconWrapperClasses = cn(
    'rounded-lg flex items-center justify-center',
    config.padding,
    variant === 'solid' ? colors.solid : colors.bg
  )

  const iconClasses = cn(
    variant === 'solid' ? '' : colors.text
  )

  return (
    <span className={containerClasses}>
      <span className={iconWrapperClasses}>
        <Icon size={config.icon} className={iconClasses} />
      </span>
      {showLabel && (
        <span className={cn('font-medium', config.text, colors.text)}>
          {categoryLabels[category]}
        </span>
      )}
    </span>
  )
}

// Card variant for selection grid
interface CategoryCardProps {
  category: ReportCategory
  selected?: boolean
  onClick?: () => void
  className?: string
}

export function CategoryCard({
  category,
  selected = false,
  onClick,
  className,
}: CategoryCardProps) {
  const Icon = iconComponents[category]
  const colors = categoryColors[category]

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all duration-200',
        'hover:scale-[1.02] hover:shadow-md',
        selected 
          ? 'border-forest bg-forest/5 shadow-md' 
          : 'border-border bg-card hover:border-forest/30',
        className
      )}
    >
      <span className={cn('p-3 rounded-lg', selected ? colors.solid : colors.bg)}>
        <Icon size={28} className={selected ? '' : colors.text} />
      </span>
      <span className={cn(
        'text-sm font-medium text-center',
        selected ? 'text-forest' : 'text-foreground'
      )}>
        {categoryLabels[category]}
      </span>
    </button>
  )
}
