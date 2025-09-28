import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Analytics } from '@vercel/analytics/react'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'The Movie Game',
  description: 'A two-player, turn-based movie trivia game',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* Standard favicon */}
        <link rel="icon" type="image/png" sizes="16x16" href="/MovieGame Favicon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/MovieGame Favicon.png" />
        <link rel="icon" type="image/png" sizes="48x48" href="/MovieGame Favicon.png" />
        
        {/* For high-DPI (retina) screens */}
        <link rel="icon" type="image/png" sizes="192x192" href="/MovieGame Favicon.png" />
        
        {/* Apple devices (bigger icons on home screens) */}
        <link rel="apple-touch-icon" sizes="180x180" href="/MovieGame Favicon.png" />
      </head>
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  )
}