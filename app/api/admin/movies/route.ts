import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import fs from 'fs'
import path from 'path'

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123'

// Verify admin authentication
function verifyAdmin(request: NextRequest) {
  const cookieStore = cookies()
  const adminAuth = cookieStore.get('admin-auth')
  return adminAuth?.value === 'true'
}

// Get movies from database
export async function GET(request: NextRequest) {
  if (!verifyAdmin(request)) {
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
  if (!verifyAdmin(request)) {
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
