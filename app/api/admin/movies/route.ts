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
    
    console.log('API: Received movies update request with', movies.length, 'movies')
    
    const dbPath = path.join(process.cwd(), 'data', 'movies-database.json')
    
    // Backup the current file before writing
    const backupPath = path.join(process.cwd(), 'data', 'movies-database-backup.json')
    if (fs.existsSync(dbPath)) {
      fs.copyFileSync(dbPath, backupPath)
    }
    
    // Write the new data
    fs.writeFileSync(dbPath, JSON.stringify(movies, null, 2))
    
    // Verify the write was successful
    const writtenData = JSON.parse(fs.readFileSync(dbPath, 'utf8'))
    console.log('API: Successfully wrote', writtenData.length, 'movies to database')
    
    return NextResponse.json({ success: true, count: movies.length })
  } catch (error) {
    console.error('API: Error updating movies:', error)
    return NextResponse.json({ error: 'Failed to update movies', details: error.message }, { status: 500 })
  }
}

// Add a new movie to the database
export async function POST(request: NextRequest) {
  if (!(await verifyAdmin(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const newMovie = await request.json()
    const dbPath = path.join(process.cwd(), 'data', 'movies-database.json')
    const movies = JSON.parse(fs.readFileSync(dbPath, 'utf8'))
    movies.push(newMovie)
    fs.writeFileSync(dbPath, JSON.stringify(movies, null, 2), 'utf8')
    return NextResponse.json({ success: true, movie: newMovie })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add movie' }, { status: 500 })
  }
}

// Delete a movie from the database
export async function DELETE(request: NextRequest) {
  if (!(await verifyAdmin(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { movieTitle } = await request.json()
    const dbPath = path.join(process.cwd(), 'data', 'movies-database.json')
    let movies = JSON.parse(fs.readFileSync(dbPath, 'utf8'))
    movies = movies.filter((movie: any) => movie.movie !== movieTitle)
    fs.writeFileSync(dbPath, JSON.stringify(movies, null, 2), 'utf8')
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete movie' }, { status: 500 })
  }
}
