import { getServerSession, type NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'

import { isAdminEmail } from '@/lib/permissions'

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID ?? '',
      clientSecret: process.env.AUTH_GOOGLE_SECRET ?? '',
    }),
  ],
  secret: process.env.AUTH_SECRET,
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/admin/login',
  },
  callbacks: {
    async signIn({ user }) {
      return isAdminEmail(user.email)
    },
  },
}

export function getAdminSession() {
  return getServerSession(authOptions)
}

export async function requireAdmin() {
  const session = await getAdminSession()

  if (!isAdminEmail(session?.user?.email)) {
    throw new Error('Administrator authorization required')
  }

  return session
}
