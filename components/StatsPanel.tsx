'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Target, TrendingUp, Clock, Users, Award, Star, Zap } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

interface Stats {
  totalGames: number
  finishedGames: number
  totalRounds: number
  correctGuesses: number
  gamesWon: number
  gamesLost: number
  winRate: number
  accuracy: number
}

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
    guess?: string
    outcome?: string
    createdAt: string
  }>
  createdAt: string
}

export default function StatsPanel() {
  const [activeTab, setActiveTab] = useState<'overview' | 'games' | 'rounds'>('overview')
  const [stats, setStats] = useState<Stats | null>(null)
  const [games, setGames] = useState<Game[]>([])
  const [rounds, setRounds] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  // Fetch stats data
  const fetchStats = async (type: 'overview' | 'games' | 'rounds') => {
    setLoading(true)
    try {
      const response = await fetch(`/api/stats?type=${type}`)
      const data = await response.json()
      
      if (data.success) {
        if (type === 'overview') {
          setStats(data.stats)
        } else if (type === 'games') {
          setGames(data.games)
        } else if (type === 'rounds') {
          setRounds(data.rounds)
        }
      }
    } catch (error) {
      console.error(`Error fetching ${type}:`, error)
    } finally {
      setLoading(false)
    }
  }

  // Load data on mount and tab change
  useEffect(() => {
    fetchStats(activeTab)
  }, [activeTab])

  const getWinRateColor = (rate: number) => {
    if (rate >= 70) return 'text-green-400'
    if (rate >= 50) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 80) return 'text-green-400'
    if (accuracy >= 60) return 'text-yellow-400'
    return 'text-red-400'
  }

  return (
    <Card className="bg-white/10 backdrop-blur-sm border border-white/20">
      <CardContent className="p-6">
        <div className="flex space-x-1 mb-6">
          {[
            { id: 'overview', label: 'Overview', icon: Trophy },
            { id: 'games', label: 'Games', icon: Users },
            { id: 'rounds', label: 'Rounds', icon: Target }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === id
                  ? 'bg-white/20 text-white'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <Icon className="h-4 w-4 mr-2" />
              {label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
                </div>
              ) : stats ? (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-6">Your Statistics</h3>
                  
                  {/* Main Stats Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white/5 rounded-lg p-4 text-center">
                      <Trophy className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-white">{stats.totalGames}</p>
                      <p className="text-sm text-gray-400">Total Games</p>
                    </div>
                    
                    <div className="bg-white/5 rounded-lg p-4 text-center">
                      <Award className="h-8 w-8 text-green-400 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-white">{stats.gamesWon}</p>
                      <p className="text-sm text-gray-400">Games Won</p>
                    </div>
                    
                    <div className="bg-white/5 rounded-lg p-4 text-center">
                      <Target className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-white">{stats.correctGuesses}</p>
                      <p className="text-sm text-gray-400">Correct Guesses</p>
                    </div>
                    
                    <div className="bg-white/5 rounded-lg p-4 text-center">
                      <Zap className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-white">{stats.totalRounds}</p>
                      <p className="text-sm text-gray-400">Total Rounds</p>
                    </div>
                  </div>

                  {/* Performance Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white/5 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-medium">Win Rate</span>
                        <span className={`text-lg font-bold ${getWinRateColor(stats.winRate)}`}>
                          {stats.winRate}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(stats.winRate, 100)}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="bg-white/5 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-medium">Accuracy</span>
                        <span className={`text-lg font-bold ${getAccuracyColor(stats.accuracy)}`}>
                          {stats.accuracy}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-blue-400 to-blue-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(stats.accuracy, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-300">No statistics available</p>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'games' && (
            <motion.div
              key="games"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <h3 className="text-lg font-semibold text-white mb-4">Recent Games</h3>
              
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
                </div>
              ) : games.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-300">No games played yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {games.map((game) => (
                    <div
                      key={game.id}
                      className="bg-white/5 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            game.status === 'finished' 
                              ? 'bg-green-500/20 text-green-400' 
                              : game.status === 'in_progress'
                              ? 'bg-blue-500/20 text-blue-400'
                              : 'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {game.status}
                          </span>
                          <span className="text-white font-medium">
                            vs {game.players.find(p => p.id !== game.players[0]?.id)?.name || 'Unknown'}
                          </span>
                        </div>
                        <span className="text-sm text-gray-400">
                          {new Date(game.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      
                      {game.rounds.length > 0 && (
                        <div className="text-sm text-gray-300">
                          <p>Latest: {game.rounds[0].actor1} & {game.rounds[0].actor2}</p>
                          {game.rounds[0].guess && (
                            <p className="text-xs">
                              Guess: &quot;{game.rounds[0].guess}&quot; 
                              {game.rounds[0].outcome && (
                                <span className={`ml-2 ${
                                  game.rounds[0].outcome === 'correct' ? 'text-green-400' : 'text-red-400'
                                }`}>
                                  ({game.rounds[0].outcome})
                                </span>
                              )}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'rounds' && (
            <motion.div
              key="rounds"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <h3 className="text-lg font-semibold text-white mb-4">Recent Rounds</h3>
              
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
                </div>
              ) : rounds.length === 0 ? (
                <div className="text-center py-8">
                  <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-300">No rounds played yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {rounds.map((round) => (
                    <div
                      key={round.id}
                      className="bg-white/5 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-white font-medium">
                            {round.actor1} & {round.actor2}
                          </span>
                          <span className="text-sm text-gray-400">
                            → {round.movie}
                          </span>
                        </div>
                        <span className="text-sm text-gray-400">
                          {new Date(round.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <div className="text-sm text-gray-300">
                        <p>
                          Clue giver: {round.game.players.find((p: { id: string; name: string; email: string }) => p.id === round.clueGiver)?.name || 'Unknown'}
                        </p>
                        {round.guesser && (
                          <p>
                            Guesser: {round.game.players.find((p: { id: string; name: string; email: string }) => p.id === round.guesser)?.name || 'Unknown'}
                          </p>
                        )}
                        {round.guess && (
                          <p>
                            Guess: &quot;{round.guess}&quot; 
                            {round.outcome && (
                              <span className={`ml-2 ${
                                round.outcome === 'correct' ? 'text-green-400' : 'text-red-400'
                              }`}>
                                ({round.outcome})
                              </span>
                            )}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}
