'use client'

import { useState } from 'react'
import { Navbar } from '@/components/navbar'
import { LevelCard, LevelBadge } from '@/components/level-badge'
import { ReportCard } from '@/components/report-card'
import { StatusBadge } from '@/components/status-badge'
import { 
  mockCurrentUser, 
  mockReports, 
  mockActivityFeed,
  levelLabels
} from '@/lib/mock-data'
import { 
  Calendar, 
  Mail, 
  FileText, 
  ThumbsUp,
  TrendingUp,
  Award,
  Clock
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<'reports' | 'activity'>('reports')
  const user = mockCurrentUser
  
  // Filter user's reports
  const userReports = mockReports.filter(r => r.userId === user.id)
  
  // Calculate stats
  const totalReports = userReports.length
  const resolvedReports = userReports.filter(r => r.status === 'resolved').length
  const totalVotesReceived = userReports.reduce((acc, r) => acc + r.voteCount, 0)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('bg-BG', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Днес'
    if (diffDays === 1) return 'Вчера'
    if (diffDays < 7) return `Преди ${diffDays} дни`
    return formatDate(dateString)
  }

  return (
    <div className="min-h-screen bg-surface">
      <Navbar user={user} />
      
      <main className="max-w-6xl mx-auto px-4 pt-24 pb-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - User Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Card */}
            <div className="bg-card rounded-2xl border p-6">
              {/* Avatar */}
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

              {/* Level Card */}
              <LevelCard level={user.level} points={user.points} className="mb-6" />

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-muted rounded-xl">
                  <p className="font-heading text-2xl font-bold text-forest">{totalReports}</p>
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

          {/* Right Column - Reports & Activity */}
          <div className="lg:col-span-2">
            {/* Tabs */}
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
                  {userReports.length}
                </span>
              </button>
              <button
                onClick={() => setActiveTab('activity')}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-md font-medium transition-colors',
                  activeTab === 'activity'
                    ? 'bg-card shadow-sm text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <TrendingUp size={18} />
                Активност
              </button>
            </div>

            {/* Reports Tab */}
            {activeTab === 'reports' && (
              <div className="space-y-4">
                {userReports.length > 0 ? (
                  userReports.map((report) => (
                    <ReportCard key={report.id} report={report} variant="compact" />
                  ))
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
            )}

            {/* Activity Tab */}
            {activeTab === 'activity' && (
              <div className="bg-card rounded-2xl border overflow-hidden">
                {mockActivityFeed.length > 0 ? (
                  <div className="divide-y">
                    {mockActivityFeed.map((activity, index) => (
                      <div key={activity.id} className="p-4 hover:bg-muted/50 transition-colors">
                        <div className="flex items-start gap-4">
                          {/* Timeline dot */}
                          <div className="relative">
                            <div className={cn(
                              'w-10 h-10 rounded-full flex items-center justify-center',
                              activity.type === 'report_submitted' && 'bg-amber-100 text-amber-600',
                              activity.type === 'report_resolved' && 'bg-green-100 text-green-600',
                              activity.type === 'vote_cast' && 'bg-blue-100 text-blue-600',
                            )}>
                              {activity.type === 'report_submitted' && <FileText size={18} />}
                              {activity.type === 'report_resolved' && <Award size={18} />}
                              {activity.type === 'vote_cast' && <ThumbsUp size={18} />}
                            </div>
                            {index < mockActivityFeed.length - 1 && (
                              <div className="absolute top-10 left-1/2 -translate-x-1/2 w-0.5 h-6 bg-border" />
                            )}
                          </div>
                          
                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <p className="font-medium">{activity.message}</p>
                                <a
                                  href={`/reports/${activity.reportId}`}
                                  className="text-sm text-muted-foreground hover:text-forest hover:underline line-clamp-1"
                                >
                                  {activity.reportTitle}
                                </a>
                              </div>
                              <div className="text-right shrink-0">
                                <span className="inline-flex items-center px-2.5 py-1 bg-lime/20 text-forest text-sm font-semibold rounded-full">
                                  +{activity.points} pts
                                </span>
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                              <Clock size={12} />
                              {formatRelativeTime(activity.createdAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-12 text-center">
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                      <TrendingUp size={28} className="text-muted-foreground" />
                    </div>
                    <h3 className="font-heading font-semibold text-lg mb-2">
                      Няма активност
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      Вашите действия ще се показват тук
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
