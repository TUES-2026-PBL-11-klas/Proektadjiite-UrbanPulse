'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, ZoomControl } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { Report } from '@/lib/mock-data'
import { ReportCard } from './report-card'

// Fix default icon paths in leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

const customIcons: Record<string, L.DivIcon> = {
  submitted: L.divIcon({ className: 'custom-icon bg-amber-500 w-4 h-4 rounded-full border-2 border-white shadow-md' }),
  in_progress: L.divIcon({ className: 'custom-icon bg-blue-500 w-4 h-4 rounded-full border-2 border-white shadow-md' }),
  resolved: L.divIcon({ className: 'custom-icon bg-emerald-500 w-4 h-4 rounded-full border-2 border-white shadow-md' }),
  archived: L.divIcon({ className: 'custom-icon bg-gray-400 w-4 h-4 rounded-full border-2 border-white shadow-md' }),
  selected: L.divIcon({ className: 'custom-icon bg-forest w-6 h-6 rounded-full border-2 border-white shadow-lg animate-bounce' }),
}

interface MapEventsProps {
  interactive?: boolean
  onLocationSelect?: (location: { lat: number; lng: number }) => void
}

function MapEvents({ interactive, onLocationSelect }: MapEventsProps) {
  useMapEvents({
    click(e) {
      if (interactive && onLocationSelect) {
        onLocationSelect({ lat: e.latlng.lat, lng: e.latlng.lng })
      }
    },
  })
  return null
}

interface LeafletMapProps {
  reports?: Report[]
  center?: { lat: number; lng: number }
  zoom?: number
  interactive?: boolean
  onMarkerClick?: (report: Report) => void
  onLocationSelect?: (location: { lat: number; lng: number }) => void
  selectedLocation?: { lat: number; lng: number } | null
}

export default function LeafletMap({
  reports = [],
  center = { lat: 42.6977, lng: 23.3219 },
  zoom = 12,
  interactive = false,
  onMarkerClick,
  onLocationSelect,
  selectedLocation,
}: LeafletMapProps) {
  return (
    <MapContainer 
      center={[center.lat, center.lng]} 
      zoom={zoom} 
      style={{ height: '100%', width: '100%', zIndex: 0 }}
      zoomControl={false}
      scrollWheelZoom={interactive}
      dragging={interactive}
      doubleClickZoom={interactive}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {/* Map Controls */}
      <ZoomControl position="bottomright" />

      {/* Map Events */}
      <MapEvents interactive={interactive} onLocationSelect={onLocationSelect} />

      {/* Existing Reports Markers */}
      {reports.map((report) => (
        <Marker
          key={report.id}
          position={[report.location.lat, report.location.lng]}
          icon={customIcons[report.status] || customIcons.submitted}
          eventHandlers={{
            click: () => onMarkerClick?.(report),
          }}
        >
          <Popup className="report-popup border-none p-0 overflow-hidden rounded-xl">
             <div className="w-[300px] -m-[13px] -mb-[14px]">
               <ReportCard report={report} variant="popup" />
             </div>
          </Popup>
        </Marker>
      ))}

      {/* Selected Location Marker (for reporting) */}
      {selectedLocation && (
        <Marker
          position={[selectedLocation.lat, selectedLocation.lng]}
          icon={customIcons.selected}
        />
      )}
    </MapContainer>
  )
}
