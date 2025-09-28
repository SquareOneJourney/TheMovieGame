'use client'

import { useEffect, useState } from 'react'
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
import ProtectedRoute from '@/components/ProtectedRoute'

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
    movie?: string
    poster?: string
    year?: string
    actor1Photo?: string
    actor2Photo?: string
    hintActorPhoto?: string
    hintActor?: string
  }
  currentTurn: string
  gameStatus: 'waiting' | 'playing' | 'finished'
  winner: string | null
  hintUsed: boolean
  lastResult?: {
    correct: boolean
    guess: string
    correctAnswer?: string
    similarity?: number
    confidence?: 'exact' | 'high' | 'medium' | 'low' | 'none'
    usedHint?: boolean
  }
}

interface GameRoomProps {
  params: {
    id: string
  }
}

export default function GameRoom({ params }: GameRoomProps) {
  const router = useRouter()
  const gameId = params.id

  const [gameState, setGameState] = useState<GameState>({
    players: [],
    currentTurn: '',
    gameStatus: 'waiting',
    winner: null,
    hintUsed: false
  })
  const [isConnected, setIsConnected] = useState(false)
  const [playerName, setPlayerName] = useState('')
  const [showNameInput, setShowNameInput] = useState(true)

  // Handle player name submission
  const handleNameSubmit = () => {
    if (playerName.trim()) {
      setShowNameInput(false)
      // Connect to socket
      socketManager.connect(gameId, playerName.trim())
    }
  }

  // Initialize socket connection
  useEffect(() => {
    if (!playerName || showNameInput) return

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
  }, [gameId, playerName, showNameInput])

  // Check if current user is the clue giver
  const isMyTurn = Boolean(gameState.currentTurn && gameState.players.some(p => p.id === gameState.currentTurn))
  const currentPlayer = gameState.players.find(p => p.id === gameState.currentTurn)
  const otherPlayer = gameState.players.find(p => p.id !== gameState.currentTurn)

  const handleGiveClue = async (actor1: string, actor2: string) => {
    try {
      // Check if we have a stored submission for this game
      const submissionData = sessionStorage.getItem(`gameSubmission_${gameId}`)
      
      if (submissionData) {
        const submission = JSON.parse(submissionData)
        const movie = submission.movie
        const actors = submission.actors
        
        // Use the submitted movie and actors
        setGameState(prev => ({
          ...prev,
          currentClue: {
            actor1,
            actor2,
            movie: movie.title,
            poster: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : undefined,
            year: movie.release_date ? new Date(movie.release_date).getFullYear().toString() : undefined,
            actor1Photo: actors.actor1?.profile_path ? `https://image.tmdb.org/t/p/w185${actors.actor1.profile_path}` : undefined,
            actor2Photo: actors.actor2?.profile_path ? `https://image.tmdb.org/t/p/w185${actors.actor2.profile_path}` : undefined,
            hintActorPhoto: actors.hintActor?.profile_path ? `https://image.tmdb.org/t/p/w185${actors.hintActor.profile_path}` : undefined,
            hintActor: actors.hintActor?.name
          }
        }))
        
        socketManager.giveClue(
          actor1, 
          actor2, 
          movie.title,
          movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : undefined,
          movie.release_date ? new Date(movie.release_date).getFullYear().toString() : undefined,
          actors.actor1?.profile_path ? `https://image.tmdb.org/t/p/w185${actors.actor1.profile_path}` : undefined,
          actors.actor2?.profile_path ? `https://image.tmdb.org/t/p/w185${actors.actor2.profile_path}` : undefined,
          actors.hintActor?.profile_path ? `https://image.tmdb.org/t/p/w185${actors.hintActor.profile_path}` : undefined,
          actors.hintActor?.name
        )
      } else {
        // Fallback to random movie if no submission found
        const randomMovie = await movieService.getSingleRandomMovie()
        
        setGameState(prev => ({
          ...prev,
          currentClue: {
            actor1,
            actor2,
            movie: randomMovie.movie,
            poster: randomMovie.poster,
            year: randomMovie.year,
            actor1Photo: randomMovie.actor1Photo,
            actor2Photo: randomMovie.actor2Photo,
            hintActorPhoto: randomMovie.hintActorPhoto,
            hintActor: randomMovie.hintActor
          }
        }))
        
        socketManager.giveClue(
          actor1, 
          actor2, 
          randomMovie.movie, 
          randomMovie.poster, 
          randomMovie.year,
          randomMovie.actor1Photo,
          randomMovie.actor2Photo,
          randomMovie.hintActorPhoto,
          randomMovie.hintActor
        )
      }
    } catch (error) {
      console.error('Error getting movie data:', error)
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

    socketManager.guessMovie(
      guess, 
      correctMovie, 
      matchResult.similarity, 
      matchResult.confidence, 
      gameState.hintUsed
    )
  }

  const handleNoIdea = async () => {
    const correctMovie = gameState.currentClue?.movie || "The Matrix"
    
    socketManager.guessMovie("No Idea", correctMovie, 0, 'none', gameState.hintUsed)
  }

  const handleHint = async () => {
    if (!gameState.currentClue || gameState.hintUsed) return
    
    socketManager.useHint()
    setGameState(prev => ({ ...prev, hintUsed: true }))
  }

  const handleLeaveGame = () => {
    socketManager.disconnect()
    router.push('/')
  }

  const handleResetGame = () => {
    socketManager.resetGame()
  }

  // Show name input if not connected
  if (showNameInput) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <Card className="bg-white/10 backdrop-blur-sm border border-white/20">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold text-white mb-6">Join Game</h2>
              <p className="text-gray-300 mb-6">Enter your name to join the game</p>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Your name"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleNameSubmit()}
                  className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <Button
                  onClick={handleNameSubmit}
                  disabled={!playerName.trim()}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Join Game
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
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
            <span className="text-sm text-gray-300">
              ({gameState.gameStatus === 'waiting' ? 'Waiting' : gameState.gameStatus === 'playing' ? 'Playing' : 'Finished'})
            </span>
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
            {gameState.gameStatus === 'waiting' && (
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

            {/* Game Over Screen */}
            {gameState.gameStatus === 'finished' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
              >
                <Card className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-400">
                  <CardContent className="p-8">
                    <Crown className="h-16 w-16 text-yellow-400 mx-auto mb-4" />
                    <h2 className="text-3xl font-bold text-white mb-4">
                      🎉 Game Over! 🎉
                    </h2>
                    <p className="text-xl text-white mb-6">
                      {gameState.players.find(p => p.id === gameState.winner)?.name} won!
                    </p>
                    <div className="flex space-x-4 justify-center">
                      <Button
                        onClick={handleResetGame}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        Play Again
                      </Button>
                      <Button
                        onClick={handleLeaveGame}
                        variant="outline"
                        className="border-white text-white hover:bg-white/20"
                      >
                        Leave Game
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Game Actions */}
            {gameState.players.length === 2 && gameState.gameStatus === 'playing' && (
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
                        onNoIdea={handleNoIdea}
                        onHint={handleHint}
                        disabled={isMyTurn}
                        hintUsed={gameState.hintUsed}
                        lastResult={gameState.lastResult}
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
    </ProtectedRoute>
  )
}
