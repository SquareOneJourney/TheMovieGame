'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Film, Users, Send } from 'lucide-react'

interface ClueInputProps {
  onGiveClue: (actor1: string, actor2: string) => void
  disabled?: boolean
}

export function ClueInput({ onGiveClue, disabled = false }: ClueInputProps) {
  const [actor1, setActor1] = useState('')
  const [actor2, setActor2] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!actor1.trim() || !actor2.trim() || disabled || isSubmitting) {
      return
    }

    setIsSubmitting(true)
    
    try {
      await onGiveClue(actor1.trim(), actor2.trim())
      setActor1('')
      setActor2('')
    } catch (error) {
      console.error('Error giving clue:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const isFormValid = actor1.trim() && actor2.trim() && !disabled && !isSubmitting

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="bg-white/10 backdrop-blur-sm border-white/20">
        <CardHeader>
          <CardTitle className="text-white text-center flex items-center justify-center space-x-2">
            <Film className="h-6 w-6" />
            <span>🎬 Your Turn - Give a Clue!</span>
          </CardTitle>
          <p className="text-center text-gray-300 text-sm mt-2">
            Think of a movie and provide two actors from it
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-4">
              {/* Actor 1 Input */}
              <div>
                <label htmlFor="actor1" className="block text-sm font-medium text-gray-300 mb-2">
                  First Actor
                </label>
                <Input
                  id="actor1"
                  type="text"
                  placeholder="Enter first actor's name"
                  value={actor1}
                  onChange={(e) => setActor1(e.target.value)}
                  disabled={disabled || isSubmitting}
                  className="bg-white/20 border-white/30 text-white placeholder:text-gray-400 focus:ring-blue-400"
                  autoComplete="off"
                />
              </div>

              {/* Actor 2 Input */}
              <div>
                <label htmlFor="actor2" className="block text-sm font-medium text-gray-300 mb-2">
                  Second Actor
                </label>
                <Input
                  id="actor2"
                  type="text"
                  placeholder="Enter second actor's name"
                  value={actor2}
                  onChange={(e) => setActor2(e.target.value)}
                  disabled={disabled || isSubmitting}
                  className="bg-white/20 border-white/30 text-white placeholder:text-gray-400 focus:ring-blue-400"
                  autoComplete="off"
                />
              </div>
            </div>

            {/* Submit Button */}
            <motion.div
              whileHover={isFormValid ? { scale: 1.02 } : {}}
              whileTap={isFormValid ? { scale: 0.98 } : {}}
            >
              <Button
                type="submit"
                disabled={!isFormValid}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-3 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Giving Clue...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Send className="h-4 w-4" />
                    <span>Give Clue</span>
                  </div>
                )}
              </Button>
            </motion.div>

            {/* Instructions */}
            <div className="text-center">
              <p className="text-sm text-gray-400">
                Think of a movie and name two actors from it
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  )
}
