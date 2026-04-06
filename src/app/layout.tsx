import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Footer } from '@/components/layout/Footer'
import CookieBanner from '@/components/layout/CookieBanner'
import dynamic from 'next/dynamic'
import { ToastProvider } from '@/components/ui/Toast'
import { UserProvider } from '@/contexts/UserContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'CS2Smokes',
    template: '%s | CS2Smokes',
  },
  description: 'Гранатные лайнапы для Counter-Strike 2',
  icons: {
    icon: '/favicon.svg',
    apple: '/favicon.svg',
  },
  manifest: '/manifest.json',
  themeColor: '#1a1a1a',
  openGraph: {
    type: 'website',
    locale: 'ru_RU',
  },
}

const Header = dynamic(() => import('@/components/layout/Header'), {
  ssr: false,
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body className={inter.className}>
        <ToastProvider>
          <UserProvider>
            <div className="relative flex min-h-screen flex-col">
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
            <CookieBanner />
          </UserProvider>
        </ToastProvider>
      </body>
    </html>
  )
}
