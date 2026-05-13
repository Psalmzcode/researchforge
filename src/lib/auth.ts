import NextAuth from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { Role } from '@prisma/client'
import { db } from '@/lib/db'

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: { email: { label: 'Email', type: 'email' }, password: { label: 'Password', type: 'password' } },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        const email = (credentials.email as string).trim().toLowerCase()
        const user = await db.user.findUnique({ where: { email } })
        if (!user || !user.password) return null
        if (user.role === Role.CLIENT && !user.emailVerified) return null
        const valid = await bcrypt.compare(credentials.password as string, user.password)
        if (!valid) return null
        return { id: user.id, email: user.email, name: user.name, role: user.role }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role ?? 'CLIENT'
        token.email = user.email
        token.name = user.name
      }
      if (!token.role) token.role = 'CLIENT'
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        ;(session.user as any).id = (session.user as any).id ?? token.id
        ;(session.user as any).role = (token.role as string) ?? (session.user as any).role ?? 'CLIENT'
        return session
      }
      if (token.id && token.email) {
        session.user = {
          id: token.id as string,
          email: token.email as string,
          name: (token.name as string | null) ?? null,
          role: (token.role as string) ?? 'CLIENT',
        } as any
      }
      return session
    },
  },
})
