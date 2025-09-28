'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Crown, Bot, User, Trophy, Home } from 'lucide-react'
import { movieService, GameMovie } from '@/lib/movieService'
import { enhancedFuzzyMatch } from '@/lib/fuzzyMatch'
import { GuessInput } from '@/components/GuessInput'
import Link from 'next/link'

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

  // Load movies from TMDB API with fallback to static data
  useEffect(() => {
    const loadMovies = async () => {
      try {
        // Clear cache to ensure fresh data
        movieService.clearCache()
        console.log('🎬 Loading fresh movies from TMDB...')
        
        const data = await movieService.getRandomMovies(200) // Load 200 movies for maximum variety
        console.log('🎬 Loaded movies:', data.length, 'movies')
        console.log('🎬 Sample movie:', data[0])
        console.log('🎬 Sample movie actor1Photo:', data[0]?.actor1Photo)
        console.log('🎬 Sample movie actor2Photo:', data[0]?.actor2Photo)
        
        setMovies(data)
        // Start with a random movie
        if (data.length > 0) {
          const randomIndex = Math.floor(Math.random() * data.length)
          setGameState(prev => ({ ...prev, currentMovie: data[randomIndex] }))
          setUsedMovies(new Set([randomIndex]))
        }
      } catch (error) {
        console.error('Error loading movies:', error)
        // The movieService now has fallback to static data, so this shouldn't happen
        console.log('Using fallback movies data...')
      }
    }
    
    loadMovies()
  }, [])

  const handleGuess = (guessText: string) => {
    if (!gameState.currentMovie || !guessText.trim()) return

    // Use fuzzy matching instead of exact string comparison
    const matchResult = enhancedFuzzyMatch(guessText.trim(), gameState.currentMovie.movie)
    const isCorrect = matchResult.isMatch
    
    setGameState(prev => ({
      ...prev,
      lastResult: {
        correct: isCorrect,
        guess: guessText.trim(),
        correctAnswer: gameState.currentMovie!.movie,
        similarity: matchResult.similarity,
        confidence: matchResult.confidence,
        usedHint: gameState.hintUsed
      }
    }))

    // Update scores
    if (isCorrect) {
      const pointsToAdd = gameState.hintUsed ? 0.5 : 1
      setGameState(prev => ({
        ...prev,
        playerScore: prev.playerScore + pointsToAdd
      }))
    } else {
      setGameState(prev => ({
        ...prev,
        botScore: prev.botScore + 2
      }))
    }

    // Check for winner
    const newPlayerScore = isCorrect ? gameState.playerScore + (gameState.hintUsed ? 0.5 : 1) : gameState.playerScore
    const newBotScore = isCorrect ? gameState.botScore : gameState.botScore + 2
    
    if (newPlayerScore >= 10 || newBotScore >= 10) {
      setGameState(prev => ({
        ...prev,
        gameStatus: 'finished',
        winner: newPlayerScore >= 10 ? 'player' : 'bot'
      }))
    } else {
      // Get next movie
      getNextMovie()
    }
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
      botScore: prev.botScore + 2
    }))

    // Check for winner
    const newBotScore = gameState.botScore + 2
    
    if (newBotScore >= 10) {
      setGameState(prev => ({
        ...prev,
        gameStatus: 'finished',
        winner: 'bot'
      }))
    } else {
      // Get next movie
      getNextMovie()
    }
  }

  const getNextMovie = () => {
    const availableMovies = movies.filter((_, index) => !usedMovies.has(index))
    
    if (availableMovies.length === 0) {
      // Reset used movies if all have been used
      setUsedMovies(new Set())
      const randomIndex = Math.floor(Math.random() * movies.length)
      setGameState(prev => ({ ...prev, currentMovie: movies[randomIndex], hintUsed: false }))
      setUsedMovies(new Set([randomIndex]))
    } else {
      const randomIndex = Math.floor(Math.random() * availableMovies.length)
      const selectedMovie = availableMovies[randomIndex]
      const originalIndex = movies.findIndex(m => m === selectedMovie)
      
      setGameState(prev => ({ ...prev, currentMovie: selectedMovie, hintUsed: false }))
      setUsedMovies(prev => new Set([...prev, originalIndex]))
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
          <h1 className="text-4xl font-bold text-white mb-2">Single Player Mode</h1>
          <p className="text-gray-300">Challenge the AI bot to a movie trivia duel!</p>
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
                <h3 className="text-xl font-bold text-white">AI Bot</h3>
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
                  🎉 You&apos;re the King of Movie Town! 🎉
                </h2>
                <p className="text-xl text-white mb-6">
                  You beat the AI bot {gameState.playerScore % 1 === 0 ? gameState.playerScore : gameState.playerScore.toFixed(1)} to {gameState.botScore}!
                </p>
              </div>
            ) : (
              <div>
                <Trophy className="h-16 w-16 text-red-400 mx-auto mb-4" />
                <h2 className="text-4xl font-bold text-red-400 mb-4">
                  🤖 AI Bot Wins! 🤖
                </h2>
                <p className="text-xl text-white mb-6">
                  The bot beat you {gameState.botScore} to {gameState.playerScore % 1 === 0 ? gameState.playerScore : gameState.playerScore.toFixed(1)}!
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
