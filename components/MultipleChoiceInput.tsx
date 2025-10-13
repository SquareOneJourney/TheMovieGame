'use client'

import { useEffect, useState, KeyboardEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { ActorPhoto } from '@/components/ActorPhoto'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

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

  const handleKeyboardSelect = (event: KeyboardEvent<HTMLButtonElement>, option: MultipleChoiceOption) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleOptionSelect(option)
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

  const hintCopy = hintUsed
    ? 'Hint shown - streak earns half credit'
    : 'Reveal an extra co-star and release year (streak bonus paused this round)'

  const resultCopy = (() => {
    if (!lastResult) return null

    if (lastResult.correct) {
      return {
        headline: 'Critics Cheer!',
        detail: `"${lastResult.correctAnswer ?? selectedOption?.title ?? ''}" keeps the streak alive.`
      }
    }

    return {
      headline: 'Audience Gasps!',
      detail: `Tonight's feature was "${lastResult.correctAnswer ?? ''}".`
    }
  })()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="pb-6 sm:pb-8"
    >
      {/* Current Clue Display - Mobile Optimized */}
      <Card className="bg-gradient-to-b from-[#fffef8] via-[#fffcf0] to-[#fffef8]">
        <CardContent className="p-6 sm:p-6">
          
          <div className="relative text-center space-y-1 sm:space-y-2">
            <h3 className="text-slate-900 text-center flex items-center justify-center space-x-1 sm:space-x-2 text-sm sm:text-base md:text-lg font-bold mb-2 sm:mb-3">
              <Image src="/TheMovieGame Logo.png" alt="The Movie Game Logo" width={20} height={20} className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>Movie Clue</span>
              <Image src="/TheMovieGame Logo.png" alt="The Movie Game Logo" width={20} height={20} className="h-4 w-4 sm:h-5 sm:w-5" />
            </h3>
            {/* Mobile Layout - Horizontal layout to use space better */}
            <div className="sm:hidden flex items-center justify-center space-x-2 w-full px-4">
              <div className="flex items-center space-x-2">
                <div className="flex-shrink-0">
                  <ActorPhoto 
                    src={clue.actor1Photo} 
                    name={clue.actor1} 
                    size="md"
                  />
                </div>
                <span className="font-bold text-slate-700 text-sm">{clue.actor1}</span>
              </div>
              
              <span className="text-slate-500 text-sm font-medium">&</span>
              
              <div className="flex items-center space-x-2">
                <span className="font-bold text-slate-700 text-sm">{clue.actor2}</span>
                <div className="flex-shrink-0">
                  <ActorPhoto 
                    src={clue.actor2Photo} 
                    name={clue.actor2} 
                    size="md"
                  />
                </div>
              </div>
            </div>
            
            {/* Desktop Layout - Completely separate horizontal layout */}
            <div className="hidden sm:flex items-center justify-center space-x-4 md:space-x-6 text-sm sm:text-base md:text-lg px-4">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="flex-shrink-0">
                  <ActorPhoto 
                    src={clue.actor1Photo} 
                    name={clue.actor1} 
                    size="md"
                  />
                </div>
                <span className="font-bold text-slate-700 text-xs sm:text-sm md:text-base">{clue.actor1}</span>
              </div>
              <span className="text-slate-500">&</span>
              <div className="flex items-center space-x-2 sm:space-x-3">
                <span className="font-bold text-slate-700 text-xs sm:text-sm md:text-base">{clue.actor2}</span>
                <div className="flex-shrink-0">
                  <ActorPhoto 
                    src={clue.actor2Photo} 
                    name={clue.actor2} 
                    size="md"
                  />
                </div>
              </div>
            </div>
            
            {/* Hint Actor Display - Mobile Optimized */}
            {hintUsed && clue.hintActor && (
              <div className="flex items-center justify-center space-x-2 sm:space-x-3 mt-2 sm:mt-3">
                <span className="text-xs sm:text-sm text-slate-500">Hint:</span>
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <div className="flex-shrink-0">
                    <ActorPhoto 
                      src={clue.hintActorPhoto} 
                      name={clue.hintActor} 
                      size="sm"
                    />
                  </div>
                  <span className="font-bold text-orange-600 text-xs sm:text-sm">{clue.hintActor}</span>
                </div>
              </div>
            )}
          </div>

          {/* Movie Options - Film Strip Style */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 mt-4 sm:mt-6">
            {options.map((option, index) => (
              <motion.div
                key={option.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                <div className="relative bg-gradient-to-br from-slate-800 via-slate-900 to-black rounded-sm sm:rounded-md overflow-hidden border border-slate-700/50 shadow-lg">
                  {/* Film strip perforations */}
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-white/20"></div>
                  <div className="absolute right-0 top-0 bottom-0 w-1 bg-white/20"></div>
                  
                  {/* Grunge texture overlay */}
                  <div className="absolute inset-0 opacity-30">
                    {/* Vertical scratches */}
                    <div className="absolute top-0 bottom-0 left-1/4 w-px bg-white/20"></div>
                    <div className="absolute top-0 bottom-0 left-1/2 w-px bg-white/15"></div>
                    <div className="absolute top-0 bottom-0 left-3/4 w-px bg-white/25"></div>
                    
                    {/* Horizontal scratches */}
                    <div className="absolute top-1/3 left-0 right-0 h-px bg-white/20"></div>
                    <div className="absolute top-2/3 left-0 right-0 h-px bg-white/15"></div>
                    
                  </div>

                  <Button
                    onClick={() => handleOptionSelect(option)}
                    disabled={disabled || isSubmitting || Boolean(lastResult)}
                    className={`film-strip-button absolute inset-2 sm:inset-3 w-full h-auto p-2 sm:p-3 text-left justify-start space-x-2 sm:space-x-3 bg-transparent border-0 text-white font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
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
                      <div className="flex-1 min-w-0 overflow-hidden">
                        <div className="font-bold text-xs sm:text-sm truncate text-white drop-shadow-lg">
                          {option.title}
                        </div>
                        <div className="text-[10px] sm:text-xs text-white/80 font-medium drop-shadow-md truncate">
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

        </CardContent>
      </Card>
    </motion.div>
  )
}
