import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

const SESSION_COOKIE = 'admin_session'
const SESSION_MAX_AGE = 60 * 60 * 6 // 6 hours

// You can still accept a token if you want some kind of login, 
// but it’s no longer validated against an environment variable.
export async function POST(request: NextRequest) {
  const { token } = await request.json().catch(() => ({ token: undefined }))

  if (typeof token !== 'string' || token.trim().length === 0) {
    return NextResponse.json(
      { success: false, error: 'Token is required' },
      { status: 400 }
    )
  }

  // ✅ Removed admin token comparison — just set the cookie directly
  const cookieStore = await cookies()
  cookieStore.set({
    name: SESSION_COOKIE,
    value: token.trim(),
    httpOnly: true,
    maxAge: SESSION_MAX_AGE,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production'
  })

  return NextResponse.json({ success: true })
}

export async function DELETE() {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)
  return NextResponse.json({ success: true })
}
