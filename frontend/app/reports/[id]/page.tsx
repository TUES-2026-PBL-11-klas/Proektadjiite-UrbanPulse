'use client'

import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import { Navbar } from '@/components/navbar'
import { StatusBadge } from '@/components/status-badge'
import { CategoryIcon } from '@/components/category-icon'
import { LevelBadge } from '@/components/level-badge'
import { HeatGauge } from '@/components/heat-score'
import { MapPlaceholder } from '@/components/map-placeholder'
import { type Report } from '@/lib/mock-data'
import {
  ArrowLeft,
  ThumbsUp,
  Calendar,
  Clock,
  MapPin,
  Check,
  Circle,
  Share2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useAuth } from '@/context/auth-context'
import { apiGet, apiPost, apiDelete } from '@/lib/api'

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
  voted_by_me: boolean
  author: { id: string; display_name: string }
}

interface StatusHistoryEntry {
  id: string
  report_id: string
  old_status: string
  new_status: string
  comment: string | null
  changed_at: string
  admin: { id: string; display_name: string } | null
}

interface ReportDetailResponse {
  report: BackendReport
  status_history: StatusHistoryEntry[]
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

export default function ReportDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { user, token, refreshPoints } = useAuth()

  const [report, setReport] = useState<Report | null>(null)
  const [statusHistory, setStatusHistory] = useState<StatusHistoryEntry[]>([])
  const [hasVoted, setHasVoted] = useState(false)
  const [voteCount, setVoteCount] = useState(0)
  const [voteLoading, setVoteLoading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    apiGet<ReportDetailResponse>(`/api/reports/${id}`, token ?? undefined)
      .then(data => {
        setReport(mapReport(data.report))
        setStatusHistory(data.status_history)
        setHasVoted(data.report.voted_by_me)
        setVoteCount(data.report.vote_count)
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [id, token])

  const handleVote = async () => {
    if (!user || voteLoading) return
    setVoteLoading(true)
    try {
      if (hasVoted) {
        const res = await apiDelete<{ user: { points: number; level: number } }>(
          `/api/reports/${id}/vote`, token ?? undefined
        )
        setHasVoted(false)
        setVoteCount(c => c - 1)
        if (res.user) refreshPoints(res.user.points, res.user.level)
      } else {
        const res = await apiPost<{ user: { points: number; level: number } }>(
          `/api/reports/${id}/vote`, {}, token ?? undefined
        )
        setHasVoted(true)
        setVoteCount(c => c + 1)
        if (res.user) refreshPoints(res.user.points, res.user.level)
      }
    } catch {
      // vote failed — revert nothing, silently ignore
    } finally {
      setVoteLoading(false)
    }
  }

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('bg-BG', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })

  const formatShortDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('bg-BG', {
      day: 'numeric',
      month: 'short',
    })

  if (loading) {
    return (
      <div className="min-h-screen bg-surface">
        <Navbar />
        <div className="h-72 sm:h-96 bg-muted animate-pulse" />
        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {[1, 2, 3].map(i => <div key={i} className="h-32 bg-card rounded-2xl border animate-pulse" />)}
            </div>
            <div className="space-y-4">
              {[1, 2].map(i => <div key={i} className="h-40 bg-card rounded-2xl border animate-pulse" />)}
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (notFound || !report) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <Navbar />
        <div className="text-center">
          <h1 className="font-heading text-2xl font-bold mb-2">Сигналът не е намерен</h1>
          <Link href="/" className="text-forest hover:underline">Обратно към картата</Link>
        </div>
      </div>
    )
  }

  const statusSteps = [
    { status: 'submitted', label: 'Подаден', date: report.createdAt },
    {
      status: 'in_progress',
      label: 'В процес',
      date: statusHistory.find(h => h.new_status === 'in_progress')?.changed_at,
    },
    { status: 'resolved', label: 'Решен', date: report.resolvedAt },
    { status: 'archived', label: 'Архивиран', date: null as string | null | undefined },
  ]

  const statusOrder = ['submitted', 'in_progress', 'resolved', 'archived']
  const currentStepIndex = statusOrder.indexOf(report.status)

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />

      {/* Hero Image */}
      <div className="relative h-72 sm:h-96 lg:h-[450px] bg-dark-surface overflow-hidden">
        {report.imageUrl ? (
          <img
            src={report.imageUrl}
            alt={report.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20" />

        <div className="absolute top-20 left-4 z-10">
          <Link
            href="/"
            className="flex items-center gap-2 px-4 py-2 bg-black/30 backdrop-blur-sm text-white rounded-lg hover:bg-black/50 transition-colors"
          >
            <ArrowLeft size={18} />
            <span className="text-sm font-medium">Обратно</span>
          </Link>
        </div>

        <div className="absolute top-20 right-4 z-10">
          <button
            onClick={() => navigator.clipboard?.writeText(window.location.href)}
            className="p-2.5 bg-black/30 backdrop-blur-sm text-white rounded-lg hover:bg-black/50 transition-colors"
          >
            <Share2 size={18} />
          </button>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 via-black/50 to-transparent">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <CategoryIcon category={report.category} size="sm" showLabel />
              <span className="text-white/40">|</span>
              <StatusBadge status={report.status} />
            </div>
            <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight">
              {report.title}
            </h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            {report.description && (
              <div className="bg-card rounded-2xl border p-6">
                <h2 className="font-heading font-semibold text-lg mb-4">Описание</h2>
                <p className="text-muted-foreground leading-relaxed">{report.description}</p>
              </div>
            )}

            {/* Submitter Info */}
            <div className="bg-card rounded-2xl border p-6">
              <h2 className="font-heading font-semibold text-lg mb-4">Подаден от</h2>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-forest flex items-center justify-center text-white text-xl font-heading font-bold">
                  {report.userName.charAt(0)}
                </div>
                <div>
                  <p className="font-medium text-lg">{report.userName}</p>
                  <LevelBadge level={report.userLevel} size="sm" />
                </div>
              </div>
            </div>

            {/* Timestamps */}
            <div className="bg-card rounded-2xl border p-6">
              <h2 className="font-heading font-semibold text-lg mb-4">Времева линия</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                    <Calendar size={18} className="text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Подаден на</p>
                    <p className="font-medium">{formatDate(report.createdAt)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                    <Clock size={18} className="text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Последна промяна</p>
                    <p className="font-medium">{formatDate(report.updatedAt)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Location Map */}
            <div className="bg-card rounded-2xl border overflow-hidden">
              <div className="p-6 border-b">
                <h2 className="font-heading font-semibold text-lg mb-2">Локация</h2>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin size={16} />
                  <span className="font-mono text-sm">
                    {report.location.lat.toFixed(5)}, {report.location.lng.toFixed(5)}
                  </span>
                </div>
              </div>
              <MapPlaceholder
                reports={[report]}
                center={report.location}
                showControls={false}
                className="h-64"
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Vote Card */}
            <div className="bg-card rounded-2xl border p-6">
              <div className="text-center mb-6">
                <p className="text-sm text-muted-foreground mb-1">Брой гласове</p>
                <p className="font-heading text-5xl font-bold text-forest">{voteCount}</p>
              </div>

              <Button
                className={cn(
                  'w-full h-12 font-semibold',
                  hasVoted
                    ? 'bg-lime/20 text-forest border border-lime/40 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30'
                    : user
                      ? 'bg-forest hover:bg-forest/90 text-white'
                      : 'bg-muted text-muted-foreground cursor-not-allowed'
                )}
                disabled={!user || voteLoading}
                onClick={handleVote}
              >
                <ThumbsUp size={20} className="mr-2" />
                {voteLoading
                  ? 'Зареждане...'
                  : hasVoted
                    ? 'Премахни гласа'
                    : user
                      ? 'Гласувай'
                      : 'Влезте за да гласувате'}
              </Button>

              <p className="text-xs text-muted-foreground text-center mt-3">
                Гласувайте, за да покажете подкрепа и да повишите приоритета
              </p>
            </div>

            {/* Heat Score */}
            <div className="bg-card rounded-2xl border p-6">
              <HeatGauge score={report.heatScore} />
            </div>

            {/* Status Timeline */}
            <div className="bg-card rounded-2xl border p-6">
              <h3 className="font-heading font-semibold mb-4">Статус на сигнала</h3>
              <div className="space-y-4">
                {statusSteps.map((step, index) => {
                  const isPast = index < currentStepIndex
                  const isCurrent = index === currentStepIndex
                  const isFuture = index > currentStepIndex

                  return (
                    <div key={step.status} className="flex items-start gap-3">
                      <div className="relative flex flex-col items-center">
                        <div className={cn(
                          'w-8 h-8 rounded-full flex items-center justify-center',
                          isPast && 'bg-green-100 text-green-600',
                          isCurrent && 'bg-forest text-white',
                          isFuture && 'bg-muted text-muted-foreground'
                        )}>
                          {isPast ? (
                            <Check size={16} />
                          ) : isCurrent ? (
                            <Circle size={8} fill="currentColor" />
                          ) : (
                            <Circle size={8} />
                          )}
                        </div>
                        {index < statusSteps.length - 1 && (
                          <div className={cn(
                            'w-0.5 h-8 mt-1',
                            index < currentStepIndex ? 'bg-green-200' : 'bg-border'
                          )} />
                        )}
                      </div>

                      <div className="flex-1 pb-4">
                        <p className={cn('font-medium', isFuture && 'text-muted-foreground')}>
                          {step.label}
                        </p>
                        {step.date && (
                          <p className="text-sm text-muted-foreground">
                            {formatShortDate(step.date)}
                          </p>
                        )}
                        {!step.date && isFuture && (
                          <p className="text-sm text-muted-foreground">Очаква се</p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Report ID */}
            <div className="bg-muted/50 rounded-xl p-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">Идентификатор на сигнала</p>
              <p className="font-mono text-sm font-medium">{report.id}</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
