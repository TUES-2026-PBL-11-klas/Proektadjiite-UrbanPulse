'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/navbar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/context/auth-context'
import { apiPatch } from '@/lib/api'
import { type User, type UserLevel } from '@/lib/mock-data'
import { User as UserIcon, Lock, Save } from 'lucide-react'

interface BackendUser {
  id: string
  email: string
  display_name: string
  role: 'citizen' | 'admin'
  points: number
  level: number
  created_at?: string
}

interface UpdateResponse {
  token: string
  user: BackendUser
}

export default function SettingsPage() {
  const { user, token, updateUser, isLoading: authLoading } = useAuth()
  const router = useRouter()

  const [displayName, setDisplayName] = useState('')
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileError, setProfileError] = useState<string | null>(null)
  const [profileSuccess, setProfileSuccess] = useState(false)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordSuccess, setPasswordSuccess] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/signin')
    }
    if (user) {
      setDisplayName(user.displayName)
    }
  }, [authLoading, user, router])

  if (authLoading || !user) return null

  async function handleProfileSave(e: React.FormEvent) {
    e.preventDefault()
    setProfileError(null)
    setProfileSuccess(false)
    setProfileSaving(true)
    try {
      const { token: newToken, user: updated } = await apiPatch<UpdateResponse>(
        '/api/auth/me',
        { display_name: displayName },
        token ?? undefined
      )
      updateUser(
        {
          id: updated.id,
          email: updated.email,
          displayName: updated.display_name,
          role: updated.role,
          points: updated.points,
          level: updated.level as UserLevel,
          createdAt: updated.created_at ?? user.createdAt,
        },
        newToken
      )
      setProfileSuccess(true)
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : 'Грешка при запис')
    } finally {
      setProfileSaving(false)
    }
  }

  async function handlePasswordSave(e: React.FormEvent) {
    e.preventDefault()
    setPasswordError(null)
    setPasswordSuccess(false)
    setPasswordSaving(true)
    try {
      const { token: newToken, user: updated } = await apiPatch<UpdateResponse>(
        '/api/auth/me',
        { current_password: currentPassword, new_password: newPassword },
        token ?? undefined
      )
      updateUser(
        {
          id: updated.id,
          email: updated.email,
          displayName: updated.display_name,
          role: updated.role,
          points: updated.points,
          level: updated.level as UserLevel,
          createdAt: updated.created_at ?? user.createdAt,
        },
        newToken
      )
      setCurrentPassword('')
      setNewPassword('')
      setPasswordSuccess(true)
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : 'Грешка при смяна на парола')
    } finally {
      setPasswordSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />

      <main className="max-w-2xl mx-auto px-4 pt-24 pb-12">
        <h1 className="font-heading text-3xl font-bold mb-8">Настройки</h1>

        {/* Profile section */}
        <div className="bg-card rounded-2xl border p-6 mb-6">
          <h2 className="font-heading font-semibold text-lg mb-5 flex items-center gap-2">
            <UserIcon size={20} className="text-forest" />
            Профилна информация
          </h2>

          <form onSubmit={handleProfileSave} className="space-y-4">
            {profileError && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">
                {profileError}
              </div>
            )}
            {profileSuccess && (
              <div className="p-3 rounded-lg bg-lime/10 border border-lime/20 text-sm text-forest">
                Профилът е обновен успешно.
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Имейл адрес</Label>
              <Input
                id="email"
                type="email"
                value={user.email}
                disabled
                className="bg-muted text-muted-foreground"
              />
              <p className="text-xs text-muted-foreground">Имейлът не може да се промени.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="displayName">Показвано име</Label>
              <Input
                id="displayName"
                type="text"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                required
              />
            </div>

            <Button
              type="submit"
              disabled={profileSaving || displayName.trim() === user.displayName}
              className="bg-forest text-white hover:bg-forest/90"
            >
              <Save size={16} className="mr-2" />
              {profileSaving ? 'Запазване...' : 'Запази промените'}
            </Button>
          </form>
        </div>

        {/* Password section */}
        <div className="bg-card rounded-2xl border p-6">
          <h2 className="font-heading font-semibold text-lg mb-5 flex items-center gap-2">
            <Lock size={20} className="text-forest" />
            Смяна на парола
          </h2>

          <form onSubmit={handlePasswordSave} className="space-y-4">
            {passwordError && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">
                {passwordError}
              </div>
            )}
            {passwordSuccess && (
              <div className="p-3 rounded-lg bg-lime/10 border border-lime/20 text-sm text-forest">
                Паролата е сменена успешно.
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="currentPassword">Текуща парола</Label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">Нова парола</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                required
                minLength={8}
              />
              <p className="text-xs text-muted-foreground">Минимум 8 символа.</p>
            </div>

            <Button
              type="submit"
              disabled={passwordSaving || !currentPassword || !newPassword}
              className="bg-forest text-white hover:bg-forest/90"
            >
              <Lock size={16} className="mr-2" />
              {passwordSaving ? 'Запазване...' : 'Смени паролата'}
            </Button>
          </form>
        </div>
      </main>
    </div>
  )
}
