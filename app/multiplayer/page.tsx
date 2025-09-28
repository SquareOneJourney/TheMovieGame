'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Users, Film, Star, ArrowRight, Home, CheckCircle, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { tmdbService, TMDBMovie, TMDBCastMember } from '@/lib/tmdb'
import ProtectedRoute from '@/components/ProtectedRoute'

interface SelectedActors {
  actor1: TMDBCastMember | null
  actor2: TMDBCastMember | null
  hintActor: TMDBCastMember | null
}

interface GameSubmission {
  movie: TMDBMovie | null
  actors: SelectedActors
  isComplete: boolean
}

export default function MultiplayerSubmissionPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<TMDBMovie[]>([])
  const [selectedMovie, setSelectedMovie] = useState<TMDBMovie | null>(null)
  const [movieCast, setMovieCast] = useState<TMDBCastMember[]>([])
  const [selectedActors, setSelectedActors] = useState<SelectedActors>({
    actor1: null,
    actor2: null,
    hintActor: null
  })
  const [isSearching, setIsSearching] = useState(false)
  const [isLoadingCast, setIsLoadingCast] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Debounced search function
  const debouncedSearch = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout
      return (query: string) => {
        clearTimeout(timeoutId)
        timeoutId = setTimeout(async () => {
          if (!query.trim()) {
            setSearchResults([])
            return
          }

          setIsSearching(true)
          setError(null)

          try {
            const searchData = await tmdbService.searchMovies(query)
            setSearchResults(searchData.results)
          } catch (err) {
            setError('Failed to search movies. Please try again.')
            console.error('Search error:', err)
          } finally {
            setIsSearching(false)
          }
        }, 300) // 300ms delay
      }
    })(),
    []
  )

  // Search for movies
  const handleSearch = (query: string) => {
    debouncedSearch(query)
  }

  // Handle movie selection
  const handleMovieSelect = async (movie: TMDBMovie) => {
    setSelectedMovie(movie)
    setIsLoadingCast(true)
    setError(null)

    try {
      const movieDetails = await tmdbService.getMovieDetails(movie.id)
      const cast = movieDetails.credits?.cast || []
      
      // Filter for main actors (first 10 cast members)
      const mainActors = cast.filter(actor => actor.order < 10)
      setMovieCast(mainActors)
      
      // Auto-select first two actors as default
      if (mainActors.length >= 2) {
        setSelectedActors({
          actor1: mainActors[0],
          actor2: mainActors[1],
          hintActor: mainActors[2] || null
        })
      }
    } catch (err) {
      setError('Failed to load movie details. Please try again.')
      console.error('Movie details error:', err)
    } finally {
      setIsLoadingCast(false)
    }
  }

  // Handle actor selection
  const handleActorSelect = (actor: TMDBCastMember, type: 'actor1' | 'actor2' | 'hintActor') => {
    setSelectedActors(prev => ({
      ...prev,
      [type]: actor
    }))
  }

  // Check if submission is complete
  const isSubmissionComplete = selectedMovie && selectedActors.actor1 && selectedActors.actor2

  // Validation messages
  const getValidationMessage = () => {
    if (!selectedMovie) return 'Please select a movie'
    if (!selectedActors.actor1) return 'Please select Actor 1'
    if (!selectedActors.actor2) return 'Please select Actor 2'
    if (selectedActors.actor1?.id === selectedActors.actor2?.id) return 'Actor 1 and Actor 2 must be different'
    return null
  }

  const validationMessage = getValidationMessage()

  // Handle form submission
  const handleSubmit = () => {
    if (!isSubmissionComplete || validationMessage) return

    const submission: GameSubmission = {
      movie: selectedMovie,
      actors: selectedActors,
      isComplete: true
    }

    // Generate a unique game ID
    const gameId = Math.random().toString(36).substring(2, 8).toUpperCase()
    
    // Store the submission data in sessionStorage for the game room
    sessionStorage.setItem(`gameSubmission_${gameId}`, JSON.stringify(submission))
    
    // Show success message with game code
    alert(`Game created! Your game code is: ${gameId}\n\nShare this code with your friend to let them join the game.`)
    
    // Redirect to the game room
    window.location.href = `/game/${gameId}`
  }

  // Reset form
  const handleReset = () => {
    setSearchQuery('')
    setSearchResults([])
    setSelectedMovie(null)
    setMovieCast([])
    setSelectedActors({
      actor1: null,
      actor2: null,
      hintActor: null
    })
    setError(null)
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-8">
      <div className="max-w-6xl mx-auto">
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
          <h1 className="text-4xl font-bold text-white mb-2">Create Your Movie Challenge</h1>
          <p className="text-gray-300">Select a movie and two actors for your opponent to guess!</p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            <div className={`flex items-center space-x-2 px-4 py-2 rounded-full ${
              selectedMovie ? 'bg-green-500 text-white' : 'bg-gray-600 text-gray-300'
            }`}>
              <Film className="h-5 w-5" />
              <span>1. Select Movie</span>
            </div>
            <ArrowRight className="h-5 w-5 text-gray-400" />
            <div className={`flex items-center space-x-2 px-4 py-2 rounded-full ${
              selectedActors.actor1 && selectedActors.actor2 ? 'bg-green-500 text-white' : 'bg-gray-600 text-gray-300'
            }`}>
              <Users className="h-5 w-5" />
              <span>2. Select Actors</span>
            </div>
            <ArrowRight className="h-5 w-5 text-gray-400" />
            <div className={`flex items-center space-x-2 px-4 py-2 rounded-full ${
              isSubmissionComplete ? 'bg-green-500 text-white' : 'bg-gray-600 text-gray-300'
            }`}>
              <CheckCircle className="h-5 w-5" />
              <span>3. Submit</span>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-red-500/20 border border-red-500/50 rounded-lg p-4 flex items-center space-x-2"
          >
            <AlertCircle className="h-5 w-5 text-red-400" />
            <span className="text-red-200">{error}</span>
          </motion.div>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Movie Search */}
          <div className="space-y-6">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center space-x-2">
                <Search className="h-6 w-6" />
                <span>Search for a Movie</span>
              </h2>
              
              <div className="relative mb-4">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    handleSearch(e.target.value)
                  }}
                  placeholder="Type a movie title..."
                  className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {isSearching && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  </div>
                )}
              </div>

              {/* Search Results */}
              <AnimatePresence>
                {searchResults.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-2 max-h-64 overflow-y-auto"
                  >
                    {searchResults.map((movie) => (
                      <button
                        key={movie.id}
                        onClick={() => handleMovieSelect(movie)}
                        className="w-full text-left p-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors flex items-center space-x-3"
                      >
                        {movie.poster_path && (
                          <img
                            src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`}
                            alt={movie.title}
                            className="w-12 h-16 object-cover rounded"
                          />
                        )}
                        <div>
                          <h3 className="text-white font-semibold">{movie.title}</h3>
                          <p className="text-gray-300 text-sm">{movie.release_date}</p>
                        </div>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Selected Movie Display */}
            {selectedMovie && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6"
              >
                <h3 className="text-xl font-bold text-white mb-4">Selected Movie</h3>
                <div className="flex items-center space-x-4">
                  {selectedMovie.poster_path && (
                    <img
                      src={`https://image.tmdb.org/t/p/w185${selectedMovie.poster_path}`}
                      alt={selectedMovie.title}
                      className="w-20 h-28 object-cover rounded"
                    />
                  )}
                  <div>
                    <h4 className="text-white font-bold text-lg">{selectedMovie.title}</h4>
                    <p className="text-gray-300">{selectedMovie.release_date}</p>
                    <div className="flex items-center space-x-1 mt-1">
                      <Star className="h-4 w-4 text-yellow-400" />
                      <span className="text-yellow-400">{selectedMovie.vote_average.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Selected Actors Preview */}
            {selectedMovie && (selectedActors.actor1 || selectedActors.actor2) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6"
              >
                <h3 className="text-xl font-bold text-white mb-4">Selected Actors</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {selectedActors.actor1 && (
                    <div className="flex items-center space-x-3 p-3 bg-blue-500/20 rounded-lg">
                      {selectedActors.actor1.profile_path && (
                        <img
                          src={`https://image.tmdb.org/t/p/w92${selectedActors.actor1.profile_path}`}
                          alt={selectedActors.actor1.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      )}
                      <div>
                        <p className="text-white font-semibold">{selectedActors.actor1.name}</p>
                        <p className="text-gray-300 text-sm">{selectedActors.actor1.character}</p>
                      </div>
                    </div>
                  )}
                  {selectedActors.actor2 && (
                    <div className="flex items-center space-x-3 p-3 bg-green-500/20 rounded-lg">
                      {selectedActors.actor2.profile_path && (
                        <img
                          src={`https://image.tmdb.org/t/p/w92${selectedActors.actor2.profile_path}`}
                          alt={selectedActors.actor2.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      )}
                      <div>
                        <p className="text-white font-semibold">{selectedActors.actor2.name}</p>
                        <p className="text-gray-300 text-sm">{selectedActors.actor2.character}</p>
                      </div>
                    </div>
                  )}
                </div>
                {selectedActors.hintActor && (
                  <div className="mt-4 p-3 bg-yellow-500/20 rounded-lg">
                    <p className="text-yellow-200 text-sm font-semibold mb-2">Hint Actor:</p>
                    <div className="flex items-center space-x-3">
                      {selectedActors.hintActor.profile_path && (
                        <img
                          src={`https://image.tmdb.org/t/p/w92${selectedActors.hintActor.profile_path}`}
                          alt={selectedActors.hintActor.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      )}
                      <div>
                        <p className="text-white font-semibold">{selectedActors.hintActor.name}</p>
                        <p className="text-gray-300 text-sm">{selectedActors.hintActor.character}</p>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </div>

          {/* Right Column - Actor Selection */}
          <div className="space-y-6">
            {selectedMovie && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6"
              >
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center space-x-2">
                  <Users className="h-6 w-6" />
                  <span>Select Actors</span>
                </h2>

                {isLoadingCast ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                    <span className="ml-3 text-white">Loading cast...</span>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Actor 1 Selection */}
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">
                        Actor 1 {selectedActors.actor1 && <CheckCircle className="inline h-5 w-5 text-green-400 ml-2" />}
                      </h3>
                      <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                        {movieCast.map((actor) => (
                          <button
                            key={actor.id}
                            onClick={() => handleActorSelect(actor, 'actor1')}
                            className={`p-2 rounded-lg text-left transition-colors ${
                              selectedActors.actor1?.id === actor.id
                                ? 'bg-blue-500 text-white'
                                : 'bg-white/10 hover:bg-white/20 text-gray-300'
                            }`}
                          >
                            <div className="flex items-center space-x-2">
                              {actor.profile_path && (
                                <img
                                  src={`https://image.tmdb.org/t/p/w45${actor.profile_path}`}
                                  alt={actor.name}
                                  className="w-8 h-8 rounded-full object-cover"
                                />
                              )}
                              <div>
                                <p className="text-sm font-medium">{actor.name}</p>
                                <p className="text-xs opacity-75">{actor.character}</p>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Actor 2 Selection */}
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">
                        Actor 2 {selectedActors.actor2 && <CheckCircle className="inline h-5 w-5 text-green-400 ml-2" />}
                      </h3>
                      <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                        {movieCast.map((actor) => (
                          <button
                            key={actor.id}
                            onClick={() => handleActorSelect(actor, 'actor2')}
                            className={`p-2 rounded-lg text-left transition-colors ${
                              selectedActors.actor2?.id === actor.id
                                ? 'bg-blue-500 text-white'
                                : 'bg-white/10 hover:bg-white/20 text-gray-300'
                            }`}
                          >
                            <div className="flex items-center space-x-2">
                              {actor.profile_path && (
                                <img
                                  src={`https://image.tmdb.org/t/p/w45${actor.profile_path}`}
                                  alt={actor.name}
                                  className="w-8 h-8 rounded-full object-cover"
                                />
                              )}
                              <div>
                                <p className="text-sm font-medium">{actor.name}</p>
                                <p className="text-xs opacity-75">{actor.character}</p>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Hint Actor Selection (Optional) */}
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">
                        Hint Actor (Optional) {selectedActors.hintActor && <CheckCircle className="inline h-5 w-5 text-green-400 ml-2" />}
                      </h3>
                      <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                        {movieCast.map((actor) => (
                          <button
                            key={actor.id}
                            onClick={() => handleActorSelect(actor, 'hintActor')}
                            className={`p-2 rounded-lg text-left transition-colors ${
                              selectedActors.hintActor?.id === actor.id
                                ? 'bg-blue-500 text-white'
                                : 'bg-white/10 hover:bg-white/20 text-gray-300'
                            }`}
                          >
                            <div className="flex items-center space-x-2">
                              {actor.profile_path && (
                                <img
                                  src={`https://image.tmdb.org/t/p/w45${actor.profile_path}`}
                                  alt={actor.name}
                                  className="w-8 h-8 rounded-full object-cover"
                                />
                              )}
                              <div>
                                <p className="text-sm font-medium">{actor.name}</p>
                                <p className="text-xs opacity-75">{actor.character}</p>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Validation Message */}
            {validationMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-3 flex items-center space-x-2"
              >
                <AlertCircle className="h-5 w-5 text-yellow-400" />
                <span className="text-yellow-200">{validationMessage}</span>
              </motion.div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <button
                onClick={handleReset}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                Reset
              </button>
              <button
                onClick={handleSubmit}
                disabled={!isSubmissionComplete || !!validationMessage}
                className={`flex-1 font-bold py-3 px-6 rounded-lg transition-colors ${
                  isSubmissionComplete && !validationMessage
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-gray-500 text-gray-300 cursor-not-allowed'
                }`}
              >
                Submit Challenge
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    </ProtectedRoute>
  )
}
