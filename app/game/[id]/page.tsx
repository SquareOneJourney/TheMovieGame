'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Scoreboard } from '@/components/Scoreboard'
import { ClueInput } from '@/components/ClueInput'
import { GuessInput } from '@/components/GuessInput'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import socketManager from '@/lib/socket'
import { movieService, GameMovie } from '@/lib/movieService'
import { enhancedFuzzyMatch } from '@/lib/fuzzyMatch'
import { ArrowLeft, Users, Crown, Zap, Home } from 'lucide-react'
import Link from 'next/link'

interface Player {
  id: string
  name: string
  score: number
}

interface GameState {
  players: Player[]
  currentClue?: {
    actor1: string
    actor2: string
    movie: string
    poster?: string
    year?: string
  }
  currentTurn: string
}

interface GameRoomProps {
  params: {
    id: string
  }
}

export default function GameRoom({ params }: GameRoomProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const gameId = params.id

  const [gameState, setGameState] = useState<GameState>({
    players: [],
    currentTurn: ''
  })
  const [isConnected, setIsConnected] = useState(false)
  const [lastResult, setLastResult] = useState<{
    correct: boolean
    guess: string
    correctAnswer?: string
    similarity?: number
    confidence?: 'exact' | 'high' | 'medium' | 'low' | 'none'
  } | null>(null)

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/')
      return
    }
  }, [session, status, router])

  // Initialize socket connection
  useEffect(() => {
    if (!session?.user?.name) return

    const playerName = session.user.name

    // Connect to socket
    socketManager.connect(gameId, playerName)

    // Set up event listeners
    socketManager.onGameUpdate((newGameState) => {
      setGameState(newGameState)
      setIsConnected(true)
    })

    socketManager.onClueGiven((clue) => {
      setGameState(prev => ({ ...prev, currentClue: clue }))
    })

    // Cleanup on unmount
    return () => {
      socketManager.removeAllListeners()
      socketManager.disconnect()
    }
  }, [gameId, session?.user?.name])

  // Check if current user is the clue giver
  const isMyTurn = gameState.currentTurn && gameState.players.some(p => p.id === gameState.currentTurn)
  const currentPlayer = gameState.players.find(p => p.id === gameState.currentTurn)
  const otherPlayer = gameState.players.find(p => p.id !== gameState.currentTurn)

  const handleGiveClue = async (actor1: string, actor2: string) => {
    try {
      // Get a random movie for this clue
      const randomMovie = await movieService.getSingleRandomMovie()
      
      // Update game state with the movie info
      setGameState(prev => ({
        ...prev,
        currentClue: {
          actor1,
          actor2,
          movie: randomMovie.movie,
          poster: randomMovie.poster,
          year: randomMovie.year
        }
      }))
      
      socketManager.giveClue(actor1, actor2)
    } catch (error) {
      console.error('Error getting random movie:', error)
      // Fallback to a default movie
      setGameState(prev => ({
        ...prev,
        currentClue: {
          actor1,
          actor2,
          movie: "The Matrix"
        }
      }))
      socketManager.giveClue(actor1, actor2)
    }
  }

  const handleGuess = async (guess: string) => {
    const correctMovie = gameState.currentClue?.movie || "The Matrix"
    
    // Use fuzzy matching instead of exact string comparison
    const matchResult = enhancedFuzzyMatch(guess, correctMovie)
    const isCorrect = matchResult.isMatch
    
    setLastResult({
      correct: isCorrect,
      guess,
      correctAnswer: correctMovie,
      similarity: matchResult.similarity,
      confidence: matchResult.confidence
    })

    socketManager.guessMovie(guess, correctMovie)
  }

  const handleLeaveGame = () => {
    socketManager.disconnect()
    router.push('/')
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white">Loading game...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex space-x-2">
            <Button
              onClick={handleLeaveGame}
              variant="ghost"
              className="text-white hover:bg-white/20"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Leave Game
            </Button>
            
            <Link href="/">
              <Button
                variant="ghost"
                className="text-white hover:bg-white/20"
              >
                <Home className="h-4 w-4 mr-2" />
                Home
              </Button>
            </Link>
          </div>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white">The Movie Game</h1>
            <p className="text-gray-300">Room: {gameId}</p>
          </div>

          <div className="flex items-center space-x-2 text-white">
            <Users className="h-5 w-5" />
            <span>{gameState.players.length}/2</span>
          </div>
        </div>

        {/* Connection Status */}
        {!isConnected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center mb-8"
          >
            <Card className="bg-yellow-500/20 border-yellow-400">
              <CardContent className="p-4">
                <p className="text-yellow-300">Connecting to game...</p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Game Content */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Scoreboard */}
          <div>
            <Scoreboard 
              players={gameState.players}
              currentTurn={gameState.currentTurn}
              winningScore={10}
            />
          </div>

          {/* Right Column - Game Actions */}
          <div className="space-y-6">
            {/* Game Status */}
            {gameState.players.length < 2 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="bg-blue-500/20 border-blue-400">
                  <CardContent className="p-6 text-center">
                    <Users className="h-12 w-12 text-blue-400 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">Waiting for Player 2</h3>
                    <p className="text-gray-300">
                      Share this room code with a friend: <span className="font-mono bg-white/20 px-2 py-1 rounded">{gameId}</span>
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Game Actions */}
            {gameState.players.length === 2 && (
              <AnimatePresence mode="wait">
                {!gameState.currentClue ? (
                  // Clue Input
                  isMyTurn ? (
                    <motion.div
                      key="clue-input"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ClueInput 
                        onGiveClue={handleGiveClue}
                        disabled={!isMyTurn}
                      />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="waiting-clue"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5 }}
                    >
                      <Card className="bg-blue-500/20 border-blue-400">
                        <CardContent className="p-6 text-center">
                          <Zap className="h-12 w-12 text-blue-400 mx-auto mb-4 animate-pulse" />
                          <h3 className="text-xl font-bold text-white mb-2">
                            Waiting for {currentPlayer?.name}
                          </h3>
                          <p className="text-gray-300">
                            They&apos;re thinking of a movie and will give you two actors...
                          </p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )
                ) : (
                  // Guess Input
                  !isMyTurn ? (
                    <motion.div
                      key="guess-input"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <GuessInput 
                        clue={gameState.currentClue}
                        onGuess={handleGuess}
                        disabled={isMyTurn}
                        lastResult={lastResult}
                      />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="waiting-guess"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5 }}
                    >
                      <Card className="bg-green-500/20 border-green-400">
                        <CardContent className="p-6 text-center">
                          <Crown className="h-12 w-12 text-green-400 mx-auto mb-4 animate-pulse" />
                          <h3 className="text-xl font-bold text-white mb-2">
                            Waiting for {otherPlayer?.name}
                          </h3>
                          <p className="text-gray-300">
                            They&apos;re trying to guess your movie from the actors you provided...
                          </p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )
                )}
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
