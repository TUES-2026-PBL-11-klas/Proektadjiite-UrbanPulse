"use client";

import { useState, useEffect, useCallback } from "react";
import { Navbar } from "@/components/navbar";
import { FilterSidebar, MobileFilterSheet } from "@/components/filter-sidebar";
import { MapPlaceholder } from "@/components/map-placeholder";
import { type Report, type ReportCategory, type ReportStatus } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import {
  Filter,
  List,
  Map as MapIcon,
  Activity,
  TrendingUp,
} from "lucide-react";
import { ReportCard } from "@/components/report-card";
import { apiGet } from "@/lib/api";

interface FilterState {
  categories: ReportCategory[];
  statuses: ReportStatus[];
  timePeriod: "week" | "month" | "all";
}

interface BackendReport {
  id: string;
  user_id: string;
  category: string;
  title: string;
  description: string | null;
  image_url: string;
  status: string;
  vote_count: number;
  heat_score: number;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
  latitude: number;
  longitude: number;
  author: { id: string; display_name: string };
}

function mapReport(r: BackendReport): Report {
  return {
    id: r.id,
    userId: r.user_id,
    userName: r.author.display_name,
    userLevel: 1,
    category: r.category as Report["category"],
    title: r.title,
    description: r.description ?? "",
    imageUrl: r.image_url,
    status: r.status as Report["status"],
    district: "",
    location: { lat: r.latitude, lng: r.longitude },
    voteCount: r.vote_count,
    heatScore: r.heat_score,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    resolvedAt: r.resolved_at ?? undefined,
  };
}

function buildQuery(filters: FilterState): string {
  const params = new URLSearchParams();

  if (filters.categories.length === 1) {
    params.set("category", filters.categories[0]);
  }
  if (filters.statuses.length === 1) {
    params.set("status", filters.statuses[0]);
  }

  if (filters.timePeriod !== "all") {
    const days = filters.timePeriod === "week" ? 7 : 30;
    const from = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    params.set("date_from", from.toISOString());
  }

  params.set("limit", "100");
  return params.toString() ? `?${params.toString()}` : "";
}

