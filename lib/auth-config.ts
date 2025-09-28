import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { createClient } from '@supabase/supabase-js'
import { prisma } from '@/lib/prisma'

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required')
        }

        // Create Supabase client for server-side operations
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          {
            auth: {
              autoRefreshToken: false,
              persistSession: false
            }
          }
        )

        try {
          console.log('Attempting to sign in with Supabase:', { email: credentials.email })
          
          // Sign in with Supabase
          const { data, error } = await supabase.auth.signInWithPassword({
            email: credentials.email,
            password: credentials.password,
          })

          console.log('Supabase auth response:', { data, error })

          if (error) {
            console.error('Supabase auth error:', error)
            throw new Error('Invalid email or password')
          }

          if (!data.user) {
            console.error('No user returned from Supabase')
            throw new Error('Authentication failed')
          }

          // Check if email is confirmed (only in production)
          if (process.env.NODE_ENV === 'production' && data.user.email_confirmed_at === null) {
            throw new Error('Please check your email and confirm your account before signing in')
          }

          // Ensure user exists in our database
          let dbUser = await prisma.user.findUnique({
            where: { id: data.user.id }
          })

          // If user doesn't exist in our database, create them
          if (!dbUser) {
            dbUser = await prisma.user.create({
              data: {
                id: data.user.id,
                name: data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'User',
                email: data.user.email!,
                password: '' // We don't store passwords in our DB, Supabase handles this
              }
            })
          }

          return {
            id: data.user.id,
            email: data.user.email,
            name: data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'User',
          }
        } catch (error) {
          console.error('Authentication error:', error)
          throw error
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
      }
      return session
    },
  },
  pages: {
    signIn: '/',
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
}
