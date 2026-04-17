'use client'

import { cn } from '@/lib/utils'
import { Sparkles, X } from 'lucide-react'
import { useEffect, useState } from 'react'

interface PointsToastProps {
  points: number
  message?: string
  onClose?: () => void
  duration?: number
  className?: string
}

export function PointsToast({
  points,
  message = 'Точки спечелени!',
  onClose,
  duration = 4000,
  className,
}: PointsToastProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [isLeaving, setIsLeaving] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLeaving(true)
      setTimeout(() => {
        setIsVisible(false)
        onClose?.()
      }, 300)
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  if (!isVisible) return null

  return (
    <div
      className={cn(
        'fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-xl shadow-xl border',
        'bg-gradient-to-r from-forest to-forest/90 text-white',
        'transform transition-all duration-300',
        isLeaving ? 'translate-y-2 opacity-0' : 'translate-y-0 opacity-100',
        className
      )}
    >
      <div className="p-2 bg-lime/20 rounded-lg">
        <Sparkles size={24} className="text-lime animate-pulse" />
      </div>

      <div>
        <p className="text-sm opacity-90">{message}</p>
        <p className="text-2xl font-heading font-bold">
          +{points} <span className="text-lg font-normal opacity-80">точки</span>
        </p>
      </div>

      <button
        onClick={() => {
          setIsLeaving(true)
          setTimeout(() => {
            setIsVisible(false)
            onClose?.()
          }, 300)
        }}
        className="p-1 hover:bg-white/10 rounded-lg transition-colors ml-2"
      >
        <X size={18} />
      </button>
    </div>
  )
}

// Demo component to show the toast
export function PointsToastDemo() {
  const [showToast, setShowToast] = useState(false)

  return (
    <div>
      <button
        onClick={() => setShowToast(true)}
        className="px-4 py-2 bg-forest text-white rounded-lg hover:bg-forest/90 transition-colors"
      >
        Show Points Toast
      </button>
      {showToast && (
        <PointsToast
          points={50}
          message="Сигналът е подаден успешно!"
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  )
}
