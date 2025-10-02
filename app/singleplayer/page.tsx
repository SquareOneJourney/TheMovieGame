'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Crown, Bot, User, Trophy, Home } from 'lucide-react'
import { movieService, GameMovie } from '@/lib/movieService'
import { enhancedFuzzyMatch } from '@/lib/fuzzyMatch'
import { MultipleChoiceInput } from '@/components/MultipleChoiceInput'
import { generateMultipleChoiceOptions, MultipleChoiceOption } from '@/lib/multipleChoiceGenerator'
import { Scoreboard } from '@/components/Scoreboard'
import Link from 'next/link'

// Force dynamic rendering to prevent static generation issues
export const dynamic = 'force-dynamic'

interface GameState {
  currentMovie: GameMovie | null
  currentOptions: MultipleChoiceOption[]
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
    currentOptions: [],
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

  // Helper function to select the best 2 actors from 5 available
  const selectBestActors = (movie: GameMovie) => {
    const actors = [
      { name: movie.actor1, photo: movie.actor1Photo, priority: 1 },
      { name: movie.actor2, photo: movie.actor2Photo, priority: 2 },
      { name: movie.actor3, photo: movie.actor3Photo, priority: 3 },
      { name: movie.actor4, photo: movie.actor4Photo, priority: 4 },
      { name: movie.actor5, photo: movie.actor5Photo, priority: 5 }
    ].filter(actor => actor.name) // Only include actors with names

    // Sort by priority (lower number = higher priority)
    const sortedActors = actors.sort((a, b) => a.priority - b.priority)
    
    // Select the first 2 actors as the main actors
    const mainActors = sortedActors.slice(0, 2)
    
    // Select the 3rd actor as hint actor (if available)
    const hintActor = sortedActors[2] || null

    return {
      actor1: mainActors[0]?.name || '',
      actor1Photo: mainActors[0]?.photo || '',
      actor2: mainActors[1]?.name || '',
      actor2Photo: mainActors[1]?.photo || '',
      hintActor: hintActor?.name || movie.hintActor || '',
      hintActorPhoto: hintActor?.photo || movie.hintActorPhoto || ''
    }
  }

