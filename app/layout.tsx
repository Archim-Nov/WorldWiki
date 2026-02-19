import type { Metadata } from 'next'
import { Geist, Geist_Mono, Cinzel } from 'next/font/google'
import { ThemeProvider } from '@/components/layout/ThemeProvider'
import { ViewTransitionRouter } from '@/components/layout'
import { getSiteUrl } from '@/lib/site-url'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

const cinzel = Cinzel({
  variable: '--font-cinzel',
  weight: ['400', '600', '700'],
  subsets: ['latin'],
})

const siteDescription = 'WorldWiki - 博物馆宇宙与游戏网状百科'

export const metadata: Metadata = {
  metadataBase: getSiteUrl(),
  title: {
    default: 'WorldWiki',
    template: '%s | WorldWiki',
  },
  description: siteDescription,
  openGraph: {
    title: 'WorldWiki',
    description: siteDescription,
    siteName: 'WorldWiki',
    type: 'website',
    locale: 'zh_CN',
    url: '/',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'WorldWiki Open Graph Image',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WorldWiki',
    description: siteDescription,
    images: ['/twitter-image'],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${cinzel.variable} antialiased`}
      >
        <ThemeProvider>
          <ViewTransitionRouter />
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
