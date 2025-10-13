import type { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import * as config from './config'

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
  const adminToken = config.getAdminDashboardToken()
  return Boolean(token && token === adminToken)
}

export function getAdminToken() {
  return config.getAdminDashboardToken()
}
