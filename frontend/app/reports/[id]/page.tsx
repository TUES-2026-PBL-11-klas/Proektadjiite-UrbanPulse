'use client'

import { use } from 'react'
import Link from 'next/link'
import { Navbar } from '@/components/navbar'
import { StatusBadge } from '@/components/status-badge'
import { CategoryIcon } from '@/components/category-icon'
import { LevelBadge } from '@/components/level-badge'
import { HeatGauge } from '@/components/heat-score'
import { MapPlaceholder } from '@/components/map-placeholder'
import { 
  mockReports, 
  mockStatusHistory,
  mockCurrentUser,
  statusLabels 
} from '@/lib/mock-data'
import { 
  ArrowLeft, 
  ThumbsUp, 
  Calendar, 
  Clock, 
  MapPin,
  User,
  Check,
  Circle,
  Share2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default function ReportDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const report = mockReports.find(r => r.id === id) || mockReports[0]
  const statusHistory = mockStatusHistory.filter(h => h.reportId === report.id)
  const hasVoted = false // Mock state

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('bg-BG', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatShortDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('bg-BG', {
      day: 'numeric',
      month: 'short',
    })
  }

  // Define status steps
  const statusSteps = [
    { status: 'submitted', label: 'Подаден', date: report.createdAt },
    { status: 'in_progress', label: 'В процес', date: statusHistory.find(h => h.newStatus === 'in_progress')?.changedAt },
    { status: 'resolved', label: 'Решен', date: report.resolvedAt },
    { status: 'archived', label: 'Архивиран', date: null },
  ]

  const getCurrentStepIndex = () => {
    const statusOrder = ['submitted', 'in_progress', 'resolved', 'archived']
    return statusOrder.indexOf(report.status)
  }

  const currentStepIndex = getCurrentStepIndex()

  return (
    <div className="min-h-screen bg-surface">
      <Navbar user={null} />
      
      {/* Hero Image */}
      <div className="relative h-72 sm:h-96 lg:h-[450px] bg-dark-surface overflow-hidden">
        {/* Placeholder image background */}
        <div 
          className="absolute inset-0 bg-gradient-to-br from-forest/30 to-dark-surface"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.6)),
              url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%231A4731" width="100" height="100"/><circle cx="30" cy="40" r="20" fill="%237AE653" opacity="0.1"/><circle cx="70" cy="60" r="25" fill="%23111810" opacity="0.3"/></svg>')
            `,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        
        {/* Back button */}
        <div className="absolute top-20 left-4 z-10">
          <Link 
            href="/"
            className="flex items-center gap-2 px-4 py-2 bg-black/30 backdrop-blur-sm text-white rounded-lg hover:bg-black/50 transition-colors"
          >
            <ArrowLeft size={18} />
            <span className="text-sm font-medium">Обратно</span>
          </Link>
        </div>

        {/* Share button */}
        <div className="absolute top-20 right-4 z-10">
          <button className="p-2.5 bg-black/30 backdrop-blur-sm text-white rounded-lg hover:bg-black/50 transition-colors">
            <Share2 size={18} />
          </button>
        </div>
        
        {/* Title overlay */}
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
            <div className="bg-card rounded-2xl border p-6">
              <h2 className="font-heading font-semibold text-lg mb-4">Описание</h2>
              <p className="text-muted-foreground leading-relaxed">
                {report.description}
              </p>
            </div>

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
                  <span>{report.district}, София</span>
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
                <p className="font-heading text-5xl font-bold text-forest">
                  {report.voteCount}
                </p>
              </div>
              
              <Button 
                className={cn(
                  'w-full h-12 font-semibold',
                  hasVoted 
                    ? 'bg-muted text-muted-foreground cursor-not-allowed' 
                    : 'bg-forest hover:bg-forest/90 text-white'
                )}
                disabled={hasVoted}
              >
                <ThumbsUp size={20} className="mr-2" />
                {hasVoted ? 'Вече гласувахте' : 'Гласувай'}
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
                      {/* Step indicator */}
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
                      
                      {/* Step content */}
                      <div className="flex-1 pb-4">
                        <p className={cn(
                          'font-medium',
                          isFuture && 'text-muted-foreground'
                        )}>
                          {step.label}
                        </p>
                        {step.date && (
                          <p className="text-sm text-muted-foreground">
                            {formatShortDate(step.date)}
                          </p>
                        )}
                        {!step.date && isFuture && (
                          <p className="text-sm text-muted-foreground">
                            Очаква се
                          </p>
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
