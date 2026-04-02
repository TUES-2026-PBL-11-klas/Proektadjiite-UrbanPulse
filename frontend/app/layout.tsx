import type { Metadata, Viewport } from 'next'
import { DM_Sans, JetBrains_Mono, Syne } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const dmSans = DM_Sans({ 
  subsets: ["latin"],
  variable: '--font-dm-sans',
  display: 'swap',
})

const syne = Syne({ 
  subsets: ["latin"],
  variable: '--font-syne',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({ 
  subsets: ["latin"],
  variable: '--font-jetbrains',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'UrbanPulse | Докладвай. Проследявай. Промени.',
  description: 'Платформа за докладване и проследяване на екологични проблеми в реално време. Заедно правим София по-чиста.',
  keywords: ['екология', 'София', 'граждански сигнали', 'замърсяване', 'околна среда', 'UrbanPulse'],
  authors: [{ name: 'UrbanPulse Team' }],
  openGraph: {
    title: 'UrbanPulse | Докладвай. Проследявай. Промени.',
    description: 'Платформа за докладване и проследяване на екологични проблеми в реално време.',
    type: 'website',
  },
}

export const viewport: Viewport = {
  themeColor: '#1A4731',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="bg" className={`${dmSans.variable} ${syne.variable} ${jetbrainsMono.variable}`}>
      <body className="font-sans antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  )
}
