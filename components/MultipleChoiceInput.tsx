'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ActorPhoto } from '@/components/ActorPhoto'

interface MultipleChoiceOption {
  id: string
  title: string
  year: string
  poster?: string
  isCorrect: boolean
}

interface MultipleChoiceInputProps {
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
  options: MultipleChoiceOption[]
  onSelect: (selectedOption: MultipleChoiceOption) => void
  onHint?: () => void
  disabled?: boolean
  hintUsed?: boolean
  lastResult?: {
    correct: boolean
    guess: string
    correctAnswer?: string
  } | null
}

export function MultipleChoiceInput({ 
  clue, 
  options, 
  onSelect, 
  onHint, 
  disabled = false, 
  hintUsed = false,
  lastResult
}: MultipleChoiceInputProps) {
  const [selectedOption, setSelectedOption] = useState<MultipleChoiceOption | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Reset selectedOption when options change (new round starts)
  useEffect(() => {
    setSelectedOption(null)
  }, [options])

  const handleOptionSelect = async (option: MultipleChoiceOption) => {
    if (disabled || isSubmitting) return

    setSelectedOption(option)
    setIsSubmitting(true)
    
    try {
      await onSelect(option)
    } catch (error) {
      console.error('Error selecting option:', error)
    } finally {
      setIsSubmitting(false)
    }
  }


  const handleHint = async () => {
    if (disabled || isSubmitting || !onHint) return

    setIsSubmitting(true)
    
    try {
      await onHint()
    } catch (error) {
      console.error('Error using hint:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-1 sm:space-y-2 md:space-y-3 pb-8 sm:pb-12"
    >
      {/* Current Clue Display - Mobile Optimized */}
      <Card className="bg-gradient-to-b from-[#fffef8] via-[#fffcf0] to-[#fffef8]">
        <CardContent className="p-4 sm:p-6">
          
          <div className="relative text-center space-y-1 sm:space-y-2">
            <h3 className="text-slate-900 text-center flex items-center justify-center space-x-1 sm:space-x-2 text-sm sm:text-base md:text-lg font-bold mb-2 sm:mb-3">
              <Image src="/TheMovieGame Logo.png" alt="The Movie Game Logo" width={20} height={20} className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>Movie Clue</span>
              <Image src="/TheMovieGame Logo.png" alt="The Movie Game Logo" width={20} height={20} className="h-4 w-4 sm:h-5 sm:w-5" />
            </h3>
            {/* Mobile Layout - Completely separate vertical layout */}
            <div className="sm:hidden flex flex-col items-center space-y-4 w-full px-4">
              {/* Actor 1: Photo on left, name on right */}
              <div className="flex items-center justify-center space-x-3 w-full">
                <ActorPhoto 
                  src={clue.actor1Photo} 
                  name={clue.actor1} 
                  size="md"
                />
                <span className="font-bold text-slate-700 text-sm">{clue.actor1}</span>
              </div>
              
              {/* "and" separator */}
              <span className="text-slate-500 text-sm font-medium">and</span>
              
              {/* Actor 2: Name on left, photo on right */}
              <div className="flex items-center justify-center space-x-3 w-full">
                <span className="font-bold text-slate-700 text-sm">{clue.actor2}</span>
                <ActorPhoto 
                  src={clue.actor2Photo} 
                  name={clue.actor2} 
                  size="md"
                />
              </div>
            </div>
            
            {/* Desktop Layout - Completely separate horizontal layout */}
            <div className="hidden sm:flex items-center justify-center space-x-4 md:space-x-6 text-sm sm:text-base md:text-lg px-4">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <ActorPhoto 
                  src={clue.actor1Photo} 
                  name={clue.actor1} 
                  size="md"
                />
                <span className="font-bold text-slate-700 text-xs sm:text-sm md:text-base">{clue.actor1}</span>
              </div>
              <span className="text-slate-500">&</span>
              <div className="flex items-center space-x-2 sm:space-x-3">
                <span className="font-bold text-slate-700 text-xs sm:text-sm md:text-base">{clue.actor2}</span>
                <ActorPhoto 
                  src={clue.actor2Photo} 
                  name={clue.actor2} 
                  size="md"
                />
              </div>
            </div>
            
            {/* Hint Actor Display - Mobile Optimized */}
            {hintUsed && clue.hintActor && (
              <div className="flex items-center justify-center space-x-2 sm:space-x-3 mt-2 sm:mt-3">
                <span className="text-xs sm:text-sm text-slate-500">Hint:</span>
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <ActorPhoto 
                    src={clue.hintActorPhoto} 
                    name={clue.hintActor} 
                    size="sm"
                  />
                  <span className="font-bold text-orange-600 text-xs sm:text-sm">{clue.hintActor}</span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>


      {/* Multiple Choice Options - Mobile Optimized */}
      <Card className="bg-gradient-to-b from-[#fffef8] via-[#fffcf0] to-[#fffef8]">
        <CardContent className="p-2 sm:p-4">
          
          <div className="relative">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <h3 className="text-slate-900 flex items-center space-x-1 sm:space-x-2 text-sm sm:text-base md:text-lg font-bold">
                <Image src="/TheMovieGame Logo.png" alt="The Movie Game Logo" width={40} height={40} className="h-8 w-8 sm:h-10 sm:w-10" />
                <span>Choose Wisely</span>
              </h3>
              
              {/* Hint Button - Moved here for better space utilization */}
              <motion.div
                whileHover={!disabled && !isSubmitting && !hintUsed ? { scale: 1.02 } : {}}
                whileTap={!disabled && !isSubmitting && !hintUsed ? { scale: 0.98 } : {}}
              >
                <Button
                  onClick={handleHint}
                  disabled={disabled || isSubmitting || !onHint || hintUsed}
                  className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 disabled:from-gray-500 disabled:to-gray-600 text-white font-bold py-1 sm:py-1.5 px-2 sm:px-3 rounded-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
                  title={hintUsed ? "Hint already used" : "Get a hint (costs half a point if correct)"}
                >
                  {isSubmitting ? (
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 sm:w-3 sm:h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs sm:text-sm">...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-1">
                      <span>💡</span>
                      <span className="text-xs sm:text-sm">Hint</span>
                    </div>
                  )}
                </Button>
              </motion.div>
            </div>
            
            <div className="grid grid-cols-1 gap-2 sm:gap-4 mb-2 sm:mb-3">
              {options.map((option, index) => (
                <motion.div
                  key={option.id}
                  whileHover={!disabled && !isSubmitting ? { scale: 1.02 } : {}}
                  whileTap={!disabled && !isSubmitting ? { scale: 0.98 } : {}}
                  className="relative"
                >
                  {/* Film Strip Background - Mobile Optimized */}
                  <div className={`relative w-full h-16 sm:h-20 bg-black rounded-md sm:rounded-lg overflow-hidden shadow-lg border-2 ${
                    selectedOption?.id === option.id 
                      ? 'border-amber-400 shadow-amber-400/50' 
                      : 'border-slate-600'
                  }`}>
                    {/* Film strip sprocket holes - top */}
                    <div className="absolute top-0 left-0 right-0 h-2 sm:h-3 bg-black flex justify-between items-center px-1 sm:px-2">
                      {[...Array(12)].map((_, i) => (
                        <div key={i} className="w-0.5 sm:w-1 h-1 sm:h-2 bg-white rounded-sm"></div>
                      ))}
                    </div>
                    
                    {/* Film strip sprocket holes - bottom */}
                    <div className="absolute bottom-0 left-0 right-0 h-2 sm:h-3 bg-black flex justify-between items-center px-1 sm:px-2">
                      {[...Array(12)].map((_, i) => (
                        <div key={i} className="w-0.5 sm:w-1 h-1 sm:h-2 bg-white rounded-sm"></div>
                      ))}
                    </div>

                    {/* Film frame outline */}
                    <div className="absolute inset-2 sm:inset-3 border border-white rounded-sm sm:rounded-md"></div>
                    
                    {/* Grunge texture overlay */}
                    <div className="absolute inset-0 opacity-30">
                      {/* Vertical scratches */}
                      <div className="absolute top-0 bottom-0 left-1/4 w-px bg-white/20"></div>
                      <div className="absolute top-0 bottom-0 left-1/2 w-px bg-white/15"></div>
                      <div className="absolute top-0 bottom-0 left-3/4 w-px bg-white/25"></div>
                      
                      {/* Horizontal scratches */}
                      <div className="absolute top-1/3 left-0 right-0 h-px bg-white/20"></div>
                      <div className="absolute top-2/3 left-0 right-0 h-px bg-white/15"></div>
                      
                      {/* Dust particles */}
                      <div className="absolute top-4 left-8 w-0.5 h-0.5 bg-white/40 rounded-full"></div>
                      <div className="absolute top-8 left-16 w-0.5 h-0.5 bg-white/30 rounded-full"></div>
                      <div className="absolute top-12 left-24 w-0.5 h-0.5 bg-white/50 rounded-full"></div>
                      <div className="absolute top-6 left-32 w-0.5 h-0.5 bg-white/35 rounded-full"></div>
                      <div className="absolute top-10 left-40 w-0.5 h-0.5 bg-white/45 rounded-full"></div>
                    </div>

                    <Button
                      onClick={() => handleOptionSelect(option)}
                      disabled={disabled || isSubmitting || Boolean(lastResult)}
                      className={`film-strip-button absolute inset-2 sm:inset-3 w-auto h-auto p-2 sm:p-3 text-left justify-start space-x-2 sm:space-x-3 bg-transparent hover:bg-white/10 border-0 text-white font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-sm sm:rounded-md ${
                        selectedOption?.id === option.id 
                          ? 'ring-2 ring-amber-400 bg-amber-400/20' 
                          : ''
                      }`}
                    >
                      <div className="flex items-center space-x-2 sm:space-x-3 w-full">
                        {/* Option Letter - film frame style - Mobile Optimized */}
                        <div className={`flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 rounded border-2 flex items-center justify-center text-xs sm:text-sm font-bold ${
                          selectedOption?.id === option.id 
                            ? 'bg-amber-400 border-amber-300 text-black' 
                            : 'bg-white/20 border-white/40 text-white'
                        }`}>
                          {String.fromCharCode(65 + index)}
                        </div>
                        
                        {/* Movie Info - Mobile Optimized */}
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-xs sm:text-sm truncate text-white drop-shadow-lg">
                            {option.title}
                          </div>
                          <div className="text-[10px] sm:text-xs text-white/80 font-medium drop-shadow-md">
                            {option.year}
                          </div>
                        </div>
                      </div>
                    </Button>

                    {/* Slide-over Result Overlay on selected answer */}
                    <AnimatePresence>
                      {selectedOption?.id === option.id && lastResult && (
                        <motion.div
                          key="result-overlay"
                          initial={{ y: -60, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          exit={{ y: -60, opacity: 0 }}
                          transition={{ duration: 0.25, ease: 'easeOut' }}
                          className={`pointer-events-none absolute inset-2 sm:inset-3 z-10 rounded-sm sm:rounded-md flex items-center justify-center border ${
                            lastResult.correct ? 'bg-green-600/90 border-green-400' : 'bg-red-600/90 border-red-400'
                          }`}
                          role="status"
                          aria-live="polite"
                          aria-atomic="true"
                        >
                          <div className="text-center px-2">
                            <div className="text-white font-bold text-xs sm:text-sm">
                              {lastResult.correct ? 'Elementary, me dear watson' : 'Houston we have a problem'}
                            </div>
                            <div className="text-white/90 text-[10px] sm:text-xs mt-0.5">
                              {lastResult.correctAnswer ? `"${lastResult.correctAnswer}"` : `"${selectedOption?.title ?? ''}"`}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Action Buttons - Mobile Optimized */}

            {/* Hint Warning - Mobile Optimized */}
            {hintUsed && (
              <div className="text-center mt-1 sm:mt-2">
                <p className="text-orange-600 text-[10px] sm:text-xs font-medium">
                  ⚠️ Hint used! Correct answer will only give 0.5 points
                </p>
              </div>
            )}

            
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
