'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Activity, Mail, Lock, Eye, EyeOff, ArrowRight, User, Check, Award, TrendingUp, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })

  // Password strength indicator
  const getPasswordStrength = (password: string) => {
    let strength = 0
    if (password.length >= 8) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/[0-9]/.test(password)) strength++
    if (/[^A-Za-z0-9]/.test(password)) strength++
    return strength
  }

  const passwordStrength = getPasswordStrength(formData.password)
  const strengthLabels = ['Много слаба', 'Слаба', 'Добра', 'Силна', 'Много силна']
  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-lime', 'bg-green-500']

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.password !== formData.confirmPassword) {
      return
    }
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 1500))
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - Hero (reversed from sign in) */}
      <div className="hidden lg:flex flex-1 bg-dark-surface relative overflow-hidden">
        {/* Background pattern */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              radial-gradient(circle at 80% 20%, rgba(122, 230, 83, 0.4) 0%, transparent 50%),
              radial-gradient(circle at 20% 80%, rgba(26, 71, 49, 0.3) 0%, transparent 50%)
            `,
          }}
        />
        
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

        <div className="relative z-10 flex flex-col justify-center p-12">
          <div className="mb-12">
            <h2 className="font-heading text-4xl font-bold text-white mb-4">
              Станете част от общността
            </h2>
            <p className="text-white/70 text-lg max-w-md">
              Присъединете се към над 1,200 активни граждани, които правят София по-добро място за живеене.
            </p>
          </div>

          {/* Benefits */}
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-lime/20 flex items-center justify-center shrink-0">
                <Award size={24} className="text-lime" />
              </div>
              <div>
                <h3 className="font-semibold text-white mb-1">Печелете точки и нива</h3>
                <p className="text-white/60 text-sm">
                  Всяко действие се възнаграждава. Качете се от Наблюдател до Еко Шампион!
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-lime/20 flex items-center justify-center shrink-0">
                <TrendingUp size={24} className="text-lime" />
              </div>
              <div>
                <h3 className="font-semibold text-white mb-1">Проследявайте въздействието си</h3>
                <p className="text-white/60 text-sm">
                  Вижте как вашите сигнали водят до реални промени в града.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-lime/20 flex items-center justify-center shrink-0">
                <Users size={24} className="text-lime" />
              </div>
              <div>
                <h3 className="font-semibold text-white mb-1">Част от общността</h3>
                <p className="text-white/60 text-sm">
                  Свържете се с други активни граждани и работете заедно за промяна.
                </p>
              </div>
            </div>
          </div>

          {/* Testimonial */}
          <div className="mt-12 p-6 bg-white/5 rounded-2xl border border-white/10">
            <p className="text-white/80 italic mb-4">
              "Благодарение на UrbanPulse успяхме да премахнем нелегално сметище, което съществуваше с години. Системата работи!"
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-lime/30 flex items-center justify-center text-lime font-semibold">
                М
              </div>
              <div>
                <p className="text-white font-medium">Мария Г.</p>
                <p className="text-white/50 text-sm">Еко Шампион, Младост</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-surface overflow-y-auto">
        <div className="w-full max-w-md py-8">
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
              Създайте акаунт
            </h1>
            <p className="text-muted-foreground">
              Регистрирайте се безплатно и започнете да допринасяте за по-чиста София.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name">Пълно име</Label>
              <div className="relative">
                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="name"
                  type="text"
                  placeholder="Иван Петров"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="pl-10 h-12 bg-card border-border"
                  required
                />
              </div>
            </div>

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
              <Label htmlFor="password">Парола</Label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Минимум 8 символа"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="pl-10 pr-10 h-12 bg-card border-border"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {/* Password strength indicator */}
              {formData.password && (
                <div className="space-y-1.5">
                  <div className="flex gap-1">
                    {[0, 1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className={cn(
                          'h-1 flex-1 rounded-full transition-colors',
                          i < passwordStrength ? strengthColors[passwordStrength] : 'bg-muted'
                        )}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Сила на паролата: {strengthLabels[passwordStrength]}
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Потвърдете паролата</Label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Повторете паролата"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className={cn(
                    'pl-10 pr-10 h-12 bg-card border-border',
                    formData.confirmPassword && formData.password !== formData.confirmPassword && 'border-destructive'
                  )}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <p className="text-xs text-destructive">Паролите не съвпадат</p>
              )}
              {formData.confirmPassword && formData.password === formData.confirmPassword && formData.confirmPassword.length >= 8 && (
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <Check size={12} /> Паролите съвпадат
                </p>
              )}
            </div>

            {/* Terms checkbox */}
            <div className="flex items-start gap-3 py-2">
              <Checkbox
                id="terms"
                checked={agreedToTerms}
                onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                className="mt-0.5 data-[state=checked]:bg-forest data-[state=checked]:border-forest"
              />
              <label htmlFor="terms" className="text-sm text-muted-foreground leading-tight cursor-pointer">
                Съгласявам се с{' '}
                <Link href="/terms" className="text-forest hover:underline">
                  Условията за ползване
                </Link>{' '}
                и{' '}
                <Link href="/privacy" className="text-forest hover:underline">
                  Политиката за поверителност
                </Link>
              </label>
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 bg-forest hover:bg-forest/90 text-white font-semibold"
              disabled={isLoading || !agreedToTerms || formData.password !== formData.confirmPassword}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Създаване на акаунт...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Регистрация
                  <ArrowRight size={18} />
                </span>
              )}
            </Button>
          </form>

          {/* Gamification teaser */}
          <div className="mt-6 p-4 bg-lime/10 border border-lime/30 rounded-xl">
            <p className="text-sm text-forest text-center">
              <span className="font-semibold">Присъединете се към 1,200+ активни граждани.</span>
              {' '}Печелете точки, отключвайте нива и направете София по-чиста.
            </p>
          </div>

          {/* Sign in link */}
          <p className="text-center text-muted-foreground mt-6">
            Вече имате акаунт?{' '}
            <Link href="/signin" className="text-forest font-medium hover:underline">
              Влезте
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
