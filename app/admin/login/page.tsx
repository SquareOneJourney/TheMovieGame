/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'

export default function AdminLoginPage() {
  const router = useRouter()
  const [token, setToken] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!token.trim()) {
      setError('Enter the admin access token')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/admin/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token: token.trim() })
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        setError(data?.error ?? 'Invalid token')
        setIsSubmitting(false)
        return
      }

      router.replace('/admin')
    } catch (err) {
      console.error('Admin login failed', err)
      setError('Unexpected error. Please try again.')
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md rounded-2xl bg-black/40 backdrop-blur border border-white/10 shadow-2xl p-8"
      >
        <h1 className="text-3xl font-bold text-white text-center mb-6">
          Admin Console Access
        </h1>
        <p className="text-sm text-slate-300 text-center mb-8">
          Enter the one-time admin token to manage the movie library.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="token" className="block text-sm font-medium text-slate-200 mb-2">
              Admin token
            </label>
            <input
              id="token"
              type="password"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
              placeholder="••••••••••••"
              value={token}
              onChange={event => setToken(event.target.value)}
              disabled={isSubmitting}
            />
          </div>

          {error && (
            <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <Button
            type="submit"
            className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold py-3 rounded-lg transition-colors"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Signing in…' : 'Unlock Admin Console'}
          </Button>
        </form>
      </motion.div>
    </div>
  )
}
