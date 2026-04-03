'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/navbar'
import { LevelCard } from '@/components/level-badge'
import { ReportCard } from '@/components/report-card'
import { levelLabels } from '@/lib/mock-data'
import { type Report } from '@/lib/mock-data'
import { useAuth } from '@/context/auth-context'
import { apiGet } from '@/lib/api'
import {
  Calendar,
  Mail,
  FileText,
  TrendingUp,
  Award,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface BackendReport {
  id: string
  user_id: string
  category: string
  title: string
  description: string | null
  image_url: string
  status: string
  vote_count: number
  heat_score: number
  created_at: string
  updated_at: string
  resolved_at: string | null
  latitude: number
  longitude: number
  author: { id: string; display_name: string }
}

function mapReport(r: BackendReport): Report {
  return {
    id: r.id,
    userId: r.user_id,
    userName: r.author.display_name,
    userLevel: 1,
    category: r.category as Report['category'],
    title: r.title,
    description: r.description ?? '',
    imageUrl: r.image_url,
    status: r.status as Report['status'],
    district: '',
    location: { lat: r.latitude, lng: r.longitude },
    voteCount: r.vote_count,
    heatScore: r.heat_score,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    resolvedAt: r.resolved_at ?? undefined,
  }
}

export default function ProfilePage() {
  const { user, token, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'reports'>('reports')
  const [reports, setReports] = useState<Report[]>([])
  const [reportsLoading, setReportsLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/signin')
    }
  }, [authLoading, user, router])

  useEffect(() => {
    if (!user) return
    setReportsLoading(true)
    apiGet<{ reports: BackendReport[] }>(`/api/reports?user_id=${user.id}`, token ?? undefined)
      .then(data => setReports(data.reports.map(mapReport)))
      .catch(() => setReports([]))
      .finally(() => setReportsLoading(false))
  }, [user, token])

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('bg-BG', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })

  if (authLoading || !user) return null

  const resolvedReports = reports.filter(r => r.status === 'resolved').length
  const totalVotesReceived = reports.reduce((acc, r) => acc + r.voteCount, 0)

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 pt-24 pb-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - User Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Card */}
            <div className="bg-card rounded-2xl border p-6">
              <div className="flex flex-col items-center mb-6">
                <div className="w-24 h-24 rounded-full bg-forest flex items-center justify-center text-white text-3xl font-heading font-bold mb-4">
                  {user.displayName.charAt(0)}
                </div>
                <h1 className="font-heading text-2xl font-bold text-center">
                  {user.displayName}
                </h1>
                <div className="flex items-center gap-2 text-muted-foreground mt-1">
                  <Mail size={14} />
                  <span className="text-sm">{user.email}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground mt-1">
                  <Calendar size={14} />
                  <span className="text-sm">Член от {formatDate(user.createdAt)}</span>
                </div>
              </div>

              <LevelCard level={user.level} points={user.points} className="mb-6" />

              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-muted rounded-xl">
                  <p className="font-heading text-2xl font-bold text-forest">{reports.length}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Сигнали</p>
                </div>
                <div className="text-center p-3 bg-muted rounded-xl">
                  <p className="font-heading text-2xl font-bold text-green-600">{resolvedReports}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Решени</p>
                </div>
                <div className="text-center p-3 bg-muted rounded-xl">
                  <p className="font-heading text-2xl font-bold text-amber-600">{totalVotesReceived}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Гласове</p>
                </div>
              </div>
            </div>

            {/* Points Info Card */}
            <div className="bg-card rounded-2xl border p-6">
              <h3 className="font-heading font-semibold mb-4 flex items-center gap-2">
                <Award size={18} className="text-lime" />
                Как се печелят точки?
              </h3>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center justify-between">
                  <span className="text-muted-foreground">Подаване на сигнал</span>
                  <span className="font-semibold text-forest">+50 pts</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-muted-foreground">Гласуване за сигнал</span>
                  <span className="font-semibold text-forest">+5 pts</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-muted-foreground">Решен ваш сигнал</span>
                  <span className="font-semibold text-forest">+100 pts</span>
                </li>
              </ul>
              <div className="mt-4 pt-4 border-t">
                <p className="text-xs text-muted-foreground">
                  Ниво 2 (Активист): 200 pts<br />
                  Ниво 3 (Еко Шампион): 500 pts
                </p>
              </div>
            </div>
          </div>

          {/* Right Column - Reports */}
          <div className="lg:col-span-2">
            <div className="flex gap-1 mb-6 bg-muted rounded-lg p-1">
              <button
                onClick={() => setActiveTab('reports')}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-md font-medium transition-colors',
                  activeTab === 'reports'
                    ? 'bg-card shadow-sm text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <FileText size={18} />
                Моите сигнали
                <span className={cn(
                  'px-2 py-0.5 rounded-full text-xs',
                  activeTab === 'reports' ? 'bg-forest text-white' : 'bg-muted-foreground/20'
                )}>
                  {reports.length}
                </span>
              </button>
            </div>

            {reportsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-16 bg-card rounded-lg border animate-pulse" />
                ))}
              </div>
            ) : reports.length > 0 ? (
              <div className="space-y-4">
                {reports.map(report => (
                  <ReportCard key={report.id} report={report} variant="compact" />
                ))}
              </div>
            ) : (
              <div className="bg-card rounded-2xl border p-12 text-center">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <FileText size={28} className="text-muted-foreground" />
                </div>
                <h3 className="font-heading font-semibold text-lg mb-2">
                  Все още нямате сигнали
                </h3>
                <p className="text-muted-foreground text-sm mb-6">
                  Подайте първия си сигнал и започнете да печелите точки!
                </p>
                <a
                  href="/report"
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-forest text-white rounded-lg font-medium hover:bg-forest/90 transition-colors"
                >
                  Докладвай проблем
                </a>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
