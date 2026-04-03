'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Activity, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/context/auth-context'
import { usePlatformStats } from '@/lib/hooks/use-platform-stats'

export default function SignInPage() {
  const { login } = useAuth()
  const { stats, isLoading: statsLoading } = usePlatformStats()
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)
    try {
      await login(formData.email, formData.password)
      router.push('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Грешка при вход')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-surface">
        <div className="w-full max-w-md">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 mb-8 group">
            <div className="relative">
              <Activity size={32} className="text-forest" />
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-lime rounded-full" />
            </div>
            <span className="font-heading font-bold text-2xl text-forest group-hover:text-forest/80 transition-colors">
              UrbanPulse
            </span>
          </Link>

          {/* Header */}
          <div className="mb-8">
            <h1 className="font-heading text-3xl font-bold text-foreground mb-2">
              Добре дошли отново
            </h1>
            <p className="text-muted-foreground">
              Влезте в профила си, за да докладвате проблеми и да проследявате въздействието си.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Имейл адрес</Label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="pl-10 h-12 bg-card border-border"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Парола</Label>
                <Link 
                  href="/forgot-password" 
                  className="text-sm text-forest hover:text-forest/80 hover:underline"
                >
                  Забравена парола?
                </Link>
              </div>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Въведете паролата си"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="pl-10 pr-10 h-12 bg-card border-border"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-forest hover:bg-forest/90 text-white font-semibold rounded-xl shadow-md shadow-forest/20 hover:shadow-forest/30 hover:-translate-y-0.5 transition-all"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Влизане...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Вход
                  <ArrowRight size={18} />
                </span>
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-surface px-2 text-muted-foreground">или</span>
            </div>
          </div>

          {/* Register Link */}
          <p className="text-center text-muted-foreground">
            Нямате акаунт?{' '}
            <Link href="/register" className="text-forest font-medium hover:underline">
              Регистрирайте се
            </Link>
          </p>
        </div>
      </div>

      {/* Right side - Hero */}
      <div className="hidden lg:flex flex-1 bg-dark-surface relative overflow-hidden">
        {/* Background pattern */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              radial-gradient(circle at 20% 50%, rgba(122, 230, 83, 0.3) 0%, transparent 50%),
              radial-gradient(circle at 80% 80%, rgba(26, 71, 49, 0.3) 0%, transparent 50%)
            `,
          }}
        />
        
        {/* Grid pattern */}
        <div 
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center p-12 text-center">
          <div className="mb-8">
            <div className="w-24 h-24 rounded-full bg-lime/20 flex items-center justify-center mb-6 mx-auto">
              <Activity size={48} className="text-lime" />
            </div>
            <h2 className="font-heading text-4xl font-bold text-white mb-4">
              Докладвай. Проследявай. Промени.
            </h2>
            <p className="text-white/70 text-lg max-w-md">
              Заедно правим София по-чиста и по-добра за живеене. Всеки сигнал има значение.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 mt-8">
            <div className="text-center">
              <p className="font-heading text-3xl font-bold text-lime">
                {statsLoading ? '…' : `${(stats?.total_users ?? 0).toLocaleString()}+`}
              </p>
              <p className="text-white/60 text-sm mt-1">Активни граждани</p>
            </div>
            <div className="text-center">
              <p className="font-heading text-3xl font-bold text-lime">
                {statsLoading ? '…' : (stats?.total_reports ?? 0).toLocaleString()}
              </p>
              <p className="text-white/60 text-sm mt-1">Подадени сигнали</p>
            </div>
            <div className="text-center">
              <p className="font-heading text-3xl font-bold text-lime">
                {statsLoading ? '…' : `${stats?.resolved_percentage ?? 0}%`}
              </p>
              <p className="text-white/60 text-sm mt-1">Решени проблеми</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
