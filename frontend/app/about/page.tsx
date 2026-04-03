'use client'

import { Navbar } from '@/components/navbar'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useAuth } from '@/context/auth-context'
import {
  Activity,
  Users,
  Target,
  Leaf,
  MapPin,
  Shield,
  Zap,
  ArrowRight,
  CheckCircle2,
  Github,
  Twitter,
  Linkedin,
  Mail,
  ExternalLink,
  TrendingUp,
  Award,
  Globe,
  MessageSquareQuote,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { usePlatformStats } from '@/lib/hooks/use-platform-stats'

const values = [
  {
    icon: Target,
    title: 'Прозрачност',
    description: 'Всеки сигнал е публичен и проследим. Виждате в реално време какво се случва с докладваните проблеми.',
    number: '01',
  },
  {
    icon: Users,
    title: 'Общност',
    description: 'Вярваме, че заедно можем повече. Платформата обединява граждани, които искат промяна.',
    number: '02',
  },
  {
    icon: Leaf,
    title: 'Устойчивост',
    description: 'Фокусираме се върху екологични проблеми — от замърсяване до зелени площи и качество на въздуха.',
    number: '03',
  },
  {
    icon: Zap,
    title: 'Ефективност',
    description: 'Бързо и лесно докладване с автоматично геолокиране и категоризация на проблемите.',
    number: '04',
  },
]

const howItWorks = [
  {
    step: '01',
    title: 'Открийте проблем',
    description: 'Забелязали сте незаконно сметище, замърсен въздух или повредена инфраструктура? Действайте.',
  },
  {
    step: '02',
    title: 'Докладвайте',
    description: 'Направете снимка, опишете проблема и изберете категория. Местоположението се определя автоматично.',
  },
  {
    step: '03',
    title: 'Проследявайте',
    description: 'Следете статуса на вашия сигнал — от подаване до решение. Получавайте известия за всяка промяна.',
  },
  {
    step: '04',
    title: 'Вижте резултата',
    description: 'Когато проблемът бъде решен, вие печелите точки и издигате нивото си в общността.',
  },
]

const team = [
  {
    name: 'Георги Баладжанов',
    role: 'Основател & CEO',
    bio: 'Екоактивист с 10+ години опит в устойчивото градско развитие и гражданско участие.',
    initials: 'ГБ',
    color: 'from-forest to-forest/60',
  },
  {
    name: 'Демира Любенова',
    role: 'CTO',
    bio: 'Full-stack developer с фокус върху GIS системи и геопространствени данни в реално време.',
    initials: 'ДЛ',
    color: 'from-forest/80 to-lime/40',
  },
  {
    name: 'Мария Стефанова',
    role: 'Head of Community',
    bio: 'Свързва граждани и институции за общо благо. Архитект на партньорства с общината.',
    initials: 'МС',
    color: 'from-lime/60 to-forest/60',
  },
  {
    name: 'Станислав Ганчев',
    role: 'Lead Designer',
    bio: 'Проектира интуитивни потребителски изживявания с фокус върху достъпност и ясна комуникация.',
    initials: 'СГ',
    color: 'from-lime/40 to-forest/80',
  },
]

export default function AboutPage() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'
  const { stats: liveStats, isLoading: statsLoading } = usePlatformStats()

  const platformStats = [
    {
      value: statsLoading ? '…' : `${(liveStats?.total_reports ?? 0).toLocaleString()}+`,
      label: 'Подадени сигнали',
      icon: MapPin,
    },
    {
      value: statsLoading ? '…' : `${(liveStats?.total_users ?? 0).toLocaleString()}+`,
      label: 'Активни граждани',
      icon: Users,
    },
    {
      value: statsLoading ? '…' : `${liveStats?.resolved_percentage ?? 0}%`,
      label: 'Решени проблеми',
      icon: CheckCircle2,
    },
    {
      value: '24',
      label: 'Района на София',
      icon: Globe,
    },
  ]

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />

      {/* ─── Hero ─────────────────────────────────────────── */}
      <section className="relative pt-28 pb-24 overflow-hidden">
        {/* Subtle dot-grid */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle, rgba(26,71,49,0.07) 1px, transparent 1px)`,
            backgroundSize: '32px 32px',
          }}
        />
        {/* Glow blobs */}
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-lime/8 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-4">
          {/* Eyebrow */}
          <div className="flex justify-center mb-10">
            <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-forest/20 bg-forest/5 text-sm font-medium text-forest">
              <span className="w-1.5 h-1.5 rounded-full bg-lime animate-pulse" />
              Заедно за по-чиста София
            </span>
          </div>

          {/* Headline */}
          <h1 className="font-heading text-center text-5xl md:text-7xl lg:text-8xl font-bold text-foreground mb-6 leading-[1.05] tracking-tight text-balance">
            Градът е наш.
            <br />
            <span className="text-forest">Нека го пазим.</span>
          </h1>

          <p className="text-center text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed text-pretty">
            UrbanPulse е гражданска платформа, която дава глас на всеки,
            който иска да направи София по-чисто и по-зелено място за живеене.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            {isAdmin ? (
              <Button
                size="lg"
                disabled
                className="h-12 px-8 bg-forest/40 text-white/60 font-semibold rounded-xl text-base cursor-not-allowed"
                title="Администраторите не могат да подават сигнали"
              >
                Докладвай проблем
                <ArrowRight size={18} className="ml-2" />
              </Button>
            ) : (
              <Link href="/report">
                <Button
                  size="lg"
                  className="h-12 px-8 bg-forest hover:bg-forest/90 text-white font-semibold rounded-xl text-base shadow-lg shadow-forest/20 transition-all hover:shadow-forest/30 hover:-translate-y-0.5"
                >
                  Докладвай проблем
                  <ArrowRight size={18} className="ml-2" />
                </Button>
              </Link>
            )}
            <Link href="/">
              <Button
                size="lg"
                variant="outline"
                className="h-12 px-8 rounded-xl text-base border-forest/25 text-forest hover:bg-forest/5 hover:border-forest/40 transition-all"
              >
                Разгледай картата
              </Button>
            </Link>
          </div>

          {/* Stats row */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4">
            {platformStats.map((stat) => (
              <div
                key={stat.label}
                className="group relative bg-card rounded-2xl border border-border hover:border-forest/25 p-6 text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
              >
                <div className="w-10 h-10 rounded-xl bg-lime/15 flex items-center justify-center mx-auto mb-4 group-hover:bg-lime/25 transition-colors">
                  <stat.icon size={20} className="text-forest" />
                </div>
                <p className="font-heading text-3xl md:text-4xl font-bold text-forest mb-1">
                  {stat.value}
                </p>
                <p className="text-sm text-muted-foreground leading-snug">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Mission ──────────────────────────────────────── */}
      <section className="py-24 bg-dark-surface text-white relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-lime/4 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-forest/30 rounded-full blur-[100px]" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            {/* Left */}
            <div>
              <span className="text-lime text-xs font-semibold uppercase tracking-[0.15em]">
                Нашата мисия
              </span>
              <h2 className="font-heading text-4xl md:text-5xl font-bold mt-5 mb-7 leading-tight">
                Свързваме граждани и институции
              </h2>
              <p className="text-white/65 text-lg leading-relaxed mb-10">
                Вярваме, че всеки глас има значение. UrbanPulse е мостът между
                активните граждани и местните власти — платформа, която превръща
                сигналите в реални действия и измерими резултати.
              </p>

              <ul className="space-y-4">
                {[
                  'Прозрачно проследяване на всеки сигнал',
                  'Директна връзка с общинските служби',
                  'Gamification елементи за повече ангажираност',
                  'Отворени данни за анализ и мониторинг',
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-lime/20 flex items-center justify-center shrink-0">
                      <CheckCircle2 size={12} className="text-lime" />
                    </div>
                    <span className="text-white/75 text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right — metric cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 bg-white/4 border border-white/8 rounded-2xl p-6 flex items-start gap-5">
                <div className="w-12 h-12 rounded-xl bg-lime/15 flex items-center justify-center shrink-0">
                  <MessageSquareQuote size={22} className="text-lime" />
                </div>
                <div>
                  <p className="text-white/80 text-sm italic leading-relaxed mb-3">
                    "Благодарение на платформата, незаконното сметище до блока ни
                    беше почистено за 5 дни. Невероятно е да видиш как гласът ти има значение."
                  </p>
                  <p className="text-xs text-white/40 font-medium">Мария — жилищен квартал Лозенец</p>
                </div>
              </div>

              <div className="bg-white/4 border border-white/8 rounded-2xl p-6 text-center">
                <TrendingUp size={28} className="text-lime mx-auto mb-3" />
                <p className="font-heading text-3xl font-bold text-white">+156%</p>
                <p className="text-xs text-white/50 mt-1 leading-snug">Ръст на<br />сигналите</p>
              </div>

              <div className="bg-white/4 border border-white/8 rounded-2xl p-6 text-center">
                <Award size={28} className="text-lime mx-auto mb-3" />
                <p className="font-heading text-3xl font-bold text-white">Top 10</p>
                <p className="text-xs text-white/50 mt-1 leading-snug">Civic Tech<br />EU 2024</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Values ───────────────────────────────────────── */}
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
            <div>
              <span className="text-forest text-xs font-semibold uppercase tracking-[0.15em]">Нашите ценности</span>
              <h2 className="font-heading text-4xl md:text-5xl font-bold mt-4 leading-tight">
                Какво ни<br />движи напред
              </h2>
            </div>
            <p className="text-muted-foreground max-w-sm leading-relaxed">
              Четири основни принципа, които определят начина ни на работа
              и визията ни за по-добър град.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {values.map((value) => (
              <div
                key={value.title}
                className="group relative bg-card rounded-2xl border border-border hover:border-forest/25 p-7 flex flex-col transition-all duration-300 hover:shadow-xl hover:-translate-y-1.5"
              >
                {/* Number watermark */}
                <span className="absolute top-5 right-6 font-heading text-5xl font-bold text-forest/5 select-none group-hover:text-forest/8 transition-colors">
                  {value.number}
                </span>

                <div className="w-12 h-12 rounded-xl bg-lime/15 flex items-center justify-center mb-6 group-hover:bg-lime/25 transition-colors">
                  <value.icon size={22} className="text-forest" />
                </div>
                <h3 className="font-heading text-lg font-bold mb-3">{value.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How It Works ─────────────────────────────────── */}
      <section className="py-24 bg-forest/3 border-y border-forest/8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-forest text-xs font-semibold uppercase tracking-[0.15em]">Как работи</span>
            <h2 className="font-heading text-4xl md:text-5xl font-bold mt-4 mb-5">
              4 стъпки до промяна
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto leading-relaxed">
              От забелязване на проблем до неговото решение — процесът е прозрачен и проследим.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((item, index) => (
              <div key={item.step} className="relative">
                {/* Connector */}
                {index < howItWorks.length - 1 && (
                  <div className="hidden lg:block absolute top-10 left-[calc(100%-8px)] w-full h-px bg-forest/15 z-0" />
                )}
                <div className="relative z-10">
                  {/* Step number */}
                  <div className="w-20 h-20 rounded-2xl bg-forest text-white font-heading text-2xl font-bold flex items-center justify-center mb-6 shadow-lg shadow-forest/25">
                    {item.step}
                  </div>
                  <h3 className="font-heading text-lg font-bold mb-3">{item.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-16">
            <Link href="/register">
            <Button
                size="lg"
                className="h-12 px-10 bg-forest hover:bg-forest/90 text-white font-semibold rounded-xl text-base shadow-lg shadow-forest/25 hover:shadow-forest/30 hover:-translate-y-0.5 transition-all"
              >
                Започни сега — безплатно
                <ArrowRight size={18} className="ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Team ─────────────────────────────────────────── */}
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
            <div>
              <span className="text-forest text-xs font-semibold uppercase tracking-[0.15em]">Нашият екип</span>
              <h2 className="font-heading text-4xl md:text-5xl font-bold mt-4 leading-tight">
                Хората зад<br />UrbanPulse
              </h2>
            </div>
            <p className="text-muted-foreground max-w-sm leading-relaxed">
              Малък, но отдаден екип от ентусиасти, които вярват в силата на гражданското участие.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {team.map((member) => (
              <div
                key={member.name}
                className="group bg-card rounded-2xl border border-border hover:border-forest/25 p-7 transition-all duration-300 hover:shadow-xl hover:-translate-y-1.5"
              >
                {/* Avatar */}
                <div
                  className={cn(
                    'w-16 h-16 rounded-2xl bg-gradient-to-br flex items-center justify-center text-white font-heading font-bold text-xl mb-6 shadow-md group-hover:scale-105 transition-transform',
                    member.color
                  )}
                >
                  {member.initials}
                </div>

                <h3 className="font-heading text-lg font-bold text-foreground mb-1 leading-snug">
                  {member.name}
                </h3>
                <p className="text-xs font-semibold text-forest uppercase tracking-wider mb-4">
                  {member.role}
                </p>
                <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                  {member.bio}
                </p>

                {/* Social links */}
                <div className="flex items-center gap-2 pt-5 border-t border-border">
                  <button
                    aria-label={`Twitter на ${member.name}`}
                    className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:bg-forest hover:text-white transition-all duration-200"
                  >
                    <Twitter size={14} />
                  </button>
                  <button
                    aria-label={`LinkedIn на ${member.name}`}
                    className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:bg-forest hover:text-white transition-all duration-200"
                  >
                    <Linkedin size={14} />
                  </button>
                  <button
                    aria-label={`Имейл на ${member.name}`}
                    className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:bg-forest hover:text-white transition-all duration-200"
                  >
                    <Mail size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ──────────────────────────────────────────── */}
      <section className="py-24 bg-dark-surface relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-lime/6 rounded-full blur-[120px]" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 text-sm font-medium text-white/70 mb-10">
            <Shield size={14} className="text-lime" />
            100% безплатно и отворено
          </span>

          <h2 className="font-heading text-4xl md:text-6xl font-bold text-white mb-6 leading-tight text-balance">
            Готови ли сте да направите разлика?
          </h2>
          <p className="text-white/55 text-lg mb-12 max-w-xl mx-auto leading-relaxed">
            Присъединете се към над {statsLoading ? '…' : (liveStats?.total_users ?? 0).toLocaleString()} активни граждани, които вече променят
            София. Вашият глас може да бъде следващият, който ще бъде чут.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/register">
              <Button
                size="lg"
                className="h-12 px-10 bg-lime text-forest hover:bg-lime/90 font-semibold rounded-xl text-base shadow-lg shadow-lime/20 hover:-translate-y-0.5 transition-all"
              >
                Създай безплатен акаунт
                <ArrowRight size={18} className="ml-2" />
              </Button>
            </Link>
            <Link href="/">
              <Button
                size="lg"
                variant="outline"
                className="h-12 px-10 rounded-xl text-base border-white/20 text-white bg-transparent hover:bg-white/10 hover:border-white/30 transition-all"
              >
                Разгледай картата
                <ExternalLink size={16} className="ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Footer ───────────────────────────────────────── */}
      <footer className="bg-[#0c0f0b] text-white py-16 border-t border-white/5">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-10 mb-12">
            {/* Brand */}
            <div className="md:col-span-2">
              <Link href="/" className="inline-flex items-center gap-2 mb-5">
                <div className="relative">
                  <Activity size={26} className="text-lime" />
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-lime rounded-full animate-ping" />
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-lime rounded-full" />
                </div>
                <span className="font-heading font-bold text-xl">UrbanPulse</span>
              </Link>
              <p className="text-white/45 text-sm leading-relaxed max-w-xs mb-6">
                Гражданска платформа за докладване и проследяване на екологични
                проблеми в реално време. Заедно правим София по-чиста.
              </p>
              <div className="flex items-center gap-2">
                {[Twitter, Github, Linkedin].map((Icon, i) => (
                  <a
                    key={i}
                    href="#"
                    className="w-9 h-9 rounded-lg bg-white/6 flex items-center justify-center text-white/40 hover:bg-lime hover:text-forest transition-all duration-200"
                  >
                    <Icon size={16} />
                  </a>
                ))}
              </div>
            </div>

            {/* Платформа */}
            <div>
              <h4 className="font-heading font-semibold text-sm mb-5 text-white/80">Платформа</h4>
              <ul className="space-y-3 text-sm">
                {[
                  { label: 'Карта', href: '/' },
                  { label: 'Докладвай', href: isAdmin ? null : '/report' },
                  { label: 'За нас', href: '/about' },
                  { label: 'Администрация', href: '/admin' },
                ].map((link) => (
                  <li key={link.label}>
                    {link.href ? (
                      <Link
                        href={link.href}
                        className="text-white/45 hover:text-lime transition-colors"
                      >
                        {link.label}
                      </Link>
                    ) : (
                      <span className="text-white/20 cursor-not-allowed" title="Администраторите не могат да подават сигнали">
                        {link.label}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* Контакти */}
            <div>
              <h4 className="font-heading font-semibold text-sm mb-5 text-white/80">Контакти</h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <a
                    href="mailto:hello@urbanpulse.bg"
                    className="text-white/45 hover:text-lime transition-colors"
                  >
                    hello@urbanpulse.bg
                  </a>
                </li>
                <li className="text-white/45">София, България</li>
                <li>
                  <a href="#" className="text-white/45 hover:text-lime transition-colors">
                    Условия за ползване
                  </a>
                </li>
                <li>
                  <a href="#" className="text-white/45 hover:text-lime transition-colors">
                    Поверителност
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-white/6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-white/30 text-xs">
              &copy; 2024 UrbanPulse. Всички права запазени.
            </p>
            <p className="text-white/20 text-xs">
              Направено с грижа за София
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
