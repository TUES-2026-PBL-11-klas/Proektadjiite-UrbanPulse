'use client'

import { cn } from '@/lib/utils'
import { MapPin, Navigation } from 'lucide-react'
import { type Report } from '@/lib/mock-data'
import { useState } from 'react'
import dynamic from 'next/dynamic'
import { ReportCard } from './report-card'

const LeafletMap = dynamic(
  () => import('./leaflet-map'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-surface/50 flex flex-col items-center justify-center tracking-wide text-muted-foreground animate-pulse p-4">
        <MapPin size={32} className="mb-2 text-forest/40" />
        <p className="text-sm font-medium">Зареждане на карта...</p>
      </div>
    )
  }
)

interface MapPlaceholderProps {
  reports?: Report[]
  center?: { lat: number; lng: number }
  zoom?: number
  interactive?: boolean
  showControls?: boolean
  onMarkerClick?: (report: Report) => void
  onLocationSelect?: (location: { lat: number; lng: number }) => void
  selectedLocation?: { lat: number; lng: number } | null
  className?: string
}

export function MapPlaceholder({
  reports = [],
  center = { lat: 42.6977, lng: 23.3219 },
  zoom = 12,
  interactive = true,
  showControls = true,
  onMarkerClick,
  onLocationSelect,
  selectedLocation,
  className,
}: MapPlaceholderProps) {
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)

  const handleMarkerClick = (report: Report) => {
    setSelectedReport(report)
    onMarkerClick?.(report)
  }

  return (
    <div className={cn('relative bg-surface overflow-hidden shadow-inner w-full h-full min-h-100', className)}>
      <LeafletMap
        reports={reports}
        center={center}
        zoom={zoom}
        interactive={interactive}
        onMarkerClick={handleMarkerClick}
        onLocationSelect={onLocationSelect}
        selectedLocation={selectedLocation}
      />

      {/* Interactive hint */}
      {interactive && onLocationSelect && !selectedLocation && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-1000 px-4 py-2.5 bg-forest text-white text-sm font-medium rounded-xl shadow-lg flex items-center gap-2 pointer-events-none">
          <Navigation size={14} className="text-lime" />
          Кликнете за да изберете локация
        </div>
      )}
    </div>
  )
}
