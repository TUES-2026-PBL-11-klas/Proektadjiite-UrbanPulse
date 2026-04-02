'use client'

import { cn } from '@/lib/utils'
import { type ReportStatus, statusLabels } from '@/lib/mock-data'

interface StatusBadgeProps {
  status: ReportStatus
  size?: 'sm' | 'md' | 'lg'
  showDot?: boolean
  className?: string
}

const statusStyles: Record<ReportStatus, string> = {
  submitted: 'bg-amber-100 text-amber-800 border-amber-200',
  in_progress: 'bg-blue-100 text-blue-800 border-blue-200',
  resolved: 'bg-green-100 text-green-800 border-green-200',
  archived: 'bg-gray-100 text-gray-600 border-gray-200',
}

const dotStyles: Record<ReportStatus, string> = {
  submitted: 'bg-amber-500',
  in_progress: 'bg-blue-500',
  resolved: 'bg-green-500',
  archived: 'bg-gray-400',
}

const sizeStyles = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
  lg: 'px-3 py-1.5 text-base',
}

export function StatusBadge({ 
  status, 
  size = 'md', 
  showDot = true,
  className 
}: StatusBadgeProps) {
  return (
    <span 
      className={cn(
        'inline-flex items-center gap-1.5 font-medium rounded-full border',
        statusStyles[status],
        sizeStyles[size],
        className
      )}
    >
      {showDot && (
        <span className={cn('w-1.5 h-1.5 rounded-full animate-pulse', dotStyles[status])} />
      )}
      {statusLabels[status]}
    </span>
  )
}
