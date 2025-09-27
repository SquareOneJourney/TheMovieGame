'use client'

import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Crown, Trophy, User } from 'lucide-react'

interface Player {
  id: string
  name: string
  score: number
}

interface ScoreboardProps {
  players: Player[]
  currentTurn: string
  winningScore?: number
}

export function Scoreboard({ players, currentTurn, winningScore = 10 }: ScoreboardProps) {
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score)
  const winner = players.find(p => p.score >= winningScore)

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-center text-white mb-6">Scoreboard</h2>
      
      {/* Winner Crown Animation */}
      {winner && (
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ 
            type: "spring", 
            stiffness: 200, 
            damping: 10,
            duration: 1 
          }}
          className="text-center mb-6"
        >
          <div className="crown-bounce inline-block">
            <Crown className="h-16 w-16 text-yellow-400 mx-auto" />
          </div>
          <h3 className="text-3xl font-bold text-yellow-400 mt-2">
            🎉 {winner.name} is King of Movie Town! 🎉
          </h3>
        </motion.div>
      )}

      {/* Player Cards */}
      <div className="grid gap-4">
        {sortedPlayers.map((player, index) => {
          const isCurrentTurn = player.id === currentTurn
          const isWinner = player.score >= winningScore
          
          return (
            <motion.div
              key={player.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card 
                className={`relative overflow-hidden transition-all duration-300 ${
                  isCurrentTurn 
                    ? 'ring-2 ring-blue-400 bg-blue-500/20' 
                    : 'bg-white/10 backdrop-blur-sm border-white/20'
                } ${isWinner ? 'bg-gradient-to-r from-yellow-400/20 to-orange-500/20' : ''}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {/* Player Avatar */}
                      <div className={`relative ${isCurrentTurn ? 'animate-pulse' : ''}`}>
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                          <User className="h-6 w-6 text-white" />
                        </div>
                        {isCurrentTurn && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-400 rounded-full animate-ping" />
                        )}
                      </div>
                      
                      {/* Player Info */}
                      <div>
                        <h3 className="font-bold text-white flex items-center space-x-2">
                          <span>{player.name}</span>
                          {isWinner && <Crown className="h-5 w-5 text-yellow-400" />}
                          {isCurrentTurn && (
                            <span className="text-sm bg-blue-500 text-white px-2 py-1 rounded-full">
                              Your Turn
                            </span>
                          )}
                        </h3>
                        <p className="text-sm text-gray-300">
                          {isCurrentTurn ? 'Giving clues' : 'Waiting to guess'}
                        </p>
                      </div>
                    </div>

                    {/* Score */}
                    <motion.div
                      key={player.score}
                      initial={{ scale: 1 }}
                      animate={{ scale: 1.1 }}
                      transition={{ duration: 0.2 }}
                      className="text-right"
                    >
                      <div className="flex items-center space-x-2">
                        <Trophy className="h-6 w-6 text-yellow-400" />
                        <span className="text-2xl font-bold text-white">
                          {player.score}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400">
                        {winningScore - player.score} to win
                      </p>
                    </motion.div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-3">
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <motion.div
                        className="bg-gradient-to-r from-blue-400 to-purple-500 h-2 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${(player.score / winningScore) * 100}%` }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* Game Status */}
      <div className="text-center">
        <p className="text-gray-300">
          First to {winningScore} points wins!
        </p>
      </div>
    </div>
  )
}
