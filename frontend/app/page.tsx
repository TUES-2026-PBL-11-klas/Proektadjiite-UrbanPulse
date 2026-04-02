"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/navbar";
import { FilterSidebar, MobileFilterSheet } from "@/components/filter-sidebar";
import { MapPlaceholder } from "@/components/map-placeholder";
import {
  mockReports,
  type ReportCategory,
  type ReportStatus,
  mockCurrentUser,
} from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import {
  Filter,
  List,
  Map as MapIcon,
  Activity,
  TrendingUp,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { ReportCard } from "@/components/report-card";

interface FilterState {
  categories: ReportCategory[];
  statuses: ReportStatus[];
  timePeriod: "week" | "month" | "all";
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

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Filter reports based on current filters
  const filteredReports = mockReports.filter((report) => {
    // Category filter
    if (
      filters.categories.length > 0 &&
      !filters.categories.includes(report.category)
    ) {
      return false;
    }

    // Status filter
    if (
      filters.statuses.length > 0 &&
      !filters.statuses.includes(report.status)
    ) {
      return false;
    }

    // Time period filter
    if (filters.timePeriod !== "all") {
      const reportDate = new Date(report.createdAt);
      const now = new Date();
      const diffDays = Math.floor(
        (now.getTime() - reportDate.getTime()) / (1000 * 60 * 60 * 24),
      );

      if (filters.timePeriod === "week" && diffDays > 7) return false;
      if (filters.timePeriod === "month" && diffDays > 30) return false;
    }

    return true;
  });

  // Set user to null to show guest view, or mockCurrentUser for logged in view
  const currentUser = null; // Change to mockCurrentUser for logged in demo

  return (
    <div className="h-screen flex flex-col bg-surface">
      <Navbar user={currentUser} />

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
              {(filters.categories.length > 0 ||
                filters.statuses.length > 0) && (
                <span className="w-5 h-5 rounded-full bg-forest text-white text-xs flex items-center justify-center">
                  {filters.categories.length + filters.statuses.length}
                </span>
              )}
            </Button>

            <div className="flex items-center bg-muted rounded-lg p-1">
              <button
                onClick={() => setViewMode("map")}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === "map" ? "bg-card shadow-sm" : "hover:bg-card/50"
                }`}
              >
                <MapIcon
                  size={18}
                  className={
                    viewMode === "map" ? "text-forest" : "text-muted-foreground"
                  }
                />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === "list" ? "bg-card shadow-sm" : "hover:bg-card/50"
                }`}
              >
                <List
                  size={18}
                  className={
                    viewMode === "list"
                      ? "text-forest"
                      : "text-muted-foreground"
                  }
                />
              </button>
            </div>
          </div>

          {/* Map / List View */}
          <div className="flex-1 relative">
            {viewMode === "map" || !isMobile ? (
              <MapPlaceholder reports={filteredReports} className="h-full" />
            ) : (
              <div className="h-full overflow-y-auto p-4 space-y-3">
                {filteredReports.length > 0 ? (
                  filteredReports.map((report) => (
                    <ReportCard
                      key={report.id}
                      report={report}
                      variant="compact"
                    />
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

            {/* Desktop toggle sidebar button (when sidebar is closed) */}
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="hidden md:flex absolute top-4 left-4 items-center gap-2 px-4 py-2 bg-card shadow-lg rounded-lg border hover:bg-muted transition-colors"
              >
                <Filter size={16} className="text-forest" />
                <span className="text-sm font-medium">Филтри</span>
                {(filters.categories.length > 0 ||
                  filters.statuses.length > 0) && (
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
                    {
                      filteredReports.filter((r) => r.status !== "archived")
                        .length
                    }
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-1.5 border-t border-border/70 pt-2.5">
                  <div className="rounded-lg bg-muted/40 px-1.5 py-1 text-center">
                    <p className="text-lg font-bold text-amber-600">
                      {
                        filteredReports.filter((r) => r.status === "submitted")
                          .length
                      }
                    </p>
                    <span className="text-[11px] text-muted-foreground">
                      Нови
                    </span>
                  </div>
                  <div className="rounded-lg bg-muted/40 px-1.5 py-1 text-center">
                    <p className="text-lg font-bold text-blue-600">
                      {
                        filteredReports.filter(
                          (r) => r.status === "in_progress",
                        ).length
                      }
                    </p>
                    <span className="text-[11px] text-muted-foreground">
                      В процес
                    </span>
                  </div>
                  <div className="rounded-lg bg-muted/40 px-1.5 py-1 text-center">
                    <p className="text-lg font-bold text-green-600">
                      {
                        filteredReports.filter((r) => r.status === "resolved")
                          .length
                      }
                    </p>
                    <span className="text-[11px] text-muted-foreground">
                      Решени
                    </span>
                  </div>
                </div>

                <div className="mt-2.5 flex items-center justify-between rounded-lg bg-forest/95 px-2.5 py-1.5 text-white">
                  <div className="flex items-center gap-1.5">
                    <TrendingUp size={14} className="text-lime" />
                    <span className="text-xs font-medium text-white/85">
                      Тази седмица
                    </span>
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
