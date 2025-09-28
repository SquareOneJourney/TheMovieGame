'use client'

import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { motion } from 'framer-motion'
import { LogOut, User, Play, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import LoginForm from '@/components/LoginForm'
import RegisterForm from '@/components/RegisterForm'

export default function Home() {
  const { data: session, status } = useSession()
  const [showLogin, setShowLogin] = useState(false)
  const [showRegister, setShowRegister] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-block mb-6">
            <span className="text-6xl">🎬</span>
          </div>
          
          <h1 className="text-6xl font-bold text-white mb-4">
            The Movie Game
          </h1>
          <p className="text-2xl font-semibold text-gray-300 max-w-2xl mx-auto mb-8">
            &quot;If you ain&apos;t first, you&apos;re last.&quot;
          </p>
          
          {/* Authentication Section */}
          {status === 'loading' ? (
            <div className="mb-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
            </div>
          ) : session ? (
            <div className="mb-8">
              <Card className="bg-white/10 backdrop-blur-sm border border-white/20 max-w-md mx-auto">
                <CardContent className="p-6 text-center">
                  <div className="flex items-center justify-center space-x-2 mb-4">
                    <User className="h-5 w-5 text-white" />
                    <span className="text-white font-medium">
                      Welcome, {session.user?.name || session.user?.email}!
                    </span>
                  </div>
                  <Button
                    onClick={() => signOut()}
                    variant="outline"
                    className="text-white border-white/20 hover:bg-white/10"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </CardContent>
              </Card>
            </div>
          ) : showLogin ? (
            <div className="mb-8">
              <LoginForm onSwitchToRegister={() => {
                setShowLogin(false)
                setShowRegister(true)
              }} />
            </div>
          ) : showRegister ? (
            <div className="mb-8">
              <RegisterForm onSwitchToLogin={() => {
                setShowRegister(false)
                setShowLogin(true)
              }} />
            </div>
          ) : (
            <div className="mb-8">
              <Card className="bg-white/10 backdrop-blur-sm border border-white/20 max-w-md mx-auto">
                <CardContent className="p-6 text-center">
                  <p className="text-white mb-4">Sign in to play multiplayer games</p>
                  <div className="space-y-3">
                    <Button
                      onClick={() => setShowLogin(true)}
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                    >
                      Sign In
                    </Button>
                    <Button
                      onClick={() => setShowRegister(true)}
                      variant="outline"
                      className="w-full text-white border-white/20 hover:bg-white/10"
                    >
                      Create Account
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="/singleplayer"
            className="inline-block bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-bold text-xl px-8 py-4 rounded-full shadow-2xl transform hover:scale-105 transition-all duration-200"
          >
            <Play className="inline h-6 w-6 mr-2" />
            Play Against AI
          </a>
          <a
            href={session ? "/lobby" : "#"}
            className={`inline-block font-bold text-xl px-8 py-4 rounded-full shadow-2xl transform transition-all duration-200 ${
              session 
                ? "bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white hover:scale-105" 
                : "bg-gray-500 text-gray-300 cursor-not-allowed"
            }`}
            onClick={!session ? (e) => e.preventDefault() : undefined}
          >
            <Users className="inline h-6 w-6 mr-2" />
            Multiplayer {!session && "(Login Required)"}
          </a>
        </div>
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
            <h2 className="text-2xl font-bold text-white text-center mb-6">How to Play</h2>
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