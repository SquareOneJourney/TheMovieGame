'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Search, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { enhancedFuzzyMatch } from '@/lib/fuzzyMatch'

interface GuessInputProps {
  clue: {
    actor1: string
    actor2: string
    movie?: string
    poster?: string
    year?: string
  }
  onGuess: (guess: string) => void
  disabled?: boolean
  lastResult?: {
    correct: boolean
    guess: string
    correctAnswer?: string
    similarity?: number
    confidence?: 'exact' | 'high' | 'medium' | 'low' | 'none'
  }
}

export function GuessInput({ clue, onGuess, disabled = false, lastResult }: GuessInputProps) {
  const [guess, setGuess] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!guess.trim() || disabled || isSubmitting) {
      return
    }

    setIsSubmitting(true)
    
    try {
      await onGuess(guess.trim())
      setGuess('')
    } catch (error) {
      console.error('Error submitting guess:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const isFormValid = guess.trim() && !disabled && !isSubmitting

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-4"
    >
      {/* Current Clue Display */}
      <Card className="bg-white/10 backdrop-blur-sm border-white/20">
        <CardHeader>
          <CardTitle className="text-white text-center">
            🎬 Movie Clue 🎬
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            {/* Movie Poster */}
            {clue.poster && (
              <div className="flex justify-center">
                <img 
                  src={clue.poster} 
                  alt="Movie poster"
                  className="w-24 h-36 object-cover rounded-lg shadow-lg"
                />
              </div>
            )}
            
            <div className="text-lg text-white">
              <span className="font-bold text-blue-300">{clue.actor1}</span>
              <span className="mx-2 text-gray-400">&</span>
              <span className="font-bold text-blue-300">{clue.actor2}</span>
            </div>
            
            {clue.year && (
              <p className="text-sm text-gray-400">Released in {clue.year}</p>
            )}
            
            <p className="text-sm text-gray-400">
              What movie are these actors from?
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Last Result Display */}
      {lastResult && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Card className={`${
            lastResult.correct 
              ? 'bg-green-500/20 border-green-400' 
              : lastResult.similarity && lastResult.similarity >= 60
                ? 'bg-yellow-500/20 border-yellow-400'
                : 'bg-red-500/20 border-red-400'
          }`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-center space-x-2">
                {lastResult.correct ? (
                  <CheckCircle className="h-6 w-6 text-green-400" />
                ) : lastResult.similarity && lastResult.similarity >= 60 ? (
                  <AlertCircle className="h-6 w-6 text-yellow-400" />
                ) : (
                  <XCircle className="h-6 w-6 text-red-400" />
                )}
                <div className="text-center">
                  <p className={`font-bold ${
                    lastResult.correct 
                      ? 'text-green-400' 
                      : lastResult.similarity && lastResult.similarity >= 60
                        ? 'text-yellow-400'
                        : 'text-red-400'
                  }`}>
                    {lastResult.correct 
                      ? 'Correct!' 
                      : lastResult.similarity && lastResult.similarity >= 60
                        ? 'Close!'
                        : 'Wrong!'
                    }
                  </p>
                  <p className="text-sm text-gray-300">
                    You guessed: "{lastResult.guess}"
                    {lastResult.correctAnswer && (
                      <span className="block">
                        The answer: "{lastResult.correctAnswer}"
                      </span>
                    )}
                    {lastResult.similarity && lastResult.similarity >= 60 && !lastResult.correct && (
                      <span className="block text-yellow-300 text-xs mt-1">
                        {lastResult.similarity.toFixed(0)}% match - try again with a slight variation!
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Guess Input Form */}
      <Card className="bg-white/10 backdrop-blur-sm border-white/20">
        <CardHeader>
          <CardTitle className="text-white text-center flex items-center justify-center space-x-2">
            <Search className="h-6 w-6" />
            <span>Make Your Guess</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="guess" className="block text-sm font-medium text-gray-300 mb-2">
                Movie Title
              </label>
              <Input
                id="guess"
                type="text"
                placeholder="Enter the movie title"
                value={guess}
                onChange={(e) => setGuess(e.target.value)}
                disabled={disabled || isSubmitting}
                className="bg-white/20 border-white/30 text-white placeholder:text-gray-400 focus:ring-blue-400"
                autoComplete="off"
                autoFocus
              />
            </div>

            <motion.div
              whileHover={isFormValid ? { scale: 1.02 } : {}}
              whileTap={isFormValid ? { scale: 0.98 } : {}}
            >
              <Button
                type="submit"
                disabled={!isFormValid}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Submitting...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Search className="h-4 w-4" />
                    <span>Submit Guess</span>
                  </div>
                )}
              </Button>
            </motion.div>

            {/* Instructions */}
            <div className="text-center">
              <p className="text-sm text-gray-400">
                Type the full movie title as accurately as possible
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  )
}
