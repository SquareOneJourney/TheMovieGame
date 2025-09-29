import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import fs from 'fs'
import path from 'path'
import { getCurrentUser } from '@/lib/supabase-auth'

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123'

// List of authorized admin user emails
const ADMIN_USERS = [
  process.env.ADMIN_EMAIL || 'davis@example.com', // Set ADMIN_EMAIL in your .env.local
  // Add more admin emails as needed
]

// Verify admin authentication
async function verifyAdmin(request: NextRequest) {
  // First check if user is authenticated and authorized
  const { user, error } = await getCurrentUser()
  
  if (error || !user) {
    return false
  }

  // Check if user is in admin list
  const isAdmin = ADMIN_USERS.includes(user.email || '')
  
  if (!isAdmin) {
    return false
  }

  // Check admin session cookie
  const cookieStore = await cookies()
  const adminAuth = cookieStore.get('admin-auth')
  return adminAuth?.value === 'true'
}

// Get movies from database
export async function GET(request: NextRequest) {
  if (!(await verifyAdmin(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const dbPath = path.join(process.cwd(), 'data', 'movies-database.json')
    const movies = JSON.parse(fs.readFileSync(dbPath, 'utf8'))
    
    return NextResponse.json({ movies })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to load movies' }, { status: 500 })
  }
}

// Update movies in database
export async function PUT(request: NextRequest) {
  if (!(await verifyAdmin(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { movies } = await request.json()
    
    const dbPath = path.join(process.cwd(), 'data', 'movies-database.json')
    fs.writeFileSync(dbPath, JSON.stringify(movies, null, 2))
    
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update movies' }, { status: 500 })
  }
}
