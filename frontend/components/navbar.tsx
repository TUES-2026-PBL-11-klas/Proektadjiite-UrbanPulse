'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Activity, Menu, X, User, LogOut, Settings, LayoutDashboard } from 'lucide-react'
import { useState } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { type User as UserType, mockCurrentUser } from '@/lib/mock-data'
import { LevelBadge } from './level-badge'
import { useAuth } from '@/context/auth-context'

interface NavbarProps {
  user?: UserType | null
  transparent?: boolean
  className?: string
}

export function Navbar({ user, transparent = false, className }: NavbarProps) {
  const { user: contextUser, logout } = useAuth()
  const effectiveUser = user !== undefined ? user : contextUser
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <nav 
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-colors duration-300',
        transparent ? 'bg-dark-surface/80 backdrop-blur-md' : 'bg-dark-surface',
        className
      )}
    >
      <div className="w-full px-3 sm:px-4 lg:px-6 xl:px-8">
        <div className="grid h-16 grid-cols-[auto_1fr_auto] items-center gap-3 lg:gap-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative">
              <Activity size={28} className="text-lime" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-lime rounded-full animate-ping" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-lime rounded-full" />
            </div>
            <span className="font-heading font-bold text-xl text-white group-hover:text-lime transition-colors">
              UrbanPulse
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center justify-self-center gap-8">
            <Link 
              href="/" 
              className="text-white/80 hover:text-lime transition-colors font-medium"
            >
              Карта
            </Link>
            <Link 
              href="/about" 
              className="text-white/80 hover:text-lime transition-colors font-medium"
            >
              За нас
            </Link>
          </div>

          {/* Desktop Auth / User Menu */}
          <div className="hidden md:flex items-center justify-self-end gap-2">
            {effectiveUser ? (
              <>
                {effectiveUser.role === 'admin' && (
                  <Link href="/admin">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white/70 hover:text-white hover:bg-white/8 rounded-lg transition-all"
                    >
                      <LayoutDashboard size={15} className="mr-1.5" />
                      Админ
                    </Button>
                  </Link>
                )}

                {effectiveUser.role !== 'admin' && (
                  <Link href="/report">
                    <Button className="bg-lime text-forest hover:bg-lime/90 font-semibold rounded-lg shadow-sm shadow-lime/20 transition-all hover:shadow-lime/30">
                      Докладвай проблем
                    </Button>
                  </Link>
                )}

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl bg-white/8 hover:bg-white/14 border border-white/10 hover:border-white/20 transition-all">
                      <div className="w-7 h-7 rounded-lg bg-forest flex items-center justify-center text-white font-medium text-xs">
                        {effectiveUser.displayName.charAt(0)}
                      </div>
                      <div className="text-left hidden lg:block">
                        <p className="text-xs font-medium text-white leading-tight">
                          {effectiveUser.displayName}
                        </p>
                        <p className="text-[11px] text-lime leading-tight">
                          {effectiveUser.role === 'admin' ? 'Администратор' : `${effectiveUser.points} точки`}
                        </p>
                      </div>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-3 py-2">
                      <p className="text-sm font-medium">{effectiveUser.displayName}</p>
                      <p className="text-xs text-muted-foreground">{effectiveUser.email}</p>
                      {effectiveUser.role !== 'admin' && (
                        <div className="mt-2">
                          <LevelBadge level={effectiveUser.level} size="sm" />
                        </div>
                      )}
                    </div>
                    <DropdownMenuSeparator />
                    {effectiveUser.role !== 'admin' && (
                      <DropdownMenuItem asChild>
                        <Link href="/profile" className="cursor-pointer">
                          <User size={16} className="mr-2" />
                          Моят профил
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem asChild>
                      <Link href="/settings" className="cursor-pointer">
                        <Settings size={16} className="mr-2" />
                        Настройки
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive cursor-pointer" onClick={logout}>
                      <LogOut size={16} className="mr-2" />
                      Изход
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Link href="/signin">
                  <Button
                    variant="outline"
                    className="border-white/15 text-white/80 hover:text-white hover:bg-white/8 hover:border-white/25 rounded-lg transition-all bg-transparent"
                  >
                    Вход
                  </Button>
                </Link>
                <Link href="/report">
                  <Button className="bg-lime text-forest hover:bg-lime/90 font-semibold rounded-lg shadow-sm shadow-lime/20 hover:shadow-lime/30 transition-all">
                    Докладвай проблем
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-dark-surface border-t border-white/10">
          <div className="px-4 py-4 space-y-3">
            <Link 
              href="/" 
              className="block py-2 text-white/80 hover:text-lime transition-colors font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Карта
            </Link>
            <Link 
              href="/about" 
              className="block py-2 text-white/80 hover:text-lime transition-colors font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              За нас
            </Link>
            
            <div className="pt-3 border-t border-white/10 space-y-3">
              {effectiveUser ? (
                <>
                  <div className="flex items-center gap-3 py-2">
                    <div className="w-10 h-10 rounded-full bg-forest flex items-center justify-center text-white font-medium">
                      {effectiveUser.displayName.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{effectiveUser.displayName}</p>
                      <p className="text-xs text-lime">
                        {effectiveUser.role === 'admin' ? 'Администратор' : `${effectiveUser.points} точки`}
                      </p>
                    </div>
                  </div>
                  {effectiveUser.role !== 'admin' && (
                    <Link
                      href="/profile"
                      className="block py-2 text-white/80 hover:text-lime transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Моят профил
                    </Link>
                  )}
                  {effectiveUser.role === 'admin' && (
                    <Link
                      href="/admin"
                      className="block py-2 text-white/80 hover:text-lime transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Админ панел
                    </Link>
                  )}
                  {effectiveUser.role !== 'admin' && (
                    <Link href="/report" onClick={() => setMobileMenuOpen(false)}>
                      <Button className="w-full bg-lime text-forest hover:bg-lime/90 font-semibold">
                        Докладвай проблем
                      </Button>
                    </Link>
                  )}
                </>
              ) : (
                <>
                  <Link href="/signin" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full border-white/30 text-white hover:bg-white/10">
                      Вход
                    </Button>
                  </Link>
                  <Link href="/report" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full bg-lime text-forest hover:bg-lime/90 font-semibold">
                      Докладвай проблем
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}

// Variant with logged in user for demo
export function NavbarDemo() {
  return <Navbar user={mockCurrentUser} />
}
