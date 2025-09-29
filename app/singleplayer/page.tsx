'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Crown, Bot, User, Trophy, Home } from 'lucide-react'
import { movieService, GameMovie } from '@/lib/movieService'
import { enhancedFuzzyMatch } from '@/lib/fuzzyMatch'
import { GuessInput } from '@/components/GuessInput'
import Link from 'next/link'

// Force dynamic rendering to prevent static generation issues
export const dynamic = 'force-dynamic'

interface GameState {
  currentMovie: GameMovie | null
  playerScore: number
  botScore: number
  gameStatus: 'playing' | 'finished'
  winner: 'player' | 'bot' | null
  hintUsed: boolean
  lastResult: {
    correct: boolean
    guess: string
    correctAnswer?: string
    similarity?: number
    confidence?: 'exact' | 'high' | 'medium' | 'low' | 'none'
    usedHint?: boolean
  } | null
}

export default function SinglePlayerPage() {
  const [gameState, setGameState] = useState<GameState>({
    currentMovie: null,
    playerScore: 0,
    botScore: 0,
    gameStatus: 'playing',
    winner: null,
    hintUsed: false,
    lastResult: null
  })
  
  const [movies, setMovies] = useState<GameMovie[]>([])
  const [usedMovies, setUsedMovies] = useState<Set<number>>(new Set())
  const [isLoading, setIsLoading] = useState(true)
  
  // Use refs to manage timeouts properly in production
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Load movies from TMDB API with fallback to static data
  useEffect(() => {
    const loadMovies = async () => {
      try {
        console.log('🎬 Loading movies from TMDB...')
        
        // Load fewer movies for faster loading
        const data = await movieService.getRandomMovies(50) // Reduced from 200 to 50
        console.log('🎬 Loaded movies:', data.length, 'movies')
        console.log('🎬 Sample movie:', data[0])
        console.log('🎬 Sample movie actor1Photo:', data[0]?.actor1Photo)
        console.log('🎬 Sample movie actor2Photo:', data[0]?.actor2Photo)
        
        if (data && data.length > 0) {
          setMovies(data)
          setIsLoading(false)
          // Start with a random movie
          const randomIndex = Math.floor(Math.random() * data.length)
          setGameState(prev => ({ ...prev, currentMovie: data[randomIndex] }))
          setUsedMovies(new Set([randomIndex]))
          console.log('✅ Movies loaded successfully, game started')
        } else {
          console.error('❌ No movies returned from API')
          setIsLoading(false)
        }
      } catch (error) {
        console.error('❌ Error loading movies:', error)
        // The movieService now has fallback to static data, so this shouldn't happen
        console.log('Using fallback movies data...')
        setIsLoading(false)
      }
    }
    
    loadMovies()
  }, [])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const handleGuess = (guessText: string) => {
    if (!gameState.currentMovie || !guessText.trim()) return

    // Use fuzzy matching instead of exact string comparison
    const matchResult = enhancedFuzzyMatch(guessText.trim(), gameState.currentMovie.movie)
    const isCorrect = matchResult.isMatch
    
    // Update state with result and scores
    setGameState(prev => {
      const pointsToAdd = isCorrect ? (prev.hintUsed ? 0.5 : 1) : 0
      const botPointsToAdd = isCorrect ? 0 : 1
      const newPlayerScore = prev.playerScore + pointsToAdd
      const newBotScore = prev.botScore + botPointsToAdd
      
      return {
        ...prev,
        lastResult: {
          correct: isCorrect,
          guess: guessText.trim(),
          correctAnswer: gameState.currentMovie!.movie,
          similarity: matchResult.similarity,
          confidence: matchResult.confidence,
          usedHint: prev.hintUsed
        },
        playerScore: newPlayerScore,
        botScore: newBotScore
      }
    })

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Check for winner and move to next movie after delay
    timeoutRef.current = setTimeout(() => {
      console.log('⏰ Timeout callback executed')
      setGameState(prev => {
        console.log('⏰ Current scores - player:', prev.playerScore, 'bot:', prev.botScore)
        if (prev.playerScore >= 10 || prev.botScore >= 10) {
          console.log('⏰ Game finished, winner determined')
          return {
            ...prev,
            gameStatus: 'finished',
            winner: prev.playerScore >= 10 ? 'player' : 'bot'
          }
        } else {
          // Get next movie after showing result - do it directly in the state update
          console.log('⏰ Getting next movie...')
          const nextMovie = getNextMovieDirect()
          if (nextMovie) {
            console.log('⏰ Setting next movie in state:', nextMovie.movie)
            return {
              ...prev,
              currentMovie: nextMovie,
              hintUsed: false,
              lastResult: null // Clear the last result
            }
          }
          return prev
        }
      })
    }, 2000) // Wait 2 seconds before moving to next movie
  }

  const handleHint = () => {
    if (!gameState.currentMovie || gameState.hintUsed) return
    
    setGameState(prev => ({
      ...prev,
      hintUsed: true
    }))
  }

  const handleNoIdea = () => {
    if (!gameState.currentMovie) return

    // Mark as incorrect guess and give points to bot
    setGameState(prev => ({
      ...prev,
      lastResult: {
        correct: false,
        guess: "No Idea",
        correctAnswer: gameState.currentMovie!.movie,
        similarity: 0,
        confidence: 'none'
      },
      botScore: prev.botScore + 1
    }))

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Check for winner and move to next movie after delay
    timeoutRef.current = setTimeout(() => {
      console.log('⏰ No Idea timeout callback executed')
      setGameState(prev => {
        console.log('⏰ No Idea current scores - player:', prev.playerScore, 'bot:', prev.botScore)
        if (prev.botScore >= 10) {
          console.log('⏰ No Idea game finished, bot wins')
          return {
            ...prev,
            gameStatus: 'finished',
            winner: 'bot'
          }
        } else {
          // Get next movie after showing result - do it directly in the state update
          console.log('⏰ No Idea getting next movie...')
          const nextMovie = getNextMovieDirect()
          if (nextMovie) {
            console.log('⏰ No Idea setting next movie in state:', nextMovie.movie)
            return {
              ...prev,
              currentMovie: nextMovie,
              hintUsed: false,
              lastResult: null // Clear the last result
            }
          }
          return prev
        }
      })
    }, 2000) // Wait 2 seconds before moving to next movie
  }

  // Helper function to get next movie without updating state
  const getNextMovieDirect = (): GameMovie | null => {
    console.log('🎬 getNextMovieDirect called - movies.length:', movies.length, 'usedMovies.size:', usedMovies.size)
    
    if (movies.length === 0) {
      console.error('❌ No movies available for next movie')
      return null
    }
    
    const availableMovies = movies.filter((_, index) => !usedMovies.has(index))
    console.log('🎬 Available movies:', availableMovies.length)
    
    if (availableMovies.length === 0) {
      // Reset used movies if all have been used
      console.log('🔄 Resetting used movies - all movies used')
      setUsedMovies(new Set())
      const randomIndex = Math.floor(Math.random() * movies.length)
      const selectedMovie = movies[randomIndex]
      console.log('🎬 Selected movie (reset):', selectedMovie?.movie)
      setUsedMovies(new Set([randomIndex]))
      return selectedMovie
    } else {
      const randomIndex = Math.floor(Math.random() * availableMovies.length)
      const selectedMovie = availableMovies[randomIndex]
      const originalIndex = movies.findIndex(m => m === selectedMovie)
      console.log('🎬 Selected movie:', selectedMovie?.movie, 'originalIndex:', originalIndex)
      
      setUsedMovies(prev => new Set([...prev, originalIndex]))
      return selectedMovie
    }
  }

  const getNextMovie = () => {
    console.log('🎬 getNextMovie called - movies.length:', movies.length, 'usedMovies.size:', usedMovies.size)
    
    const nextMovie = getNextMovieDirect()
    if (nextMovie) {
      console.log('🎬 Setting new movie state...')
      setGameState(prev => {
        console.log('🎬 Previous state currentMovie:', prev.currentMovie?.movie)
        const newState = { ...prev, currentMovie: nextMovie, hintUsed: false, lastResult: null }
        console.log('🎬 New state currentMovie:', newState.currentMovie?.movie)
        return newState
      })
    }
  }

  const resetGame = () => {
    setGameState({
      currentMovie: movies.length > 0 ? movies[Math.floor(Math.random() * movies.length)] : null,
      playerScore: 0,
      botScore: 0,
      gameStatus: 'playing',
      winner: null,
      hintUsed: false,
      lastResult: null
    })
    setUsedMovies(new Set())
  }

  // Show loading screen while movies are loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-white mb-2">Loading Movies...</h2>
          <p className="text-gray-300">Fetching fresh movie data from TMDB</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-between items-center mb-4">
            <Link 
              href="/"
              className="flex items-center space-x-2 text-white hover:text-blue-400 transition-colors"
            >
              <Home className="h-6 w-6" />
              <span>Home</span>
            </Link>
            <div className="flex-1"></div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Ready Player One</h1>
          <p className="text-gray-300">Challenge Mr. Robot to a movie trivia duel!</p>
        </div>

        {/* Scoreboard */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Player Score */}
          <motion.div
            className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6"
            animate={{ scale: gameState.lastResult?.correct ? 1.05 : 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center space-x-4">
              <User className="h-8 w-8 text-blue-400" />
              <div>
                <h3 className="text-xl font-bold text-white">You</h3>
                <p className="text-3xl font-bold text-blue-400">{gameState.playerScore % 1 === 0 ? gameState.playerScore : gameState.playerScore.toFixed(1)}</p>
              </div>
            </div>
          </motion.div>

          {/* Bot Score */}
          <motion.div
            className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6"
            animate={{ scale: gameState.lastResult?.correct === false ? 1.05 : 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center space-x-4">
              <Bot className="h-8 w-8 text-red-400" />
              <div>
                <h3 className="text-xl font-bold text-white">Mr. Robot</h3>
                <p className="text-3xl font-bold text-red-400">{gameState.botScore}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Game Content */}
        {gameState.gameStatus === 'playing' ? (
          <div className="space-y-6">
            {/* Current Clue */}
            {gameState.currentMovie && (
              <GuessInput
                clue={{
                  actor1: gameState.currentMovie.actor1,
                  actor2: gameState.currentMovie.actor2,
                  movie: gameState.currentMovie.movie,
                  poster: gameState.currentMovie.poster,
                  year: gameState.currentMovie.year,
                  actor1Photo: gameState.currentMovie.actor1Photo,
                  actor2Photo: gameState.currentMovie.actor2Photo,
                  hintActorPhoto: gameState.currentMovie.hintActorPhoto,
                  hintActor: gameState.currentMovie.hintActor
                }}
                onGuess={handleGuess}
                onNoIdea={handleNoIdea}
                onHint={handleHint}
                disabled={false}
                hintUsed={gameState.hintUsed}
                lastResult={gameState.lastResult ? {
                  correct: gameState.lastResult.correct,
                  guess: gameState.lastResult.guess,
                  correctAnswer: gameState.lastResult.correctAnswer,
                  similarity: gameState.lastResult.similarity,
                  confidence: gameState.lastResult.confidence
                } : undefined}
              />
            )}


          </div>
        ) : (
          /* Game Over */
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-8"
          >
            {gameState.winner === 'player' ? (
              <div>
                <div className="crown-bounce inline-block mb-4">
                  <Crown className="h-16 w-16 text-yellow-400 mx-auto" />
                </div>
                <h2 className="text-4xl font-bold text-yellow-400 mb-4">
                  🎉 You&apos;re the King of the World! 🎉
                </h2>
                <p className="text-xl text-white mb-6">
                  You beat Mr. Robot {gameState.playerScore % 1 === 0 ? gameState.playerScore : gameState.playerScore.toFixed(1)} to {gameState.botScore}!
                </p>
              </div>
            ) : (
              <div>
                <Trophy className="h-16 w-16 text-red-400 mx-auto mb-4" />
                <h2 className="text-4xl font-bold text-red-400 mb-4">
                  🤖 Mr. Robot Wins! 🤖
                </h2>
                <p className="text-xl text-white mb-6">
                  Mr. Robot beat you {gameState.botScore} to {gameState.playerScore % 1 === 0 ? gameState.playerScore : gameState.playerScore.toFixed(1)}!
                </p>
              </div>
            )}
            
            <button
              onClick={resetGame}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors"
            >
              Play Again
            </button>
          </motion.div>
        )}

        {/* Challenge Friends CTA */}
        {gameState.gameStatus === 'finished' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-8 text-center"
          >
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-2">Ready for a real challenge?</h3>
              <p className="text-gray-300 mb-4">Challenge your friends to a head-to-head movie trivia battle!</p>
              <a 
                href="/"
                className="inline-block bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                Challenge Friends
              </a>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
