import type { Metadata } from 'next'
import './globals.css'
import { SessionProvider } from '@/components/layout/SessionProvider'
import { auth } from '@/lib/auth'
import { ThemeScript } from '@/components/layout/ThemeScript'

export const metadata: Metadata = {
  title: 'ResearchForge Consulting',
  description: 'Data-Driven Research, Strategy & Sustainable Solutions',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  return (
    <html lang="en" suppressHydrationWarning>
      <head><ThemeScript /></head>
      <body>
        <SessionProvider session={session}>
          {children}
        </SessionProvider>
      </body>
    </html>
  )
}
