"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, Clock, TrendingUp, FileText, ChevronDown, Loader2 } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { StatusBadge } from "@/components/status-badge";
import { CategoryIcon } from "@/components/category-icon";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/context/auth-context";
import { apiGet, apiPatch } from "@/lib/api";
import { statusLabels } from "@/lib/mock-data";
import { type ReportStatus } from "@/lib/mock-data";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AdminSummary {
  total: number;
  by_status: { status: string; count: number }[];
  by_category: { category: string; count: number }[];
  avg_resolution_hours: number | null;
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

interface AdminUser {
  id: string;
  email: string;
  display_name: string;
  role: string;
  points: number;
  level: number;
  created_at: string;
  report_count: number;
}

const VALID_STATUSES: ReportStatus[] = ["submitted", "in_progress", "resolved", "archived"];

const statusDotStyles: Record<ReportStatus, string> = {
  submitted: "bg-amber-500",
  in_progress: "bg-blue-500",
  resolved: "bg-green-500",
  archived: "bg-gray-400",
};

const statusItemStyles: Record<ReportStatus, string> = {
  submitted: "text-amber-800 hover:bg-amber-50 focus:bg-amber-50",
  in_progress: "text-blue-800 hover:bg-blue-50 focus:bg-blue-50",
  resolved: "text-green-800 hover:bg-green-50 focus:bg-green-50",
  archived: "text-gray-600 hover:bg-gray-50 focus:bg-gray-50",
};

function StatusSelect({
  value,
  loading,
  onChange,
}: {
  value: ReportStatus;
  loading: boolean;
  onChange: (status: ReportStatus) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          disabled={loading}
          className="flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed group"
        >
          <StatusBadge status={value} size="sm" />
          {loading ? (
            <Loader2 size={13} className="animate-spin text-muted-foreground" />
          ) : (
            <ChevronDown
              size={13}
              className="text-muted-foreground group-hover:text-foreground transition-colors"
            />
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-44 p-1">
        {VALID_STATUSES.map((s) => (
          <DropdownMenuItem
            key={s}
            disabled={s === value}
            onSelect={() => onChange(s)}
            className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium cursor-pointer ${statusItemStyles[s]} ${s === value ? "opacity-50 cursor-default" : ""}`}
          >
            <span className={`w-2 h-2 rounded-full shrink-0 ${statusDotStyles[s]}`} />
            {statusLabels[s]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const { user, token, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [selectedTab, setSelectedTab] = useState<"overview" | "reports" | "users">("overview");
  const [filterStatus, setFilterStatus] = useState<"all" | "submitted" | "in_progress" | "resolved">("all");

  const [summary, setSummary] = useState<AdminSummary | null>(null);
  const [reports, setReports] = useState<BackendReport[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Redirect non-admins
  useEffect(() => {
    if (!authLoading && (!user || user.role !== "admin")) {
      router.push("/");
    }
  }, [authLoading, user, router]);

  const fetchData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [summaryData, reportsData, usersData] = await Promise.all([
        apiGet<AdminSummary>("/api/admin/analytics/summary", token),
        apiGet<{ reports: BackendReport[] }>("/api/reports?limit=100", token),
        apiGet<{ users: AdminUser[] }>("/api/admin/users", token),
      ]);
      setSummary(summaryData);
      setReports(reportsData.reports);
      setUsers(usersData.users);
    } catch (err) {
      console.error("Failed to load admin data:", err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (user?.role === "admin" && token) {
      fetchData();
    }
  }, [user, token, fetchData]);

  const handleStatusChange = async (reportId: string, newStatus: string) => {
    if (!token) return;
    setUpdatingId(reportId);
    try {
      await apiPatch(`/api/reports/${reportId}/status`, { new_status: newStatus }, token);
      await fetchData();
    } catch (err) {
      console.error("Failed to update status:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  if (authLoading || !user || user.role !== "admin") return null;

  // ─── Derived data ──────────────────────────────────────────────────────────

  const getStatusCount = (status: string) =>
    summary?.by_status.find((s) => s.status === status)?.count ?? 0;

  const filteredReports =
    filterStatus === "all"
      ? reports
      : reports.filter((r) => r.status === filterStatus);

  const recentReports = reports.slice(0, 5);

  const topContributors = [...users]
    .filter((u) => u.role === "citizen")
    .sort((a, b) => b.report_count - a.report_count)
    .slice(0, 5);

  const stats = [
    {
      label: "Общо сигнали",
      value: summary?.total ?? 0,
      icon: FileText,
      colorBox: "bg-forest/10",
      iconColor: "text-forest",
    },
    {
      label: "Подадени",
      value: getStatusCount("submitted"),
      icon: Clock,
      colorBox: "bg-amber-100",
      iconColor: "text-amber-600",
    },
    {
      label: "В процес",
      value: getStatusCount("in_progress"),
      icon: TrendingUp,
      colorBox: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      label: "Решени",
      value: getStatusCount("resolved"),
      icon: CheckCircle2,
      colorBox: "bg-green-100",
      iconColor: "text-green-600",
    },
  ];

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 pt-24 pb-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-heading font-bold mb-2">Административен панел</h1>
          <p className="text-muted-foreground">
            Управление на сигнали, потребители и системна аналитика
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="bg-card rounded-2xl border p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-end mb-4">
                  <div className={`w-12 h-12 rounded-xl ${stat.colorBox} flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${stat.iconColor}`} />
                  </div>
                </div>
                {loading ? (
                  <div className="h-10 bg-muted rounded-lg animate-pulse" />
                ) : (
                  <>
                    <p className="text-muted-foreground text-sm mb-1">{stat.label}</p>
                    <p className="text-3xl font-heading font-bold">{stat.value}</p>
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-border">
          {(["overview", "reports", "users"] as const).map((tab) => {
            const tabLabels = { overview: "Преглед", reports: "Сигнали", users: "Потребители" };
            return (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              className={`px-4 py-3 font-medium transition-colors relative ${
                selectedTab === tab
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tabLabels[tab]}
              {selectedTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-forest" />
              )}
            </button>
            );
          })}
        </div>

        {/* ── Overview Tab ── */}
        {selectedTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Reports */}
            <div className="lg:col-span-2">
              <div className="bg-card rounded-2xl border p-6">
                <h2 className="text-xl font-heading font-bold mb-6">Последни сигнали</h2>
                {loading ? (
                  <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="h-20 bg-muted rounded-xl animate-pulse" />
                    ))}
                  </div>
                ) : recentReports.length === 0 ? (
                  <p className="text-muted-foreground text-sm">Няма сигнали все още.</p>
                ) : (
                  <div className="space-y-3">
                    {recentReports.map((report) => (
                      <Link
                        key={report.id}
                        href={`/reports/${report.id}`}
                        className="block p-4 rounded-xl border border-border hover:border-forest/30 hover:shadow-sm transition-all group"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-3 min-w-0">
                            <CategoryIcon
                              // eslint-disable-next-line @typescript-eslint/no-explicit-any
                              category={report.category as any}
                              size="sm"
                            />
                            <div className="min-w-0">
                              <p className="text-foreground font-medium group-hover:text-forest transition-colors truncate">
                                {report.title}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {report.author.display_name} · (
                                {report.latitude.toFixed(4)},{" "}
                                {report.longitude.toFixed(4)})
                              </p>
                            </div>
                          </div>
                          <StatusBadge
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            status={report.status as any}
                          />
                        </div>
                        <div className="flex justify-end">
                          <p className="text-xs text-muted-foreground">
                            {new Date(report.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Top Contributors */}
            <div>
              <div className="bg-card rounded-2xl border p-6">
                <h2 className="text-xl font-heading font-bold mb-6">Топ сигнализиращи</h2>
                {loading ? (
                  <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="h-14 bg-muted rounded-xl animate-pulse" />
                    ))}
                  </div>
                ) : topContributors.length === 0 ? (
                  <p className="text-muted-foreground text-sm">Няма потребители все още.</p>
                ) : (
                  <div className="space-y-3">
                    {topContributors.map((contributor, index) => (
                      <div
                        key={contributor.id}
                        className="flex items-center gap-3 p-3 rounded-xl bg-muted/50"
                      >
                        <div className="w-10 h-10 rounded-full bg-forest flex items-center justify-center text-white font-bold text-sm shrink-0">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-foreground font-medium truncate">
                            {contributor.display_name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {contributor.report_count} сигнала
                          </p>
                        </div>
                        <div className="text-forest font-bold text-sm shrink-0">
                          {contributor.points} т.
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Reports Tab ── */}
        {selectedTab === "reports" && (
          <div className="bg-card rounded-2xl border p-6">
            <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
              <h2 className="text-xl font-heading font-bold">Всички сигнали</h2>
              <div className="flex gap-2 flex-wrap">
                {(["all", "submitted", "in_progress", "resolved"] as const).map(
                  (status) => (
                    <button
                      key={status}
                      onClick={() => setFilterStatus(status)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        filterStatus === status
                          ? "bg-forest text-white"
                          : "bg-muted text-muted-foreground hover:bg-muted/70"
                      }`}
                    >
                      {status === "all" ? "Всички" : statusLabels[status as ReportStatus]}
                    </button>
                  )
                )}
              </div>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-14 bg-muted rounded animate-pulse" />
                ))}
              </div>
            ) : filteredReports.length === 0 ? (
              <p className="text-muted-foreground text-sm">Няма намерени сигнали.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-4 px-4 text-muted-foreground font-medium">
                        Заглавие
                      </th>
                      <th className="text-left py-4 px-4 text-muted-foreground font-medium">
                        Автор
                      </th>
                      <th className="text-left py-4 px-4 text-muted-foreground font-medium">
                        Категория
                      </th>
                      <th className="text-left py-4 px-4 text-muted-foreground font-medium">
                        Статус
                      </th>
                      <th className="text-left py-4 px-4 text-muted-foreground font-medium">
                        Дата
                      </th>
                      <th className="text-left py-4 px-4 text-muted-foreground font-medium">
                        Промяна на статус
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredReports.map((report) => (
                      <tr
                        key={report.id}
                        className="border-b border-border hover:bg-muted/40 transition-colors"
                      >
                        <td className="py-4 px-4">
                          <Link
                            href={`/reports/${report.id}`}
                            className="text-foreground font-medium hover:text-forest transition-colors"
                          >
                            {report.title}
                          </Link>
                        </td>
                        <td className="py-4 px-4 text-muted-foreground text-sm">
                          {report.author.display_name}
                        </td>
                        <td className="py-4 px-4">
                          <CategoryIcon
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            category={report.category as any}
                            size="sm"
                          />
                        </td>
                        <td className="py-4 px-4">
                          <StatusBadge
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            status={report.status as any}
                          />
                        </td>
                        <td className="py-4 px-4 text-muted-foreground text-sm">
                          {new Date(report.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-4">
                          <StatusSelect
                            value={report.status as ReportStatus}
                            loading={updatingId === report.id}
                            onChange={(newStatus) =>
                              handleStatusChange(report.id, newStatus)
                            }
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── Users Tab ── */}
        {selectedTab === "users" && (
          <div className="bg-card rounded-2xl border p-6">
            <h2 className="text-xl font-heading font-bold mb-6">Управление на потребители</h2>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-muted rounded-xl animate-pulse" />
                ))}
              </div>
            ) : users.length === 0 ? (
              <p className="text-muted-foreground text-sm">Няма намерени потребители.</p>
            ) : (
              <div className="grid gap-3">
                {users.map((u) => (
                  <div
                    key={u.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border hover:border-forest/30 hover:shadow-sm transition-all"
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="w-12 h-12 rounded-full bg-forest flex items-center justify-center text-white font-bold shrink-0">
                        {u.display_name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-foreground font-medium truncate">
                          {u.display_name}
                        </p>
                        <p className="text-sm text-muted-foreground truncate">{u.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 text-right shrink-0 ml-4">
                      <div>
                        <p className="text-muted-foreground text-xs">Роля</p>
                        <p
                          className={`font-semibold text-sm ${
                            u.role === "admin" ? "text-forest" : "text-foreground"
                          }`}
                        >
                          {u.role === "admin" ? "Администратор" : "Гражданин"}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Сигнали</p>
                        <p className="font-bold">{u.report_count}</p>
                      </div>
                      {u.role === "citizen" && (
                        <>
                          <div>
                            <p className="text-muted-foreground text-xs">Ниво</p>
                            <p className="font-bold text-forest">{u.level}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-xs">Точки</p>
                            <p className="font-bold">{u.points}</p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
