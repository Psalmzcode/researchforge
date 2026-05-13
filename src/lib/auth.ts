import NextAuth from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { Role } from '@prisma/client'
import { db } from '@/lib/db'

/**
 * Gmail / Googlemail ignore `.` and `+tag` in the local part. The DB stores a single canonical
 * address (e.g. seed), but users often type dotted variants — `findUnique` would miss without this.
 */
function canonicalGmailLocalPart(local: string): string {
  const plus = local.indexOf('+')
  const base = plus >= 0 ? local.slice(0, plus) : local
  return base.replace(/\./g, '')
}

function userWhereByCredentialEmail(trimmedLower: string) {
  const at = trimmedLower.lastIndexOf('@')
  if (at <= 0) return { email: trimmedLower }
  const local = trimmedLower.slice(0, at)
  const domain = trimmedLower.slice(at + 1)
  if (domain !== 'gmail.com' && domain !== 'googlemail.com') {
    return { email: trimmedLower }
  }
  const canon = `${canonicalGmailLocalPart(local)}@gmail.com`
  if (canon === trimmedLower) return { email: trimmedLower }
  return { OR: [{ email: trimmedLower }, { email: canon }] }
}

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
        const password = (credentials.password as string).trim()
        const user = await db.user.findFirst({ where: userWhereByCredentialEmail(email) })
        if (!user || !user.password) return null
        if (user.role === Role.CLIENT && user.emailVerified == null) return null
        const valid = await bcrypt.compare(password, user.password)
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
