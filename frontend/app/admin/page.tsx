"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  TrendingUp,
  Users,
  FileText,
  BarChart3,
  LogOut,
} from "lucide-react";
import { mockReports, mockUsers } from "@/lib/mock-data";
import { Navbar } from "@/components/navbar";
import { StatusBadge } from "@/components/status-badge";
import { CategoryIcon } from "@/components/category-icon";
import { LevelBadge } from "@/components/level-badge";

export default function AdminDashboard() {
  const [selectedTab, setSelectedTab] = useState<
    "overview" | "reports" | "users"
  >("overview");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "submitted" | "in_progress" | "resolved"
  >("all");

  const pendingReports = mockReports.filter((r) => r.status === "submitted");
  const inProgressReports = mockReports.filter(
    (r) => r.status === "in_progress",
  );
  const resolvedReports = mockReports.filter((r) => r.status === "resolved");

  const filteredReports =
    filterStatus === "all"
      ? mockReports
      : mockReports.filter((r) => r.status === filterStatus);

  const topReporters = mockUsers
    .slice(0, 5)
    .sort((a, b) => b.reportCount - a.reportCount);

  const formatReportLocation = (report: (typeof mockReports)[number]) => {
    return `${report.district} (${report.location.lat.toFixed(4)}, ${report.location.lng.toFixed(4)})`;
  };

  const stats = [
    {
      label: "Total Reports",
      value: mockReports.length,
      icon: FileText,
      color: "from-blue-500 to-blue-600",
    },
    {
      label: "Pending",
      value: pendingReports.length,
      icon: Clock,
      color: "from-amber-500 to-amber-600",
    },
    {
      label: "In Progress",
      value: inProgressReports.length,
      icon: TrendingUp,
      color: "from-purple-500 to-purple-600",
    },
    {
      label: "Resolved",
      value: resolvedReports.length,
      icon: CheckCircle2,
      color: "from-emerald-500 to-emerald-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">
            Admin Dashboard
          </h1>
          <p className="text-neutral-400">
            Manage reports, users, and system analytics
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="relative overflow-hidden rounded-xl bg-gradient-to-br from-neutral-800 to-neutral-900 p-6 border border-neutral-700 hover:border-neutral-600 transition-colors"
              >
                <div className="absolute inset-0 opacity-5 bg-gradient-to-br from-white"></div>
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <Icon className="w-6 h-6 text-neutral-400" />
                    <div
                      className={`w-12 h-12 rounded-lg bg-gradient-to-br ${stat.color} opacity-20`}
                    ></div>
                  </div>
                  <p className="text-neutral-400 text-sm mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-white">{stat.value}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-neutral-700">
          {(["overview", "reports", "users"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              className={`px-4 py-3 font-medium transition-colors relative ${
                selectedTab === tab
                  ? "text-white"
                  : "text-neutral-400 hover:text-neutral-300"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {selectedTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-500 to-blue-500"></div>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        {selectedTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Reports */}
            <div className="lg:col-span-2">
              <div className="rounded-xl bg-gradient-to-br from-neutral-800 to-neutral-900 border border-neutral-700 p-6">
                <h2 className="text-xl font-bold text-white mb-6">
                  Recent Reports
                </h2>
                <div className="space-y-4">
                  {mockReports.slice(0, 5).map((report) => (
                    <Link
                      key={report.id}
                      href={`/reports/${report.id}`}
                      className="block p-4 rounded-lg bg-neutral-900/50 border border-neutral-700 hover:border-cyan-500/50 transition-all group"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <CategoryIcon category={report.category} size="sm" />
                          <div>
                            <p className="text-white font-medium group-hover:text-cyan-400 transition-colors">
                              {report.title}
                            </p>
                            <p className="text-sm text-neutral-500">
                              {formatReportLocation(report)}
                            </p>
                          </div>
                        </div>
                        <StatusBadge status={report.status} />
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <LevelBadge level={report.userLevel} />
                        <p className="text-xs text-neutral-500">
                          {new Date(report.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Top Reporters */}
            <div>
              <div className="rounded-xl bg-gradient-to-br from-neutral-800 to-neutral-900 border border-neutral-700 p-6">
                <h2 className="text-xl font-bold text-white mb-6">
                  Top Contributors
                </h2>
                <div className="space-y-4">
                  {topReporters.map((user, index) => (
                    <div
                      key={user.id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-neutral-900/50 border border-neutral-700/50"
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white font-bold text-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium truncate">
                          {user.name}
                        </p>
                        <p className="text-sm text-neutral-500">
                          {user.reportCount} reports
                        </p>
                      </div>
                      <div className="text-cyan-400 font-bold text-sm">
                        {user.points}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedTab === "reports" && (
          <div className="rounded-xl bg-gradient-to-br from-neutral-800 to-neutral-900 border border-neutral-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">All Reports</h2>
              <div className="flex gap-2">
                {(["all", "submitted", "in_progress", "resolved"] as const).map(
                  (status) => (
                    <button
                      key={status}
                      onClick={() => setFilterStatus(status)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        filterStatus === status
                          ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white"
                          : "bg-neutral-700/50 text-neutral-300 hover:bg-neutral-700"
                      }`}
                    >
                      {status === "all" ? "All" : status.replace("_", " ")}
                    </button>
                  ),
                )}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neutral-700">
                    <th className="text-left py-4 px-4 text-neutral-400 font-medium">
                      Title
                    </th>
                    <th className="text-left py-4 px-4 text-neutral-400 font-medium">
                      Location
                    </th>
                    <th className="text-left py-4 px-4 text-neutral-400 font-medium">
                      Category
                    </th>
                    <th className="text-left py-4 px-4 text-neutral-400 font-medium">
                      Level
                    </th>
                    <th className="text-left py-4 px-4 text-neutral-400 font-medium">
                      Status
                    </th>
                    <th className="text-left py-4 px-4 text-neutral-400 font-medium">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReports.map((report) => (
                    <tr
                      key={report.id}
                      className="border-b border-neutral-700/50 hover:bg-neutral-700/30 transition-colors cursor-pointer"
                      onClick={() =>
                        (window.location.href = `/reports/${report.id}`)
                      }
                    >
                      <td className="py-4 px-4 text-white font-medium">
                        {report.title}
                      </td>
                      <td className="py-4 px-4 text-neutral-400 text-sm">
                        {formatReportLocation(report)}
                      </td>
                      <td className="py-4 px-4">
                        <CategoryIcon category={report.category} size="sm" />
                      </td>
                      <td className="py-4 px-4">
                        <LevelBadge level={report.userLevel} />
                      </td>
                      <td className="py-4 px-4">
                        <StatusBadge status={report.status} />
                      </td>
                      <td className="py-4 px-4 text-neutral-500 text-sm">
                        {new Date(report.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {selectedTab === "users" && (
          <div className="rounded-xl bg-gradient-to-br from-neutral-800 to-neutral-900 border border-neutral-700 p-6">
            <h2 className="text-xl font-bold text-white mb-6">
              User Management
            </h2>
            <div className="grid gap-4">
              {mockUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-neutral-900/50 border border-neutral-700/50 hover:border-neutral-600 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white font-bold">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-white font-medium">{user.name}</p>
                      <p className="text-sm text-neutral-500">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-8 text-right">
                    <div>
                      <p className="text-neutral-400 text-sm">Reports</p>
                      <p className="text-white font-bold">{user.reportCount}</p>
                    </div>
                    <div>
                      <p className="text-neutral-400 text-sm">Level</p>
                      <p className="text-white font-bold text-cyan-400">
                        {user.level}
                      </p>
                    </div>
                    <div>
                      <p className="text-neutral-400 text-sm">Points</p>
                      <p className="text-white font-bold">{user.points}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
