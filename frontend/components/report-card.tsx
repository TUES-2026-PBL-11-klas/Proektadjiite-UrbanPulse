'use client'

import { cn } from '@/lib/utils'
import { type Report } from '@/lib/mock-data'
import { StatusBadge } from './status-badge'
import { CategoryIcon } from './category-icon'
import { HeatScore } from './heat-score'
import { ThumbsUp, Calendar, MapPin, ChevronRight } from 'lucide-react'
import Link from 'next/link'

interface ReportCardProps {
  report: Report
  variant?: 'default' | 'compact' | 'popup'
  className?: string
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('bg-BG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function ReportCard({ report, variant = 'default', className }: ReportCardProps) {
  if (variant === 'popup') {
    return (
      <div className={cn('w-72 p-4 bg-card rounded-xl shadow-lg border', className)}>
        <div className="flex items-start gap-3 mb-3">
          <CategoryIcon category={report.category} size="md" />
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm line-clamp-2 leading-tight">
              {report.title}
            </h4>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <MapPin size={12} />
              {report.district}
            </p>
          </div>
        </div>
        
        <div className="flex items-center justify-between mb-3">
          <StatusBadge status={report.status} size="sm" />
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <ThumbsUp size={14} />
            <span>{report.voteCount}</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
          <span className="flex items-center gap-1">
            <Calendar size={12} />
            {formatDate(report.createdAt)}
          </span>
          <HeatScore score={report.heatScore} size="sm" showLabel={false} />
        </div>
        
        <Link 
          href={`/reports/${report.id}`}
          className="flex items-center justify-center gap-1 w-full py-2 px-3 bg-forest text-white text-sm font-medium rounded-lg hover:bg-forest/90 transition-colors"
        >
          Виж детайли
          <ChevronRight size={14} />
        </Link>
      </div>
    )
  }

  if (variant === 'compact') {
    return (
      <Link 
        href={`/reports/${report.id}`}
        className={cn(
          'flex items-center gap-4 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors group',
          className
        )}
      >
        <CategoryIcon category={report.category} size="sm" />
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm truncate group-hover:text-forest transition-colors">
            {report.title}
          </h4>
          <p className="text-xs text-muted-foreground">{report.district}</p>
        </div>
        <StatusBadge status={report.status} size="sm" showDot={false} />
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <ThumbsUp size={12} />
          <span>{report.voteCount}</span>
        </div>
        <span className="text-xs text-muted-foreground hidden sm:block">
          {formatDate(report.createdAt)}
        </span>
        <ChevronRight size={16} className="text-muted-foreground group-hover:text-forest transition-colors" />
      </Link>
    )
  }

  // Default card variant
  return (
    <Link 
      href={`/reports/${report.id}`}
      className={cn(
        'block p-4 rounded-xl border bg-card hover:shadow-lg hover:border-forest/30 transition-all duration-200 group',
        className
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <CategoryIcon category={report.category} showLabel size="sm" />
        <StatusBadge status={report.status} size="sm" />
      </div>
      
      <h3 className="font-heading font-semibold text-lg mb-2 line-clamp-2 group-hover:text-forest transition-colors">
        {report.title}
      </h3>
      
      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
        {report.description}
      </p>
      
      <div className="flex items-center justify-between pt-3 border-t">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <MapPin size={14} />
            {report.district}
          </span>
          <span className="flex items-center gap-1">
            <ThumbsUp size={14} />
            {report.voteCount}
          </span>
        </div>
        <span className="text-xs text-muted-foreground">
          {formatDate(report.createdAt)}
        </span>
      </div>
    </Link>
  )
}

// List item variant for profile and admin
interface ReportListItemProps {
  report: Report
  showActions?: boolean
  className?: string
}

export function ReportListItem({ report, showActions, className }: ReportListItemProps) {
  return (
    <div className={cn(
      'flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-muted/30 transition-colors',
      className
    )}>
      <CategoryIcon category={report.category} size="md" />
      
      <div className="flex-1 min-w-0">
        <Link 
          href={`/reports/${report.id}`}
          className="font-medium hover:text-forest transition-colors line-clamp-1"
        >
          {report.title}
        </Link>
        <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
          <span>{report.district}</span>
          <span className="font-mono text-xs">{report.id}</span>
        </div>
      </div>
      
      <StatusBadge status={report.status} size="sm" />
      
      <div className="flex items-center gap-1 text-sm text-muted-foreground min-w-15">
        <ThumbsUp size={14} />
        <span>{report.voteCount}</span>
      </div>
      
      <HeatScore score={report.heatScore} size="sm" showLabel={false} />
      
      <span className="text-sm text-muted-foreground min-w-22.5 text-right">
        {formatDate(report.createdAt)}
      </span>
      
      {showActions && (
        <button className="p-2 hover:bg-muted rounded-lg transition-colors">
          <ChevronRight size={18} className="text-muted-foreground" />
        </button>
      )}
    </div>
  )
}