export default function HomePage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"map" | "list">("map");
  const [isMobile, setIsMobile] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    statuses: [],
    timePeriod: "all",
  });
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const query = buildQuery(filters);
      const data = await apiGet<{ reports: BackendReport[] }>(`/api/reports${query}`);
      let mapped = data.reports.map(mapReport);

      // Client-side multi-value filter (backend only supports single value per param)
      if (filters.categories.length > 1) {
        mapped = mapped.filter(r => filters.categories.includes(r.category));
      }
      if (filters.statuses.length > 1) {
        mapped = mapped.filter(r => filters.statuses.includes(r.status));
      }

      setReports(mapped);
    } catch {
      setReports([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const activeReports = reports.filter(r => r.status !== "archived");

  return (
    <div className="h-screen flex flex-col bg-surface">
      <Navbar />

      <main className="flex-1 flex pt-16 overflow-hidden">
        {/* Desktop Sidebar */}
        <div className="hidden md:block">
          <FilterSidebar
            filters={filters}
            onFiltersChange={setFilters}
            isOpen={sidebarOpen}
            onToggle={() => setSidebarOpen(!sidebarOpen)}
          />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Mobile Header */}
          <div className="md:hidden flex items-center justify-between p-4 bg-card border-b">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMobileFiltersOpen(true)}
              className="gap-2"
            >
              <Filter size={16} />
              Филтри
              {(filters.categories.length > 0 || filters.statuses.length > 0) && (
                <span className="w-5 h-5 rounded-full bg-forest text-white text-xs flex items-center justify-center">
                  {filters.categories.length + filters.statuses.length}
                </span>
              )}
            </Button>

            <div className="flex items-center bg-muted rounded-lg p-1">
              <button
                onClick={() => setViewMode("map")}
                className={`p-2 rounded-md transition-colors ${viewMode === "map" ? "bg-card shadow-sm" : "hover:bg-card/50"}`}
              >
                <MapIcon size={18} className={viewMode === "map" ? "text-forest" : "text-muted-foreground"} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-md transition-colors ${viewMode === "list" ? "bg-card shadow-sm" : "hover:bg-card/50"}`}
              >
                <List size={18} className={viewMode === "list" ? "text-forest" : "text-muted-foreground"} />
              </button>
            </div>
          </div>

          {/* Map / List View */}
          <div className="flex-1 relative">
            {viewMode === "map" || !isMobile ? (
              <MapPlaceholder reports={reports} className="h-full" />
            ) : (
              <div className="h-full overflow-y-auto p-4 space-y-3">
                {loading ? (
                  [1, 2, 3].map(i => (
                    <div key={i} className="h-16 bg-card rounded-lg border animate-pulse" />
                  ))
                ) : reports.length > 0 ? (
                  reports.map(report => (
                    <ReportCard key={report.id} report={report} variant="compact" />
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center h-64 text-center">
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                      <MapIcon size={32} className="text-muted-foreground" />
                    </div>
                    <h3 className="font-heading font-semibold text-lg mb-2">
                      Няма намерени сигнали
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      Опитайте да промените филтрите
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Desktop toggle sidebar button */}
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="hidden md:flex absolute top-4 left-4 items-center gap-2 px-4 py-2 bg-card shadow-lg rounded-lg border hover:bg-muted transition-colors"
              >
                <Filter size={16} className="text-forest" />
                <span className="text-sm font-medium">Филтри</span>
                {(filters.categories.length > 0 || filters.statuses.length > 0) && (
                  <span className="w-5 h-5 rounded-full bg-forest text-white text-xs flex items-center justify-center">
                    {filters.categories.length + filters.statuses.length}
                  </span>
                )}
              </button>
            )}

            {/* Stats overlay */}
            <div className="absolute top-4 right-4 hidden md:block">
              <div className="w-56 rounded-2xl border border-forest/10 bg-card/95 p-3.5 shadow-xl backdrop-blur-sm">
                <div className="mb-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-md bg-lime/20">
                      <Activity size={13} className="text-forest" />
                    </div>
                    <span className="text-sm font-medium text-muted-foreground">
                      Активни сигнали
                    </span>
                  </div>
                  <p className="font-heading text-3xl font-bold leading-none text-forest">
                    {loading ? "…" : activeReports.length}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-1.5 border-t border-border/70 pt-2.5">
                  <div className="rounded-lg bg-muted/40 px-1.5 py-1 text-center">
                    <p className="text-lg font-bold text-amber-600">
                      {loading ? "…" : reports.filter(r => r.status === "submitted").length}
                    </p>
                    <span className="text-[11px] text-muted-foreground">Нови</span>
                  </div>
                  <div className="rounded-lg bg-muted/40 px-1.5 py-1 text-center">
                    <p className="text-lg font-bold text-blue-600">
                      {loading ? "…" : reports.filter(r => r.status === "in_progress").length}
                    </p>
                    <span className="text-[11px] text-muted-foreground">В процес</span>
                  </div>
                  <div className="rounded-lg bg-muted/40 px-1.5 py-1 text-center">
                    <p className="text-lg font-bold text-green-600">
                      {loading ? "…" : reports.filter(r => r.status === "resolved").length}
                    </p>
                    <span className="text-[11px] text-muted-foreground">Решени</span>
                  </div>
                </div>

                <div className="mt-2.5 flex items-center justify-between rounded-lg bg-forest/95 px-2.5 py-1.5 text-white">
                  <div className="flex items-center gap-1.5">
                    <TrendingUp size={14} className="text-lime" />
                    <span className="text-xs font-medium text-white/85">Тази седмица</span>
                  </div>
                  <span className="text-xl font-bold text-lime">+12%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Filters Sheet */}
      <MobileFilterSheet
        filters={filters}
        onFiltersChange={setFilters}
        isOpen={mobileFiltersOpen}
        onToggle={() => setMobileFiltersOpen(!mobileFiltersOpen)}
        onClose={() => setMobileFiltersOpen(false)}
      />
    </div>
  );
}