  // Load movies from pre-built static database
  useEffect(() => {
    const loadMovies = async () => {
      try {
        console.log('🎬 Loading movies from static database...')
        
        // Load fewer movies for faster loading
        const data = await movieService.getRandomMovies(50) // Reduced from 200 to 50
        console.log('🎬 Loaded movies:', data.length, 'movies')
        console.log('🎬 Sample movie:', data[0])
        console.log('🎬 Sample movie actor1Photo:', data[0]?.actor1Photo)
        console.log('🎬 Sample movie actor2Photo:', data[0]?.actor2Photo)
        
        if (data && data.length > 0) {
          setMovies(data)
          setIsLoading(false)
          // Start with a random movie and generate options
          const randomIndex = Math.floor(Math.random() * data.length)
          const randomMovie = data[randomIndex]
          const options = generateMultipleChoiceOptions(randomMovie, data)
          setGameState(prev => ({ 
            ...prev, 
            currentMovie: randomMovie,
            currentOptions: options
          }))
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

  const handleGuess = (selectedOption: MultipleChoiceOption) => {
    if (!gameState.currentMovie) return

    // Check if the selected option is correct
    const isCorrect = selectedOption.isCorrect
    
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
          guess: selectedOption.title,
          correctAnswer: gameState.currentMovie!.movie,
          similarity: isCorrect ? 1 : 0,
          confidence: isCorrect ? 'exact' : 'none',
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
            const nextOptions = generateMultipleChoiceOptions(nextMovie, movies)
            return {
              ...prev,
              currentMovie: nextMovie,
              currentOptions: nextOptions,
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
    if (movies.length > 0) {
      const randomMovie = movies[Math.floor(Math.random() * movies.length)]
      const options = generateMultipleChoiceOptions(randomMovie, movies)
      setGameState({
        currentMovie: randomMovie,
        currentOptions: options,
        playerScore: 0,
        botScore: 0,
        gameStatus: 'playing',
        winner: null,
        hintUsed: false,
        lastResult: null
      })
    } else {
      setGameState({
        currentMovie: null,
        currentOptions: [],
        playerScore: 0,
        botScore: 0,
        gameStatus: 'playing',
        winner: null,
        hintUsed: false,
        lastResult: null
      })
    }
    setUsedMovies(new Set())
  }

  // Show loading screen while movies are loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-white mb-2">Loading Game...</h2>
          <p className="text-gray-300">Preparing your movie trivia challenge</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mobile-min-h-screen min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-1 sm:p-2 md:p-4 lg:p-6 xl:p-8 relative">
      {/* Left Theater Curtain - Hidden on mobile */}
      <div className="fixed left-0 top-0 w-96 sm:w-[30rem] lg:w-[36rem] h-full z-10 pointer-events-none hidden sm:block">
        <div className="relative w-full h-full">
          {/* Curtain fabric with curved opening effect */}
          <div className="absolute inset-0 bg-gradient-to-b from-red-800 via-red-700 to-red-900 shadow-2xl" 
               style={{
                 clipPath: 'polygon(0% 0%, 100% 0%, 85% 20%, 70% 40%, 60% 60%, 50% 80%, 40% 100%, 0% 100%)'
               }}>
            {/* Curtain folds */}
            <div className="absolute inset-0 bg-gradient-to-r from-red-900/50 via-transparent to-red-800/30"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-red-700/40 via-transparent to-red-900/40"></div>
            
            {/* Vertical fold lines - curved to follow the curtain shape */}
            <div className="absolute top-0 bottom-0 left-1/4 w-px bg-red-900/60" 
                 style={{clipPath: 'polygon(0% 0%, 100% 0%, 85% 20%, 70% 40%, 60% 60%, 50% 80%, 40% 100%, 0% 100%)'}}></div>
            <div className="absolute top-0 bottom-0 left-1/2 w-px bg-red-800/50" 
                 style={{clipPath: 'polygon(0% 0%, 100% 0%, 85% 20%, 70% 40%, 60% 60%, 50% 80%, 40% 100%, 0% 100%)'}}></div>
            <div className="absolute top-0 bottom-0 left-3/4 w-px bg-red-900/60" 
                 style={{clipPath: 'polygon(0% 0%, 100% 0%, 85% 20%, 70% 40%, 60% 60%, 50% 80%, 40% 100%, 0% 100%)'}}></div>
            
            {/* Curtain tassels/fringe - following the curved bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-t from-red-900 to-red-800"
                 style={{clipPath: 'polygon(0% 0%, 100% 0%, 85% 20%, 70% 40%, 60% 60%, 50% 80%, 40% 100%, 0% 100%)'}}>
              <div className="flex justify-between px-1">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="w-1 h-1 bg-red-900 rounded-full"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Theater Curtain - Hidden on mobile */}
      <div className="fixed right-0 top-0 w-96 sm:w-[30rem] lg:w-[36rem] h-full z-10 pointer-events-none hidden sm:block">
        <div className="relative w-full h-full">
          {/* Curtain fabric with curved opening effect */}
          <div className="absolute inset-0 bg-gradient-to-b from-red-800 via-red-700 to-red-900 shadow-2xl" 
               style={{
                 clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 60% 100%, 50% 80%, 40% 60%, 30% 40%, 15% 20%, 0% 0%)'
               }}>
            {/* Curtain folds */}
            <div className="absolute inset-0 bg-gradient-to-l from-red-900/50 via-transparent to-red-800/30"></div>
            <div className="absolute inset-0 bg-gradient-to-l from-red-700/40 via-transparent to-red-900/40"></div>
            
            {/* Vertical fold lines - curved to follow the curtain shape */}
            <div className="absolute top-0 bottom-0 right-1/4 w-px bg-red-900/60" 
                 style={{clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 60% 100%, 50% 80%, 40% 60%, 30% 40%, 15% 20%, 0% 0%)'}}></div>
            <div className="absolute top-0 bottom-0 right-1/2 w-px bg-red-800/50" 
                 style={{clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 60% 100%, 50% 80%, 40% 60%, 30% 40%, 15% 20%, 0% 0%)'}}></div>
            <div className="absolute top-0 bottom-0 right-3/4 w-px bg-red-900/60" 
                 style={{clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 60% 100%, 50% 80%, 40% 60%, 30% 40%, 15% 20%, 0% 0%)'}}></div>
            
            {/* Curtain tassels/fringe - following the curved bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-t from-red-900 to-red-800"
                 style={{clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 60% 100%, 50% 80%, 40% 60%, 30% 40%, 15% 20%, 0% 0%)'}}>
              <div className="flex justify-between px-1">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="w-1 h-1 bg-red-900 rounded-full"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto relative z-20">
        {/* Header - Mobile Optimized */}
        <div className="mb-1 sm:mb-2 md:mb-6">
          <div className="flex justify-between items-center mb-1 sm:mb-2 md:mb-6">
            <Link
              href="/"
              className="flex items-center space-x-1 sm:space-x-2 text-white hover:text-blue-400 transition-colors"
            >
              <Home className="h-3 w-3 sm:h-4 sm:w-4 md:h-6 md:w-6" />
              <span className="text-xs sm:text-sm md:text-base">Home</span>
            </Link>
            <div className="flex-1"></div>
          </div>

        </div>

        {/* Movie Marquee Scoreboard - Mobile Optimized */}
        <div className="mb-2 sm:mb-4 md:mb-8">
          <Scoreboard
            players={[
              {
                id: 'player',
                name: 'You',
                score: Number.isInteger(gameState.playerScore)
                  ? gameState.playerScore
                  : Number(gameState.playerScore.toFixed(1)),
              },
              {
                id: 'bot',
                name: 'Mr. Robot',
                score: gameState.botScore,
              },
            ]}
            highlightedPlayerId={
              gameState.lastResult?.correct === undefined
                ? undefined
                : gameState.lastResult.correct
                  ? 'player'
                  : 'bot'
            }
            resultFlash={gameState.lastResult}
          />
        </div>

        {/* Game Content - Mobile Optimized */}
        {gameState.gameStatus === 'playing' ? (
          <div className="mobile-space-y-1 space-y-1 sm:space-y-2 md:space-y-3 lg:space-y-4">
            {/* Current Clue */}
            {gameState.currentMovie && gameState.currentOptions.length > 0 && (
              <MultipleChoiceInput
                clue={{
                  ...selectBestActors(gameState.currentMovie),
                  movie: gameState.currentMovie.movie,
                  poster: gameState.currentMovie.poster,
                  year: gameState.currentMovie.year
                }}
                options={gameState.currentOptions}
                onSelect={handleGuess}
                onHint={handleHint}
                disabled={!!gameState.lastResult}
                hintUsed={gameState.hintUsed}
                lastResult={gameState.lastResult}
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

        {/* Play Again CTA */}
        {gameState.gameStatus === 'finished' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-8 text-center"
          >
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-2">Ready for another round?</h3>
              <p className="text-gray-300 mb-4">Test your movie knowledge against Mr. Robot again!</p>
              <a 
                href="/"
                className="inline-block bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                Back to Home
              </a>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
