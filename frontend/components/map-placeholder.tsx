"use client";

import { cn } from "@/lib/utils";
import {
  MapPin,
  ZoomIn,
  ZoomOut,
  Locate,
  Layers,
  Navigation,
  Compass,
} from "lucide-react";
import { type Report } from "@/lib/mock-data";
import { useState } from "react";
import { ReportCard } from "./report-card";

interface MapPlaceholderProps {
  reports?: Report[];
  center?: { lat: number; lng: number };
  zoom?: number;
  interactive?: boolean;
  showControls?: boolean;
  onMarkerClick?: (report: Report) => void;
  onLocationSelect?: (location: { lat: number; lng: number }) => void;
  selectedLocation?: { lat: number; lng: number } | null;
  className?: string;
}

const SOFIA_FALLBACK_CENTER = { lat: 42.6977, lng: 23.3219 };

// Status color mapping
const statusColors: Record<string, { bg: string; text: string; glow: string }> =
  {
    submitted: {
      bg: "bg-amber-500",
      text: "text-amber-500",
      glow: "shadow-amber-500/50",
    },
    in_progress: {
      bg: "bg-blue-500",
      text: "text-blue-500",
      glow: "shadow-blue-500/50",
    },
    resolved: {
      bg: "bg-emerald-500",
      text: "text-emerald-500",
      glow: "shadow-emerald-500/50",
    },
    archived: {
      bg: "bg-gray-400",
      text: "text-gray-400",
      glow: "shadow-gray-400/50",
    },
  };

