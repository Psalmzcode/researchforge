import './globals.css'
import { SessionProvider } from '@/components/layout/SessionProvider'
import { auth } from '@/lib/auth'
import { ThemeScript } from '@/components/layout/ThemeScript'

export const metadata = {
  title: 'ResearchForge — Turning African evidence into decisions that work.',
  description: 'ResearchForge generates field-based data, research and intelligence that help governments, investors, development organizations and businesses design, finance and scale sustainable solutions across Africa.',
  icons: {
    icon: '/researchforge-logo.png',
    apple: '/researchforge-logo.png',
  },
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
