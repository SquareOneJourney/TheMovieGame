'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Users, Plus, ArrowRight, Home, Copy, Check } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

export default function LobbyPage() {
  const [gameCode, setGameCode] = useState('')
  const [copied, setCopied] = useState(false)

  const handleCreateGame = () => {
    // Redirect to multiplayer submission page
    window.location.href = '/multiplayer'
  }

  const handleJoinGame = () => {
    if (gameCode.trim()) {
      window.location.href = `/game/${gameCode.trim().toUpperCase()}`
    }
  }

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-between items-center mb-6">
            <Link 
              href="/"
              className="flex items-center space-x-2 text-white hover:text-blue-400 transition-colors"
            >
              <Home className="h-6 w-6" />
              <span>Home</span>
            </Link>
            <div className="flex-1"></div>
          </div>
          <h1 className="text-5xl font-bold text-white mb-4">Game Lobby</h1>
          <p className="text-xl text-gray-300">Create a new game or join an existing one</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Create Game */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-white/10 backdrop-blur-sm border border-white/20 h-full">
              <CardContent className="p-8 text-center">
                <div className="mb-6">
                  <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Plus className="h-10 w-10 text-green-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">Create New Game</h2>
                  <p className="text-gray-300">
                    Set up a movie challenge for your friend to guess
                  </p>
                </div>
                
                <Button
                  onClick={handleCreateGame}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Create Game
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Join Game */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-white/10 backdrop-blur-sm border border-white/20 h-full">
              <CardContent className="p-8 text-center">
                <div className="mb-6">
                  <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="h-10 w-10 text-blue-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">Join Game</h2>
                  <p className="text-gray-300">
                    Enter a game code to join an existing game
                  </p>
                </div>
                
                <div className="space-y-4">
                  <Input
                    type="text"
                    placeholder="Enter game code (e.g., ABC123)"
                    value={gameCode}
                    onChange={(e) => setGameCode(e.target.value.toUpperCase())}
                    className="w-full bg-white/20 border-white/30 text-white placeholder-gray-300 focus:ring-2 focus:ring-blue-500"
                    maxLength={6}
                  />
                  
                  <Button
                    onClick={handleJoinGame}
                    disabled={!gameCode.trim()}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ArrowRight className="h-5 w-5 mr-2" />
                    Join Game
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* How to Play */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-12"
        >
          <Card className="bg-white/10 backdrop-blur-sm border border-white/20">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-white text-center mb-6">How to Play</h3>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-lg font-semibold text-white mb-4">Creating a Game:</h4>
                  <ol className="space-y-2 text-gray-300">
                    <li>1. Click &quot;Create Game&quot; to set up your challenge</li>
                    <li>2. Search for a movie and select two actors</li>
                    <li>3. Share the game code with your friend</li>
                    <li>4. Start playing when they join!</li>
                  </ol>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-white mb-4">Joining a Game:</h4>
                  <ol className="space-y-2 text-gray-300">
                    <li>1. Get the game code from your friend</li>
                    <li>2. Enter the code in &quot;Join Game&quot;</li>
                    <li>3. Wait for the game to start</li>
                    <li>4. Guess the movie from the actors!</li>
                  </ol>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
