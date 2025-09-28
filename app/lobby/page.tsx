'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Users, Plus, ArrowRight, Home, Copy, Check, LogOut, User, Clock, Play } from 'lucide-react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import ProtectedRoute from '@/components/ProtectedRoute'
import FriendsPanel from '@/components/FriendsPanel'
import StatsPanel from '@/components/StatsPanel'
import Leaderboard from '@/components/Leaderboard'

interface Game {
  id: string
  status: string
  players: Array<{
    id: string
    name: string
    email: string
  }>
  rounds: Array<{
    id: string
    actor1: string
    actor2: string
    movie: string
    hintActor?: string
  }>
  createdAt: string
}

export default function LobbyPage() {
  const { data: session } = useSession()
  const [gameCode, setGameCode] = useState('')
  const [copied, setCopied] = useState(false)
  const [activeGames, setActiveGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)

  const handleCreateGame = () => {
    // Redirect to multiplayer submission page
    window.location.href = '/multiplayer'
  }

  const handleJoinGame = async () => {
    if (!gameCode.trim()) return

    try {
      const response = await fetch(`/api/games/${gameCode.trim()}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      const data = await response.json()

      if (data.success) {
        window.location.href = `/game/${gameCode.trim()}`
      } else {
        alert(`Error joining game: ${data.error}`)
      }
    } catch (error) {
      console.error('Error joining game:', error)
      alert('Failed to join game. Please try again.')
    }
  }

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' })
  }

  // Fetch active games on component mount
  useEffect(() => {
    const fetchActiveGames = async () => {
      try {
        const response = await fetch('/api/games?status=waiting')
        const data = await response.json()
        
        if (data.success) {
          setActiveGames(data.games)
        }
      } catch (error) {
        console.error('Error fetching games:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchActiveGames()
  }, [])

  return (
    <ProtectedRoute>
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
              
              {/* User Info */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-white">
                  <User className="h-5 w-5" />
                  <span className="text-sm">{session?.user?.name || session?.user?.email}</span>
                </div>
                <Button
                  onClick={handleSignOut}
                  variant="outline"
                  size="sm"
                  className="text-white border-white/20 hover:bg-white/10"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
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

        {/* Active Games */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mt-12"
        >
          <Card className="bg-white/10 backdrop-blur-sm border border-white/20">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-white text-center mb-6">Active Games</h3>
              
              {loading ? (
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
                  <p className="text-gray-300 mt-2">Loading games...</p>
                </div>
              ) : activeGames.length === 0 ? (
                <div className="text-center">
                  <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-300">No active games waiting for players</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {activeGames.map((game) => (
                    <div
                      key={game.id}
                      className="bg-white/5 border border-white/10 rounded-lg p-4 flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                          <Users className="h-5 w-5 text-blue-400" />
                        </div>
                        <div>
                          <p className="text-white font-medium">
                            Game by {game.players[0]?.name || 'Unknown'}
                          </p>
                          <p className="text-sm text-gray-400">
                            {game.rounds[0]?.actor1} & {game.rounds[0]?.actor2}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-400">
                          {game.players.length}/2 players
                        </span>
                        <Button
                          onClick={() => {
                            setGameCode(game.id)
                            handleJoinGame()
                          }}
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Play className="h-4 w-4 mr-1" />
                          Join
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats and Friends Panels */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="mt-12 grid md:grid-cols-2 gap-8"
        >
          <StatsPanel />
          <FriendsPanel />
        </motion.div>

        {/* Leaderboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-12"
        >
          <Leaderboard />
        </motion.div>

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
    </ProtectedRoute>
  )
}
