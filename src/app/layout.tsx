import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/layout/Providers'

const geistSans = Geist({ subsets: ['latin'], variable: '--font-geist-sans' })
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' })

export const metadata: Metadata = {
  title: {
    default: 'WatchFast AI — Find what to watch in 10 seconds',
    template: '%s | WatchFast AI',
  },
  description: 'AI-powered recommendations for Netflix, Prime, Disney+, YouTube, and Crunchyroll. Perfect pick in under 10 seconds.',
  keywords: ['movie recommendations', 'what to watch', 'AI recommendations', 'Netflix', 'streaming'],
  openGraph: {
    type: 'website',
    siteName: 'WatchFast AI',
    title: 'WatchFast AI',
    description: 'Find the perfect movie or show in under 10 seconds.',
  },
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true },
}

export const viewport: Viewport = {
  themeColor: '#0a0a0f',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
