'use client'
import { SessionProvider as NextAuthProvider } from 'next-auth/react'
import { AppToaster } from '@/components/providers/AppToaster'

export function SessionProvider({ children, session }: { children: React.ReactNode; session: any }) {
  return (
    <NextAuthProvider session={session}>
      {children}
      <AppToaster />
    </NextAuthProvider>
  )
}
