'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Search, CheckCircle, AlertCircle, XCircle } from 'lucide-react'
import { enhancedFuzzyMatch } from '@/lib/fuzzyMatch'
import { ActorPhoto } from '@/components/ActorPhoto'

interface GuessInputProps {
  clue: {
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
  onGuess: (guess: string) => void
  onHint?: () => void
  disabled?: boolean
  hintUsed?: boolean
  lastResult?: {
    correct: boolean
    guess: string
    correctAnswer?: string
    similarity?: number
    confidence?: 'exact' | 'high' | 'medium' | 'low' | 'none'
  }
}

export function GuessInput({ clue, onGuess, onHint, disabled = false, hintUsed = false, lastResult }: GuessInputProps) {
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


  const handleHint = async () => {
    if (disabled || isSubmitting || !onHint) {
      return
    }

    setIsSubmitting(true)
    
    try {
      await onHint()
    } catch (error) {
      console.error('Error using hint:', error)
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
      className="space-y-2 sm:space-y-3"
    >
      {/* Current Clue Display */}
      <Card className="bg-white/10 backdrop-blur-sm border-white/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-white text-center text-lg">
            🎬 Movie Clue 🎬
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-3">
          <div className="text-center space-y-3">
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 text-base sm:text-lg text-white">
              <div className="flex items-center space-x-3">
                <ActorPhoto 
                  src={clue.actor1Photo} 
                  name={clue.actor1} 
                  size="lg"
                />
                <span className="font-bold text-blue-300 text-sm sm:text-base">{clue.actor1}</span>
              </div>
              <span className="text-gray-400 hidden sm:inline">&</span>
              <span className="text-gray-400 sm:hidden">and</span>
              <div className="flex items-center space-x-3">
                <ActorPhoto 
                  src={clue.actor2Photo} 
                  name={clue.actor2} 
                  size="lg"
                />
                <span className="font-bold text-blue-300 text-sm sm:text-base">{clue.actor2}</span>
              </div>
            </div>
            
            {/* Hint Actor Display */}
            {hintUsed && clue.hintActor && (
              <div className="flex items-center justify-center space-x-3 mt-4">
                <span className="text-sm text-gray-400">Hint:</span>
                <div className="flex items-center space-x-2">
                  <ActorPhoto 
                    src={clue.hintActorPhoto} 
                    name={clue.hintActor} 
                    size="md"
                  />
                  <span className="font-bold text-yellow-300">{clue.hintActor}</span>
                </div>
              </div>
            )}
            
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
              : 'bg-red-500/20 border-red-400'
          }`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-center space-x-2">
                {lastResult.correct ? (
                  <CheckCircle className="h-6 w-6 text-green-400" />
                ) : (
                  <XCircle className="h-6 w-6 text-red-400" />
                )}
                <div className="text-center">
                  <p className={`font-bold ${
                    lastResult.correct 
                      ? 'text-green-400' 
                      : 'text-red-400'
                  }`}>
                    {lastResult.correct 
                      ? 'Elementary, my dear Watson!' 
                      : 'Houston, we have a problem!'
                    }
                  </p>
                  <p className="text-sm text-gray-300">
                    You guessed: &quot;{lastResult.guess}&quot;
                    {lastResult.correctAnswer && (
                      <span className="block">
                        The answer: &quot;{lastResult.correctAnswer}&quot;
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
        <CardHeader className="pb-3">
          <CardTitle className="text-white text-center flex items-center justify-center space-x-2 text-lg">
            <Search className="h-5 w-5" />
            <span>Make Your Guess</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-3">
          <form onSubmit={handleSubmit} className="space-y-3">
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

            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
              <motion.div
                whileHover={isFormValid ? { scale: 1.02 } : {}}
                whileTap={isFormValid ? { scale: 0.98 } : {}}
                className="flex-1"
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

              <div className="flex justify-center">
                <motion.div
                  whileHover={!disabled && !isSubmitting && !hintUsed ? { scale: 1.02 } : {}}
                  whileTap={!disabled && !isSubmitting && !hintUsed ? { scale: 0.98 } : {}}
                >
                  <Button
                    type="button"
                    onClick={handleHint}
                    disabled={disabled || isSubmitting || !onHint || hintUsed}
                    className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 disabled:from-gray-500 disabled:to-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    title={hintUsed ? "Hint already used" : "Get a hint (costs half a point if correct)"}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Submitting...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <span>💡</span>
                        <span className="hidden sm:inline">Hint</span>
                      </div>
                    )}
                  </Button>
                </motion.div>
              </div>
            </div>

            {/* Hint Warning */}
            {hintUsed && (
              <div className="text-center">
                <p className="text-yellow-300 text-sm">
                  ⚠️ Hint used! Correct answer will only give 0.5 points
                </p>
              </div>
            )}

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
