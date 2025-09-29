'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { LogOut, User, Play, Users, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import SimpleLoginForm from '@/components/SimpleLoginForm'
import SimpleRegisterForm from '@/components/SimpleRegisterForm'
import { getCurrentUser, signOut } from '@/lib/supabase-auth'

export default function Home() {
  const router = useRouter()
  const [authMode, setAuthMode] = useState<'none' | 'login' | 'register'>('none')
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    try {
      const { user, error } = await getCurrentUser()
      if (error) {
        console.error('Error getting user:', error)
      } else {
        setUser(user)
      }
    } catch (error) {
      console.error('Error checking user:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      const { error } = await signOut()
      if (error) {
        console.error('Error signing out:', error)
      } else {
        setUser(null)
        setAuthMode('none')
      }
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <Card className="bg-white/10 backdrop-blur-sm border border-white/20">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white">Loading...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Top Header */}
      <div className="w-full px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <img 
              src="/TheMovieGame Logo.png" 
              alt="The Movie Game" 
              className="h-8 w-auto"
            />
            <span className="text-xl font-bold text-white">The Movie Game</span>
          </div>
          
          {user ? (
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2">
                <User className="h-4 w-4 text-white" />
                <span className="text-white font-medium text-sm">
                  Welcome, {user.user_metadata?.name || user.email}!
                </span>
              </div>
              <Button
                onClick={handleSignOut}
                variant="outline"
                size="sm"
                className="text-white border-white/20 hover:bg-white/10 bg-transparent hover:text-white rounded-full px-4 py-2"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <Button
                onClick={() => setAuthMode('login')}
                variant="outline"
                size="sm"
                className="text-white border-white/20 hover:bg-white/10 bg-transparent hover:text-white rounded-full px-4 py-2"
              >
                Sign In
              </Button>
              <Button
                onClick={() => setAuthMode('register')}
                size="sm"
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-full px-4 py-2"
              >
                Sign Up
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Main Content */}
        <div className="text-center mb-16">
          <div className="inline-block mb-6">
            <img 
              src="/TheMovieGame Logo.png" 
              alt="The Movie Game" 
              className="h-24 w-auto mx-auto"
            />
          </div>
          
          <h1 className="text-6xl font-bold text-white mb-4">
            The Movie Game
          </h1>
          <p className="text-2xl font-semibold text-gray-300 max-w-2xl mx-auto mb-8">
            &quot;If you ain&apos;t first, you&apos;re last.&quot;
          </p>
          
          {/* Authentication Forms */}
          {authMode === 'login' && (
            <div className="mb-8 relative max-w-md mx-auto">
              <div className="relative">
                <button
                  onClick={() => setAuthMode('none')}
                  className="absolute top-4 right-4 bg-gray-600 hover:bg-gray-700 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold z-10 transition-colors"
                >
                  ×
                </button>
                <SimpleLoginForm onSwitchToRegister={() => setAuthMode('register')} />
              </div>
            </div>
          )}
          {authMode === 'register' && (
            <div className="mb-8 relative max-w-md mx-auto">
              <div className="relative">
                <button
                  onClick={() => setAuthMode('none')}
                  className="absolute top-4 right-4 bg-gray-600 hover:bg-gray-700 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold z-10 transition-colors"
                >
                  ×
                </button>
                <SimpleRegisterForm onSwitchToLogin={() => setAuthMode('login')} />
              </div>
            </div>
          )}
          
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="/singleplayer"
            className="inline-block bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-bold text-xl px-8 py-4 rounded-full shadow-2xl transform hover:scale-105 transition-all duration-200"
          >
            <Play className="inline h-6 w-6 mr-2" />
            Single Player
          </a>
          <a
            href={user ? "/lobby" : "#"}
            className={`inline-block font-bold text-xl px-8 py-4 rounded-full shadow-2xl transform transition-all duration-200 ${
              user 
                ? "bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white hover:scale-105" 
                : "bg-gray-500 text-gray-300 cursor-not-allowed"
            }`}
            onClick={!user ? (e) => e.preventDefault() : undefined}
          >
            <Users className="inline h-6 w-6 mr-2" />
            Multiplayer {!user && "(Login Required)"}
          </a>
        </div>
        
        {/* Admin Link - Only show for authenticated users */}
        {user && (
          <div className="text-center mt-4">
            <a
              href="/admin"
              className="inline-flex items-center text-gray-300 hover:text-white text-sm transition-colors duration-200"
            >
              <Settings className="w-4 h-4 mr-2" />
              Admin Panel
            </a>
          </div>
        )}
        </div>

        {/* Game Rules */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 text-center">
            <div className="text-4xl mb-4">👥</div>
            <h3 className="text-xl font-bold text-white mb-2">Two Players</h3>
            <p className="text-gray-300">Head-to-head movie trivia competition</p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 text-center">
            <div className="text-4xl mb-4">🎭</div>
            <h3 className="text-xl font-bold text-white mb-2">Give Clues</h3>
            <p className="text-gray-300">Name two actors from a movie</p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 text-center">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="text-xl font-bold text-white mb-2">Guess Right</h3>
            <p className="text-gray-300">Correct guess = 1 point + your turn</p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 text-center">
            <div className="text-4xl mb-4">🏆</div>
            <h3 className="text-xl font-bold text-white mb-2">Win Big</h3>
            <p className="text-gray-300">Wrong guess = 2 points for clue giver</p>
          </div>
        </div>

        {/* How to Play */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-white text-center mb-6">Multiplayer Game Rules</h2>
            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">1</div>
                <p className="text-gray-300">
                  <strong className="text-white">Player 1</strong> names two actors from a movie
                </p>
              </div>
              <div className="flex items-start space-x-4">
                <div className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">2</div>
                <p className="text-gray-300">
                  <strong className="text-white">Player 2</strong> guesses the movie title
                </p>
              </div>
              <div className="flex items-start space-x-4">
                <div className="bg-yellow-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">3</div>
                <p className="text-gray-300">
                  <strong className="text-white">Correct?</strong> Player 2 gets 1 point and becomes the clue giver
                </p>
              </div>
              <div className="flex items-start space-x-4">
                <div className="bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">4</div>
                <p className="text-gray-300">
                  <strong className="text-white">Wrong?</strong> Player 1 gets 2 points and keeps their turn
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}