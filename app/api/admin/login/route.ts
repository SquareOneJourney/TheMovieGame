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
    const { password, userEmail } = await request.json()

    // Check if user email is provided and in admin list
    if (!userEmail) {
      return NextResponse.json({ error: 'User email required' }, { status: 400 })
    }

    const isAdmin = ADMIN_USERS.includes(userEmail)
    
    if (!isAdmin) {
      return NextResponse.json({ error: 'Not authorized to access admin panel' }, { status: 403 })
    }

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
