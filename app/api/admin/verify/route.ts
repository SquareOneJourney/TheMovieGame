import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getCurrentUser } from '@/lib/supabase-auth'

// List of authorized admin user emails
const ADMIN_USERS = [
  process.env.ADMIN_EMAIL || 'davis@example.com', // Set ADMIN_EMAIL in your .env.local
  // Add more admin emails as needed
]

export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated with Supabase
    const { user, error } = await getCurrentUser()
    
    if (error || !user) {
      return NextResponse.json({ authenticated: false }, { status: 401 })
    }

    // Check if user is in admin list
    const isAdmin = ADMIN_USERS.includes(user.email || '')
    
    if (!isAdmin) {
      return NextResponse.json({ authenticated: false, reason: 'Not authorized' }, { status: 403 })
    }

    // Check admin session cookie
    const cookieStore = await cookies()
    const adminAuth = cookieStore.get('admin-auth')

    if (adminAuth?.value === 'true') {
      return NextResponse.json({ authenticated: true })
    } else {
      return NextResponse.json({ authenticated: false }, { status: 401 })
    }
  } catch (error) {
    return NextResponse.json({ authenticated: false }, { status: 500 })
  }
}