// Convert lat/lng to pixel position (simplified projection)
function latLngToPixel(
  lat: number,
  lng: number,
  bounds: { minLat: number; maxLat: number; minLng: number; maxLng: number },
  width: number,
  height: number,
) {
  const x = ((lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * width;
  const y = ((bounds.maxLat - lat) / (bounds.maxLat - bounds.minLat)) * height;
  return { x, y };
}

export function MapPlaceholder({
  reports = [],
  center = SOFIA_FALLBACK_CENTER,
  zoom = 12,
  interactive = true,
  showControls = true,
  onMarkerClick,
  onLocationSelect,
  selectedLocation,
  className,
}: MapPlaceholderProps) {
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [hoveredMarker, setHoveredMarker] = useState<string | null>(null);

  // Sofia bounds (approximate)
  const bounds = {
    minLat: 42.62,
    maxLat: 42.78,
    minLng: 23.2,
    maxLng: 23.45,
  };

  const handleMarkerClick = (report: Report) => {
    setSelectedReport(report);
    onMarkerClick?.(report);
  };

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!interactive || !onLocationSelect) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Convert pixel to lat/lng (reverse projection)
    const lng =
      bounds.minLng + (x / rect.width) * (bounds.maxLng - bounds.minLng);
    const lat =
      bounds.maxLat - (y / rect.height) * (bounds.maxLat - bounds.minLat);

    onLocationSelect({ lat, lng });
    setSelectedReport(null);
  };

  return (
    <div
      className={cn(
        "relative bg-surface rounded-2xl overflow-hidden shadow-inner",
        className,
      )}
    >
      {/* Map background */}
      <div
        className={cn("absolute inset-0", interactive && "cursor-crosshair")}
        onClick={handleMapClick}
      >
        {/* Base gradient - softer, more map-like */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 120% 80% at 30% 20%, rgba(232, 245, 233, 0.9) 0%, transparent 50%),
              radial-gradient(ellipse 100% 60% at 70% 80%, rgba(227, 242, 253, 0.8) 0%, transparent 50%),
              linear-gradient(180deg, #f0fdf4 0%, #ecfdf5 30%, #f0fdfa 60%, #f5f5f4 100%)
            `,
          }}
        />

        {/* Subtle noise texture */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Road grid - more realistic */}
        <svg
          viewBox="0 0 100 100"
          className="absolute inset-0 w-full h-full"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient
              id="roadGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="rgba(26, 71, 49, 0.06)" />
              <stop offset="100%" stopColor="rgba(26, 71, 49, 0.03)" />
            </linearGradient>
          </defs>

          {/* Main roads */}
          <path
            d="M0,35 Q30,32 50,35 T100,30"
            stroke="rgba(26, 71, 49, 0.12)"
            strokeWidth="0.4"
            fill="none"
          />
          <path
            d="M0,55 Q40,58 60,55 T100,58"
            stroke="rgba(26, 71, 49, 0.12)"
            strokeWidth="0.4"
            fill="none"
          />
          <path
            d="M0,75 Q35,72 55,76 T100,73"
            stroke="rgba(26, 71, 49, 0.08)"
            strokeWidth="0.3"
            fill="none"
          />

          {/* Vertical roads */}
          <path
            d="M25,0 Q28,30 25,50 T28,100"
            stroke="rgba(26, 71, 49, 0.10)"
            strokeWidth="0.35"
            fill="none"
          />
          <path
            d="M50,0 Q48,40 52,60 T50,100"
            stroke="rgba(26, 71, 49, 0.12)"
            strokeWidth="0.4"
            fill="none"
          />
          <path
            d="M75,0 Q73,35 76,55 T74,100"
            stroke="rgba(26, 71, 49, 0.10)"
            strokeWidth="0.35"
            fill="none"
          />

          {/* Ring road (boulevard) */}
          <ellipse
            cx="50"
            cy="50"
            rx="30"
            ry="25"
            stroke="rgba(26, 71, 49, 0.14)"
            strokeWidth="0.5"
            fill="none"
            strokeDasharray="2,1"
          />
        </svg>

        {/* Districts / neighborhoods - subtle zones */}
        <div className="absolute top-[15%] left-[20%] w-24 h-20 rounded-full bg-emerald-500/[0.04] blur-2xl" />
        <div className="absolute top-[25%] right-[25%] w-32 h-28 rounded-full bg-lime/[0.05] blur-3xl" />
        <div className="absolute bottom-[25%] left-[35%] w-28 h-24 rounded-full bg-teal-500/[0.04] blur-2xl" />
        <div className="absolute bottom-[35%] right-[15%] w-20 h-20 rounded-full bg-blue-500/[0.03] blur-2xl" />

        {/* Parks / green areas */}
        <svg
          viewBox="0 0 100 100"
          className="absolute inset-0 w-full h-full opacity-60"
          preserveAspectRatio="none"
        >
          {/* South Park */}
          <ellipse
            cx="45"
            cy="65"
            rx="8"
            ry="5"
            fill="rgba(34, 197, 94, 0.15)"
          />
          {/* Borisova gradina */}
          <ellipse
            cx="70"
            cy="45"
            rx="10"
            ry="7"
            fill="rgba(34, 197, 94, 0.12)"
          />
          {/* Small parks */}
          <circle cx="30" cy="40" r="3" fill="rgba(34, 197, 94, 0.10)" />
          <circle cx="55" cy="30" r="2.5" fill="rgba(34, 197, 94, 0.10)" />
          <circle cx="25" cy="70" r="2" fill="rgba(34, 197, 94, 0.08)" />
        </svg>

        {/* River - Perlovska/Vladayska */}
        <svg
          viewBox="0 0 100 100"
          className="absolute inset-0 w-full h-full"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient
              id="riverGradient2"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor="rgba(59, 130, 246, 0.08)" />
              <stop offset="30%" stopColor="rgba(59, 130, 246, 0.20)" />
              <stop offset="70%" stopColor="rgba(59, 130, 246, 0.20)" />
              <stop offset="100%" stopColor="rgba(59, 130, 246, 0.08)" />
            </linearGradient>
          </defs>
          <path
            d="M8,52 C20,50 30,54 42,52 S60,56 72,53 S88,50 100,52"
            fill="none"
            stroke="url(#riverGradient2)"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        </svg>

        {/* Vitosha mountain silhouette */}
        <svg
          viewBox="0 0 200 40"
          className="absolute bottom-0 left-0 right-0 w-full h-20 opacity-[0.07]"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient
              id="mountainGradient"
              x1="0%"
              y1="0%"
              x2="0%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#1A4731" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
          </defs>
          <path
            d="M0,40 L15,32 L30,36 L50,22 L65,28 L80,18 L95,12 L110,20 L125,8 L140,16 L155,24 L170,14 L185,26 L200,40 Z"
            fill="url(#mountainGradient)"
          />
        </svg>

        {/* City center indicator */}
        <div
          className="absolute w-3 h-3 rounded-full border-2 border-forest/20 bg-forest/10"
          style={{
            left: `${latLngToPixel(42.6977, 23.3219, bounds, 100, 100).x}%`,
            top: `${latLngToPixel(42.6977, 23.3219, bounds, 100, 100).y}%`,
            transform: "translate(-50%, -50%)",
          }}
        />

        {/* Report markers */}
        {reports.map((report) => {
          const pos = latLngToPixel(
            report.location.lat,
            report.location.lng,
            bounds,
            100,
            100,
          );
          const isHovered = hoveredMarker === report.id;
          const isSelected = selectedReport?.id === report.id;
          const colors = statusColors[report.status];

          return (
            <button
              key={report.id}
              className={cn(
                "absolute transform -translate-x-1/2 -translate-y-full transition-all duration-300 z-10",
                (isHovered || isSelected) && "z-20 scale-110",
              )}
              style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
              onMouseEnter={() => setHoveredMarker(report.id)}
              onMouseLeave={() => setHoveredMarker(null)}
              onClick={(e) => {
                e.stopPropagation();
                handleMarkerClick(report);
              }}
            >
              <div className="relative group">
                {/* Glow effect */}
                <div
                  className={cn(
                    "absolute inset-0 rounded-full blur-md transition-opacity duration-300",
                    colors.bg,
                    isHovered || isSelected
                      ? "opacity-40 scale-150"
                      : "opacity-0",
                  )}
                />

                {/* Pin */}
                <div
                  className={cn(
                    "relative transition-all duration-300",
                    isHovered || isSelected
                      ? "drop-shadow-lg"
                      : "drop-shadow-md",
                  )}
                >
                  <MapPin
                    size={isHovered || isSelected ? 30 : 26}
                    className={cn(colors.text, "transition-all duration-300")}
                    fill="currentColor"
                    strokeWidth={1.5}
                    stroke="white"
                  />
                </div>

                {/* Vote count badge */}
                {(isHovered || isSelected) && report.voteCount > 0 && (
                  <span className="absolute -top-1 -right-2 min-w-[18px] h-[18px] px-1 bg-white rounded-full flex items-center justify-center text-[10px] font-bold text-forest shadow-md border border-border/50 animate-in fade-in zoom-in duration-200">
                    {report.voteCount}
                  </span>
                )}

                {/* Pulse animation for new reports */}
                {report.status === "submitted" && (
                  <span className="absolute top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                )}
              </div>
            </button>
          );
        })}

        {/* Selected location marker for report form */}
        {selectedLocation && (
          <div
            className="absolute transform -translate-x-1/2 -translate-y-full z-30"
            style={{
              left: `${latLngToPixel(selectedLocation.lat, selectedLocation.lng, bounds, 100, 100).x}%`,
              top: `${latLngToPixel(selectedLocation.lat, selectedLocation.lng, bounds, 100, 100).y}%`,
            }}
          >
            <div className="relative">
              {/* Ripple effect */}
              <span className="absolute top-full left-1/2 -translate-x-1/2 w-6 h-2 bg-forest/20 rounded-full blur-sm animate-pulse" />
              <MapPin
                size={38}
                className="text-forest drop-shadow-xl animate-bounce"
                fill="currentColor"
                strokeWidth={1.5}
                stroke="white"
              />
            </div>
          </div>
        )}
      </div>

      {/* Map controls - refined */}
      {showControls && (
        <div className="absolute bottom-24 right-4 flex flex-col bg-white/95 backdrop-blur-md rounded-xl shadow-lg border border-border/50 overflow-hidden">
          <button className="p-2.5 hover:bg-forest/8 transition-colors group border-b border-border/30">
            <ZoomIn
              size={17}
              className="text-muted-foreground group-hover:text-forest transition-colors"
            />
          </button>
          <button className="p-2.5 hover:bg-forest/8 transition-colors group border-b border-border/30">
            <ZoomOut
              size={17}
              className="text-muted-foreground group-hover:text-forest transition-colors"
            />
          </button>
          <button className="p-2.5 hover:bg-forest/8 transition-colors group border-b border-border/30">
            <Locate
              size={17}
              className="text-muted-foreground group-hover:text-forest transition-colors"
            />
          </button>
          <button className="p-2.5 hover:bg-forest/8 transition-colors group">
            <Layers
              size={17}
              className="text-muted-foreground group-hover:text-forest transition-colors"
            />
          </button>
        </div>
      )}

      {/* Compass */}
      {showControls && (
        <div className="absolute top-4 right-4 w-10 h-10 bg-white/95 backdrop-blur-md rounded-xl shadow-lg border border-border/50 flex items-center justify-center">
          <Compass size={20} className="text-forest/70" />
        </div>
      )}

      {/* Coordinates & location display */}
      <div className="absolute bottom-4 left-4 flex items-center gap-2">
        <div className="px-3.5 py-2 bg-white/95 backdrop-blur-md rounded-xl shadow-lg border border-border/50">
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="w-2 h-2 rounded-full bg-lime" />
              <div className="absolute inset-0 w-2 h-2 rounded-full bg-lime animate-ping opacity-75" />
            </div>
            <p className="text-xs font-medium text-foreground">София</p>
            <span className="text-xs text-border">|</span>
            <p className="text-[11px] font-mono text-muted-foreground">
              {center.lat.toFixed(4)}, {center.lng.toFixed(4)}
            </p>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="absolute top-4 left-4 px-3 py-2.5 bg-white/95 backdrop-blur-md rounded-xl shadow-lg border border-border/50">
        <div className="flex items-center gap-3 text-[11px]">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="text-muted-foreground">Нов</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-muted-foreground">В процес</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-muted-foreground">Решен</span>
          </div>
        </div>
      </div>

      {/* Selected report popup */}
      {selectedReport && (
        <div className="absolute bottom-4 right-4 z-30 animate-in slide-in-from-bottom-2 fade-in duration-300">
          <ReportCard report={selectedReport} variant="popup" />
        </div>
      )}

      {/* Interactive hint */}
      {interactive && !selectedLocation && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2.5 bg-forest text-white text-sm font-medium rounded-xl shadow-lg flex items-center gap-2">
          <Navigation size={14} className="text-lime" />
          Кликнете за да изберете локация
        </div>
      )}
    </div>
  );
}
