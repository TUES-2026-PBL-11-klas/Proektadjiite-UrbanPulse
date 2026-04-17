'use client'

import { cn } from '@/lib/utils'
import { useState } from 'react'
import {
  type ReportCategory,
  type ReportStatus,
  categoryLabels,
  statusLabels
} from '@/lib/mock-data'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Trash2,
  Wind,
  Droplets,
  Package,
  Volume2,
  AlertTriangle,
  Filter,
  X,
  ChevronDown,
  ChevronUp,
  RotateCcw
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface FilterState {
  categories: ReportCategory[]
  statuses: ReportStatus[]
  timePeriod: 'week' | 'month' | 'all'
}

interface FilterSidebarProps {
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
  isOpen?: boolean
  onToggle?: () => void
  className?: string
}

const categoryIcons: Record<ReportCategory, React.ElementType> = {
  illegal_dump: Trash2,
  air_pollution: Wind,
  water_pollution: Droplets,
  broken_container: Package,
  noise_pollution: Volume2,
  other: AlertTriangle,
}

const timePeriodLabels = {
  week: 'Последните 7 дни',
  month: 'Последните 30 дни',
  all: 'Всички',
}

export function FilterSidebar({
  filters,
  onFiltersChange,
  isOpen = true,
  onToggle,
  className,
}: FilterSidebarProps) {
  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    status: true,
    time: true,
  })

  const toggleCategory = (category: ReportCategory) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter(c => c !== category)
      : [...filters.categories, category]
    onFiltersChange({ ...filters, categories: newCategories })
  }

  const toggleStatus = (status: ReportStatus) => {
    const newStatuses = filters.statuses.includes(status)
      ? filters.statuses.filter(s => s !== status)
      : [...filters.statuses, status]
    onFiltersChange({ ...filters, statuses: newStatuses })
  }

  const resetFilters = () => {
    onFiltersChange({
      categories: [],
      statuses: [],
      timePeriod: 'all',
    })
  }

  const hasActiveFilters = filters.categories.length > 0 || filters.statuses.length > 0 || filters.timePeriod !== 'all'

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  return (
    <aside
      className={cn(
        'bg-card border-r h-full transition-all duration-300 overflow-hidden',
        isOpen ? 'w-72' : 'w-0',
        className
      )}
    >
      <div className="h-full flex flex-col w-72">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-forest" />
            <h2 className="font-heading font-semibold">Филтри</h2>
          </div>
          <div className="flex items-center gap-1">
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={resetFilters}
                className="text-muted-foreground hover:text-foreground"
              >
                <RotateCcw size={14} className="mr-1" />
                Изчисти
              </Button>
            )}
            {onToggle && (
              <button
                onClick={onToggle}
                className="p-1.5 hover:bg-muted rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Filters Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Category Filter */}
          <div>
            <button
              onClick={() => toggleSection('categories')}
              className="flex items-center justify-between w-full mb-3"
            >
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Категория
              </h3>
              {expandedSections.categories ? (
                <ChevronUp size={16} className="text-muted-foreground" />
              ) : (
                <ChevronDown size={16} className="text-muted-foreground" />
              )}
            </button>
            {expandedSections.categories && (
              <div className="space-y-2">
                {(Object.keys(categoryLabels) as ReportCategory[]).map((category) => {
                  const Icon = categoryIcons[category]
                  const isChecked = filters.categories.includes(category)
                  return (
                    <label
                      key={category}
                      className={cn(
                        'flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-colors',
                        isChecked
                          ? 'bg-forest/10 border border-forest/30'
                          : 'hover:bg-muted border border-transparent'
                      )}
                    >
                      <Checkbox
                        checked={isChecked}
                        onCheckedChange={() => toggleCategory(category)}
                        className="data-[state=checked]:bg-forest data-[state=checked]:border-forest"
                      />
                      <Icon size={16} className={isChecked ? 'text-forest' : 'text-muted-foreground'} />
                      <span className={cn(
                        'text-sm',
                        isChecked ? 'font-medium text-forest' : 'text-foreground'
                      )}>
                        {categoryLabels[category]}
                      </span>
                    </label>
                  )
                })}
              </div>
            )}
          </div>

          {/* Status Filter */}
          <div>
            <button
              onClick={() => toggleSection('status')}
              className="flex items-center justify-between w-full mb-3"
            >
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Статус
              </h3>
              {expandedSections.status ? (
                <ChevronUp size={16} className="text-muted-foreground" />
              ) : (
                <ChevronDown size={16} className="text-muted-foreground" />
              )}
            </button>
            {expandedSections.status && (
              <div className="space-y-2">
                {(['submitted', 'in_progress', 'resolved'] as ReportStatus[]).map((status) => {
                  const isChecked = filters.statuses.includes(status)
                  const dotColor = {
                    submitted: 'bg-amber-500',
                    in_progress: 'bg-blue-500',
                    resolved: 'bg-green-500',
                    archived: 'bg-gray-400',
                  }[status]

                  return (
                    <label
                      key={status}
                      className={cn(
                        'flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-colors',
                        isChecked
                          ? 'bg-forest/10 border border-forest/30'
                          : 'hover:bg-muted border border-transparent'
                      )}
                    >
                      <Checkbox
                        checked={isChecked}
                        onCheckedChange={() => toggleStatus(status)}
                        className="data-[state=checked]:bg-forest data-[state=checked]:border-forest"
                      />
                      <span className={cn('w-2 h-2 rounded-full', dotColor)} />
                      <span className={cn(
                        'text-sm',
                        isChecked ? 'font-medium text-forest' : 'text-foreground'
                      )}>
                        {statusLabels[status]}
                      </span>
                    </label>
                  )
                })}
              </div>
            )}
          </div>

          {/* Time Period Filter */}
          <div>
            <button
              onClick={() => toggleSection('time')}
              className="flex items-center justify-between w-full mb-3"
            >
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Период
              </h3>
              {expandedSections.time ? (
                <ChevronUp size={16} className="text-muted-foreground" />
              ) : (
                <ChevronDown size={16} className="text-muted-foreground" />
              )}
            </button>
            {expandedSections.time && (
              <RadioGroup
                value={filters.timePeriod}
                onValueChange={(value: string) =>
                  onFiltersChange({ ...filters, timePeriod: value as FilterState['timePeriod'] })
                }
                className="space-y-2"
              >
                {(['week', 'month', 'all'] as const).map((period) => (
                  <label
                    key={period}
                    className={cn(
                      'flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-colors',
                      filters.timePeriod === period
                        ? 'bg-forest/10 border border-forest/30'
                        : 'hover:bg-muted border border-transparent'
                    )}
                  >
                    <RadioGroupItem
                      value={period}
                      id={period}
                      className="data-[state=checked]:border-forest data-[state=checked]:text-forest"
                    />
                    <span className={cn(
                      'text-sm',
                      filters.timePeriod === period ? 'font-medium text-forest' : 'text-foreground'
                    )}>
                      {timePeriodLabels[period]}
                    </span>
                  </label>
                ))}
              </RadioGroup>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-muted/30">
          <p className="text-xs text-muted-foreground text-center">
            {hasActiveFilters ? 'Филтрите са активни' : 'Няма активни филтри'}
          </p>
        </div>
      </div>
    </aside>
  )
}

// Mobile variant as bottom sheet
interface MobileFilterSheetProps extends FilterSidebarProps {
  onClose: () => void
}

export function MobileFilterSheet({
  filters,
  onFiltersChange,
  isOpen,
  onClose,
}: MobileFilterSheetProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="absolute bottom-0 left-0 right-0 bg-card rounded-t-2xl max-h-[80vh] overflow-hidden animate-in slide-in-from-bottom">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="font-heading font-semibold">Филтри</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <div className="overflow-y-auto max-h-[calc(80vh-120px)]">
          <FilterSidebar
            filters={filters}
            onFiltersChange={onFiltersChange}
            className="border-none w-full"
          />
        </div>
        <div className="p-4 border-t">
          <Button
            onClick={onClose}
            className="w-full bg-forest hover:bg-forest/90"
          >
            Приложи филтри
          </Button>
        </div>
      </div>
    </div>
  )
}
