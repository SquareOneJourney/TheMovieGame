import type { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { getAdminDashboardToken } from './config'

const ADMIN_TOKEN = getAdminDashboardToken()

export async function extractAdminToken(request: NextRequest) {
  const headerAuth = request.headers.get('authorization')
  if (headerAuth?.startsWith('Bearer ')) {
    return headerAuth.slice(7).trim()
  }

  const explicitHeader = request.headers.get('x-admin-token')
  if (explicitHeader) {
    return explicitHeader.trim()
  }

  // ✅ await the cookies() call
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get('admin_session')?.value
  if (sessionToken) {
    return sessionToken.trim()
  }

  return null
}

export async function isAdminRequest(request: NextRequest) {
  const token = await extractAdminToken(request)
  return Boolean(token && token === ADMIN_TOKEN)
}

export function getAdminToken() {
  return ADMIN_TOKEN
}
