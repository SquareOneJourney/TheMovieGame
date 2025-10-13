interface EnvConfig {
  tmdbServerToken?: string
  tmdbPublicToken?: string
  adminDashboardToken?: string
  nodeEnv: 'development' | 'production' | 'test'
}

const nodeEnv = (process.env.NODE_ENV as EnvConfig['nodeEnv']) ?? 'development'

const config: EnvConfig = {
  tmdbServerToken: process.env.TMDB_BEARER_TOKEN,
  tmdbPublicToken: process.env.NEXT_PUBLIC_TMDB_BEARER_TOKEN,
  adminDashboardToken: process.env.ADMIN_DASHBOARD_TOKEN,
  nodeEnv
}

export function assertEnv(
  value: string | undefined,
  key: keyof EnvConfig
): string {
  if (!value || value.trim().length === 0) {
    throw new Error(
      `Missing required environment variable: ${String(key)}`
    )
  }

  return value
}

export function getTmdbToken(options: { publicFallback?: boolean } = {}) {
  const { publicFallback = false } = options
  if (config.tmdbServerToken?.trim()) {
    return config.tmdbServerToken
  }
  if (publicFallback && config.tmdbPublicToken?.trim()) {
    return config.tmdbPublicToken
  }
  throw new Error('TMDB bearer token is not configured')
}

export function getAdminDashboardToken() {
  return assertEnv(config.adminDashboardToken, 'adminDashboardToken')
}

export function isDevelopment() {
  return config.nodeEnv === 'development'
}

export default config
