"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { type Report, categoryLabels } from "@/lib/mock-data";
import { StatusBadge } from "./status-badge";
import { CategoryIcon } from "./category-icon";
import { HeatScore } from "./heat-score";
import { ThumbsUp, Calendar, ChevronRight, Flame, MapPin } from "lucide-react";
import Link from "next/link";

async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=16&accept-language=bg`,
      { headers: { "Accept-Language": "bg" } },
    );
    const data = await res.json();
    const a = data.address ?? {};
    const parts = [
      a.road,
      a.suburb ?? a.neighbourhood ?? a.quarter,
      a.city ?? a.town ?? a.village,
    ].filter(Boolean);
    return parts.length > 0 ? parts.join(", ") : "";
  } catch {
    return "";
  }
}

interface ReportCardProps {
  report: Report;
  variant?: "default" | "compact" | "popup";
  className?: string;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("bg-BG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const statusConfig: Record<
  string,
  { label: string; dot: string; pill: string }
> = {
  submitted: {
    label: "Подаден",
    dot: "bg-amber-500",
    pill: "bg-amber-50 text-amber-700",
  },
  in_progress: {
    label: "В процес",
    dot: "bg-blue-500",
    pill: "bg-blue-50 text-blue-700",
  },
  resolved: {
    label: "Решен",
    dot: "bg-emerald-500",
    pill: "bg-emerald-50 text-emerald-700",
  },
  archived: {
    label: "Архивиран",
    dot: "bg-gray-400",
    pill: "bg-gray-100 text-gray-600",
  },
};

function ReportPopupCard({
  report,
  className,
}: {
  report: Report;
  className?: string;
}) {
  const [address, setAddress] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    reverseGeocode(report.location.lat, report.location.lng).then((result) => {
      if (!cancelled) setAddress(result);
    });
    return () => {
      cancelled = true;
    };
  }, [report.location.lat, report.location.lng]);

  const st = statusConfig[report.status] ?? statusConfig.submitted;
  const heatScore = Math.min(Math.max(report.heatScore, 0), 10);
  const heatColor =
    heatScore >= 8
      ? "text-red-500"
      : heatScore >= 6
        ? "text-orange-500"
        : heatScore >= 4
          ? "text-yellow-500"
          : "text-gray-400";

  return (
    <div
      className={cn(
        "w-[320px] rounded-2xl bg-white shadow-2xl overflow-hidden",
        className,
      )}
    >
      {/* Header */}
      <div className="px-4 pt-4 pb-3 pr-10">
        <div className="flex items-start gap-3">
          <CategoryIcon category={report.category} size="md" />
          <div className="min-w-0 flex-1">
            <h4 className="font-semibold text-[15px] leading-snug text-gray-900 line-clamp-2">
              {report.title}
            </h4>
            <p className="mt-0.5 text-xs text-gray-400">
              {categoryLabels[report.category]}
            </p>
            <p className="mt-1 flex items-center gap-1 text-xs text-gray-400">
              <MapPin size={11} className="shrink-0" />
              {address === null ? (
                <span className="w-24 h-2.5 bg-gray-100 rounded animate-pulse" />
              ) : address ? (
                <span className="truncate">{address}</span>
              ) : (
                <span className="italic">Непознато място</span>
              )}
            </p>
          </div>
        </div>

        <div
          className={cn(
            "mt-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
            st.pill,
          )}
        >
          <span className={cn("w-1.5 h-1.5 rounded-full", st.dot)} />
          {st.label}
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-gray-100 mx-4" />

      {/* Stats */}
      <div className="px-4 py-3 flex items-center gap-3 text-sm text-gray-500">
        <span className="flex items-center gap-1.5">
          <ThumbsUp size={13} className="text-gray-400" />
          <span className="font-semibold text-gray-800">{report.voteCount}</span>
          <span>{report.voteCount === 1 ? "глас" : "гласа"}</span>
        </span>
        <span className="w-1 h-1 rounded-full bg-gray-200 shrink-0" />
        <span className="flex items-center gap-1.5">
          <Flame size={13} className={heatColor} />
          <span className={cn("font-semibold", heatColor)}>
            {heatScore.toFixed(1)}
          </span>
        </span>
        <span className="w-1 h-1 rounded-full bg-gray-200 shrink-0" />
        <span className="flex items-center gap-1.5 min-w-0">
          <Calendar size={13} className="text-gray-400 shrink-0" />
          <span className="truncate">{formatDate(report.createdAt)}</span>
        </span>
      </div>

      {/* Button */}
      <div className="px-4 pb-4">
        <Link
          href={`/reports/${report.id}`}
          style={{ color: "#ffffff" }}
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-[#1a4731] text-sm font-semibold transition-colors hover:bg-[#153a28]"
        >
          Виж детайли
          <ChevronRight size={15} />
        </Link>
      </div>
    </div>
  );
}

export function ReportCard({
  report,
  variant = "default",
  className,
}: ReportCardProps) {
  if (variant === "popup") {
    return <ReportPopupCard report={report} className={className} />;
  }

  if (variant === "compact") {
    return (
      <Link
        href={`/reports/${report.id}`}
        className={cn(
          "flex items-center gap-4 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors group",
          className,
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
        <ChevronRight
          size={16}
          className="text-muted-foreground group-hover:text-forest transition-colors"
        />
      </Link>
    );
  }

  // Default card variant
  return (
    <Link
      href={`/reports/${report.id}`}
      className={cn(
        "block p-4 rounded-xl border bg-card hover:shadow-lg hover:border-forest/30 transition-all duration-200 group",
        className,
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
  );
}

// List item variant for profile and admin
interface ReportListItemProps {
  report: Report;
  showActions?: boolean;
  className?: string;
}

export function ReportListItem({
  report,
  showActions,
  className,
}: ReportListItemProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-muted/30 transition-colors",
        className,
      )}
    >
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
  );
}
