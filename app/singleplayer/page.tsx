'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Crown, Bot, User, Trophy, Home } from 'lucide-react'
import { movieService, GameMovie } from '@/lib/movieService'
import { enhancedFuzzyMatch } from '@/lib/fuzzyMatch'
import Link from 'next/link'

interface Movie {
  actor1: string
  actor2: string
  movie: string
  poster?: string
  year?: string
  hintActor?: string
}

interface GameState {
  currentMovie: Movie | null
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
  
  const [guess, setGuess] = useState('')
  const [movies, setMovies] = useState<Movie[]>([])
  const [usedMovies, setUsedMovies] = useState<Set<number>>(new Set())

  // Load movies from TMDB API with fallback to static data
  useEffect(() => {
    const loadMovies = async () => {
      try {
        const data = await movieService.getRandomMovies(50) // Load 50 movies for variety
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

  const handleGuess = () => {
    if (!gameState.currentMovie || !guess.trim()) return

    // Use fuzzy matching instead of exact string comparison
    const matchResult = enhancedFuzzyMatch(guess.trim(), gameState.currentMovie.movie)
    const isCorrect = matchResult.isMatch
    
    setGameState(prev => ({
      ...prev,
      lastResult: {
        correct: isCorrect,
        guess: guess.trim(),
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

    setGuess('')
  }

  const handleHint = () => {
    if (!gameState.currentMovie || gameState.hintUsed) return
    
    setGameState(prev => ({
      ...prev,
      hintUsed: true
    }))
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
    setGuess('')
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
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 text-center"
              >
                <h2 className="text-2xl font-bold text-white mb-4">🎬 Movie Clue 🎬</h2>
                
                {/* Movie Poster */}
                {gameState.currentMovie.poster && (
                  <div className="mb-4">
                    <img 
                      src={gameState.currentMovie.poster} 
                      alt="Movie poster"
                      className="w-32 h-48 object-cover rounded-lg mx-auto shadow-lg"
                    />
                  </div>
                )}
                
                <div className="text-xl text-white">
                  <span className="font-bold text-blue-300">{gameState.currentMovie.actor1}</span>
                  <span className="mx-4 text-gray-400">&</span>
                  <span className="font-bold text-blue-300">{gameState.currentMovie.actor2}</span>
                  
                  {/* Hint Actor */}
                  {gameState.hintUsed && (
                    <div className="mt-2">
                      <span className="text-sm text-gray-400">Hint: </span>
                      <span className="font-bold text-yellow-300">
                        {gameState.currentMovie.hintActor || "No additional actor available"}
                      </span>
                    </div>
                  )}
                </div>
                
                {gameState.currentMovie.year && (
                  <p className="text-gray-400 text-sm mt-1">Released in {gameState.currentMovie.year}</p>
                )}
                
                <p className="text-gray-300 mt-2">What movie are these actors from?</p>
              </motion.div>
            )}

            {/* Last Result */}
            <AnimatePresence>
              {gameState.lastResult && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className={`${
                    gameState.lastResult.correct 
                      ? 'bg-green-500/20 border-green-400' 
                      : gameState.lastResult.similarity && gameState.lastResult.similarity >= 60
                        ? 'bg-yellow-500/20 border-yellow-400'
                        : 'bg-red-500/20 border-red-400'
                  } border rounded-lg p-4 text-center`}
                >
                  <p className={`font-bold ${
                    gameState.lastResult.correct 
                      ? 'text-green-400' 
                      : gameState.lastResult.similarity && gameState.lastResult.similarity >= 60
                        ? 'text-yellow-400'
                        : 'text-red-400'
                  }`}>
                    {gameState.lastResult.correct 
                      ? 'Correct!' 
                      : gameState.lastResult.similarity && gameState.lastResult.similarity >= 60
                        ? 'Close!'
                        : 'Wrong!'
                    }
                  </p>
                  <p className="text-gray-300">
                    You guessed: "{gameState.lastResult.guess}"
                    {gameState.lastResult.usedHint && gameState.lastResult.correct && (
                      <span className="block text-yellow-300 text-sm">
                        💡 Used hint - only 0.5 points earned!
                      </span>
                    )}
                    {gameState.lastResult.correctAnswer && (
                      <span className="block">
                        The answer: "{gameState.lastResult.correctAnswer}"
                      </span>
                    )}
                    {gameState.lastResult.similarity && gameState.lastResult.similarity >= 60 && !gameState.lastResult.correct && (
                      <span className="block text-yellow-300 text-sm mt-1">
                        {gameState.lastResult.similarity.toFixed(0)}% match - try again with a slight variation!
                      </span>
                    )}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Guess Input */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
              <div className="space-y-4">
                <input
                  type="text"
                  value={guess}
                  onChange={(e) => setGuess(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleGuess()}
                  placeholder="Enter the movie title..."
                  className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder:text-gray-400 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                />
                
                <div className="flex space-x-3">
                  <button
                    onClick={handleGuess}
                    disabled={!guess.trim()}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition-colors"
                  >
                    Submit Guess
                  </button>
                  
                  <button
                    onClick={handleHint}
                    disabled={gameState.hintUsed}
                    className="bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-colors"
                    title={gameState.hintUsed ? "Hint already used" : "Get a hint (costs half a point if correct)"}
                  >
                    💡 Hint
                  </button>
                </div>
                
                {gameState.hintUsed && (
                  <p className="text-yellow-300 text-sm text-center">
                    ⚠️ Hint used! Correct answer will only give 0.5 points
                  </p>
                )}
              </div>
            </div>
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
                  🎉 You're the King of Movie Town! 🎉
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
