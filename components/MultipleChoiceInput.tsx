'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Search } from 'lucide-react'
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
}

export function MultipleChoiceInput({ 
  clue, 
  options, 
  onSelect, 
  onHint, 
  disabled = false, 
  hintUsed = false
}: MultipleChoiceInputProps) {
  const [selectedOption, setSelectedOption] = useState<MultipleChoiceOption | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

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
      className="space-y-2 sm:space-y-3"
    >
      {/* Current Clue Display */}
      <Card className="bg-gradient-to-b from-[#fffef8] via-[#fffcf0] to-[#fffef8]">
        <CardContent className="p-4">
          
          <div className="relative text-center space-y-2">
            <h3 className="text-slate-900 text-center text-base sm:text-lg font-bold mb-3">
              🎬 Movie Clue 🎬
            </h3>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-6 text-base sm:text-lg">
              <div className="flex items-center space-x-3">
                <ActorPhoto 
                  src={clue.actor1Photo} 
                  name={clue.actor1} 
                  size="lg"
                />
                <span className="font-bold text-slate-700 text-sm sm:text-base">{clue.actor1}</span>
              </div>
              <span className="text-slate-500 hidden sm:inline">&</span>
              <span className="text-slate-500 sm:hidden">and</span>
              <div className="flex items-center space-x-3">
                <ActorPhoto 
                  src={clue.actor2Photo} 
                  name={clue.actor2} 
                  size="lg"
                />
                <span className="font-bold text-slate-700 text-sm sm:text-base">{clue.actor2}</span>
              </div>
            </div>
            
            {/* Hint Actor Display */}
            {hintUsed && clue.hintActor && (
              <div className="flex items-center justify-center space-x-3 mt-3">
                <span className="text-sm text-slate-500">Hint:</span>
                <div className="flex items-center space-x-2">
                  <ActorPhoto 
                    src={clue.hintActorPhoto} 
                    name={clue.hintActor} 
                    size="md"
                  />
                  <span className="font-bold text-orange-600">{clue.hintActor}</span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>


      {/* Multiple Choice Options */}
      <Card className="bg-gradient-to-b from-[#fffef8] via-[#fffcf0] to-[#fffef8]">
        <CardContent className="p-4">
          
          <div className="relative">
            <h3 className="text-slate-900 text-center flex items-center justify-center space-x-2 text-base sm:text-lg font-bold mb-3">
              <Search className="h-4 w-4" />
              <span>Choose the Movie</span>
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
              {options.map((option, index) => (
                <motion.div
                  key={option.id}
                  whileHover={!disabled && !isSubmitting ? { scale: 1.02 } : {}}
                  whileTap={!disabled && !isSubmitting ? { scale: 0.98 } : {}}
                  className="relative"
                >
                  {/* Film Strip Background */}
                  <div className={`relative w-full h-20 bg-black rounded-lg overflow-hidden shadow-lg border-2 ${
                    selectedOption?.id === option.id 
                      ? 'border-amber-400 shadow-amber-400/50' 
                      : 'border-slate-600'
                  }`}>
                    {/* Film strip sprocket holes - top */}
                    <div className="absolute top-0 left-0 right-0 h-3 bg-black flex justify-between items-center px-2">
                      {[...Array(18)].map((_, i) => (
                        <div key={i} className="w-1 h-2 bg-white rounded-sm"></div>
                      ))}
                    </div>
                    
                    {/* Film strip sprocket holes - bottom */}
                    <div className="absolute bottom-0 left-0 right-0 h-3 bg-black flex justify-between items-center px-2">
                      {[...Array(18)].map((_, i) => (
                        <div key={i} className="w-1 h-2 bg-white rounded-sm"></div>
                      ))}
                    </div>

                    {/* Film frame outline */}
                    <div className="absolute inset-3 border border-white rounded-md"></div>
                    
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
                      disabled={disabled || isSubmitting}
                      className={`absolute inset-3 w-auto h-auto p-3 text-left justify-start space-x-3 bg-transparent hover:bg-white/10 border-0 text-white font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-md ${
                        selectedOption?.id === option.id 
                          ? 'ring-2 ring-amber-400 bg-amber-400/20' 
                          : ''
                      }`}
                    >
                      <div className="flex items-center space-x-3 w-full">
                        {/* Option Letter - film frame style */}
                        <div className={`flex-shrink-0 w-8 h-8 rounded border-2 flex items-center justify-center text-sm font-bold ${
                          selectedOption?.id === option.id 
                            ? 'bg-amber-400 border-amber-300 text-black' 
                            : 'bg-white/20 border-white/40 text-white'
                        }`}>
                          {String.fromCharCode(65 + index)}
                        </div>
                        
                        {/* Movie Info */}
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-sm truncate text-white drop-shadow-lg">
                            {option.title}
                          </div>
                          <div className="text-xs text-white/80 font-medium drop-shadow-md">
                            {option.year}
                          </div>
                        </div>
                      </div>
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center">
              <motion.div
                whileHover={!disabled && !isSubmitting && !hintUsed ? { scale: 1.02 } : {}}
                whileTap={!disabled && !isSubmitting && !hintUsed ? { scale: 0.98 } : {}}
              >
                <Button
                  onClick={handleHint}
                  disabled={disabled || isSubmitting || !onHint || hintUsed}
                  className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 disabled:from-gray-500 disabled:to-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  title={hintUsed ? "Hint already used" : "Get a hint (costs half a point if correct)"}
                >
                  {isSubmitting ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span className="text-sm">Submitting...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-1">
                      <span>💡</span>
                      <span className="hidden sm:inline text-sm">Hint</span>
                    </div>
                  )}
                </Button>
              </motion.div>
            </div>

            {/* Hint Warning */}
            {hintUsed && (
              <div className="text-center mt-2">
                <p className="text-orange-600 text-xs font-medium">
                  ⚠️ Hint used! Correct answer will only give 0.5 points
                </p>
              </div>
            )}

            {/* Instructions */}
            <div className="text-center mt-2">
              <p className="text-xs text-slate-500">
                Select the movie you think these actors are from
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
