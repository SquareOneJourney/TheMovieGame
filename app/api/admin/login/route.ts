import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getCurrentUser } from '@/lib/supabase-auth'

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123'

// List of authorized admin user emails
const ADMIN_USERS = [
  process.env.ADMIN_EMAIL || 'davis@example.com', // Set ADMIN_EMAIL in your .env.local
  // Add more admin emails as needed
]

export async function POST(request: NextRequest) {
  try {
    // First check if user is authenticated and authorized
    const { user, error } = await getCurrentUser()
    
    if (error || !user) {
      return NextResponse.json({ error: 'Must be logged in to access admin panel' }, { status: 401 })
    }

    // Check if user is in admin list
    const isAdmin = ADMIN_USERS.includes(user.email || '')
    
    if (!isAdmin) {
      return NextResponse.json({ error: 'Not authorized to access admin panel' }, { status: 403 })
    }

    const { password } = await request.json()

    if (password === ADMIN_PASSWORD) {
      // Set admin session cookie (expires in 24 hours)
      const cookieStore = await cookies()
      cookieStore.set('admin-auth', 'true', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 // 24 hours
      })

      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
    }
  } catch (error) {
    return NextResponse.json({ error: 'Login failed' }, { status: 500 })
  }
}
