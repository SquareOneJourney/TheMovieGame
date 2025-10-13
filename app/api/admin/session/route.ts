import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { getAdminToken } from '@/lib/adminAuth'

const SESSION_COOKIE = 'admin_session'
const SESSION_MAX_AGE = 60 * 60 * 6 // 6 hours

export async function POST(request: NextRequest) {
  const { token } = await request.json().catch(() => ({ token: undefined }))

  if (typeof token !== 'string' || token.trim().length === 0) {
    return NextResponse.json(
      { success: false, error: 'Token is required' },
      { status: 400 }
    )
  }

  if (token.trim() !== getAdminToken()) {
    return NextResponse.json(
      { success: false, error: 'Invalid token' },
      { status: 401 }
    )
  }

  cookies().set({
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
  cookies().delete(SESSION_COOKIE)
  return NextResponse.json({ success: true })
}
