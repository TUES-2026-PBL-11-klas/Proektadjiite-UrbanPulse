'use client'

import Link from 'next/link'
import { Activity, Twitter, Github, Linkedin, Heart } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-dark-surface text-white py-16">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="relative">
                <Activity size={28} className="text-lime" />
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-lime rounded-full" />
              </div>
              <span className="font-heading font-bold text-xl">UrbanPulse</span>
            </Link>
            <p className="text-white/60 text-sm leading-relaxed max-w-sm mb-6">
              Гражданска платформа за докладване и проследяване на екологични проблеми в реално време.
              Заедно правим София по-чиста.
            </p>
            <div className="flex items-center gap-3">
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:bg-lime hover:text-forest transition-colors">
                <Twitter size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:bg-lime hover:text-forest transition-colors">
                <Github size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:bg-lime hover:text-forest transition-colors">
                <Linkedin size={18} />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-heading font-semibold mb-4">Платформа</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/" className="text-white/60 hover:text-lime transition-colors">Карта</Link></li>
              <li><Link href="/report" className="text-white/60 hover:text-lime transition-colors">Докладвай</Link></li>
              <li><Link href="/about" className="text-white/60 hover:text-lime transition-colors">За нас</Link></li>
              <li><a href="#" className="text-white/60 hover:text-lime transition-colors">API документация</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-semibold mb-4">Правни</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="text-white/60 hover:text-lime transition-colors">Условия за ползване</a></li>
              <li><a href="#" className="text-white/60 hover:text-lime transition-colors">Политика за поверителност</a></li>
              <li><a href="#" className="text-white/60 hover:text-lime transition-colors">Бисквитки</a></li>
              <li><a href="#" className="text-white/60 hover:text-lime transition-colors">Контакти</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-white/40">
          <p>&copy; 2024 UrbanPulse. Всички права запазени.</p>
          <p>Направено с <Heart size={14} className="inline text-lime" /> в София</p>
        </div>
      </div>
    </footer>
  )
}
