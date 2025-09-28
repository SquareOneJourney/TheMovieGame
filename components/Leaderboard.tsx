'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Trophy, Medal, Award, Crown, Star, TrendingUp } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

interface LeaderboardEntry {
  user: {
    id: string
    name: string
    email: string
  }
  stats: {
    totalGames: number
    gamesWon: number
    winRate: number
    accuracy: number
  }
  rank: number
}

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [timeframe, setTimeframe] = useState<'all' | 'week' | 'month'>('all')

  // Fetch leaderboard data
  const fetchLeaderboard = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/leaderboard?timeframe=${timeframe}`)
      const data = await response.json()
      
      if (data.success) {
        setLeaderboard(data.leaderboard)
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLeaderboard()
  }, [timeframe])

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-5 w-5 text-yellow-400" />
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />
      default:
        return <span className="text-sm font-bold text-gray-400">#{rank}</span>
    }
  }

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-400/20 to-yellow-600/20 border-yellow-400/30'
      case 2:
        return 'bg-gradient-to-r from-gray-400/20 to-gray-600/20 border-gray-400/30'
      case 3:
        return 'bg-gradient-to-r from-amber-600/20 to-amber-800/20 border-amber-600/30'
      default:
        return 'bg-white/5 border-white/10'
    }
  }

  return (
    <Card className="bg-white/10 backdrop-blur-sm border border-white/20">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white flex items-center">
            <Trophy className="h-5 w-5 mr-2 text-yellow-400" />
            Leaderboard
          </h3>
          
          <div className="flex space-x-1">
            {[
              { id: 'all', label: 'All Time' },
              { id: 'month', label: 'Month' },
              { id: 'week', label: 'Week' }
            ].map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setTimeframe(id as any)}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                  timeframe === id
                    ? 'bg-white/20 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="text-center py-8">
            <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-300">No players yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {leaderboard.map((entry, index) => (
              <motion.div
                key={entry.user.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`rounded-lg p-4 border ${getRankColor(entry.rank)}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-8 h-8">
                      {getRankIcon(entry.rank)}
                    </div>
                    <div>
                      <p className="text-white font-medium">{entry.user.name}</p>
                      <p className="text-sm text-gray-400">{entry.user.email}</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="flex items-center space-x-4 text-sm">
                      <div className="text-center">
                        <p className="text-white font-bold">{entry.stats.gamesWon}</p>
                        <p className="text-gray-400">Wins</p>
                      </div>
                      <div className="text-center">
                        <p className="text-white font-bold">{entry.stats.totalGames}</p>
                        <p className="text-gray-400">Games</p>
                      </div>
                      <div className="text-center">
                        <p className="text-white font-bold">{entry.stats.winRate}%</p>
                        <p className="text-gray-400">Win Rate</p>
                      </div>
                      <div className="text-center">
                        <p className="text-white font-bold">{entry.stats.accuracy}%</p>
                        <p className="text-gray-400">Accuracy</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
