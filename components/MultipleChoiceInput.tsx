'use client'

import { useEffect, useState, KeyboardEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
      <section className="theater-ticket" aria-live="polite">
        <div className="theater-ticket__perforation theater-ticket__perforation--top" aria-hidden="true" />
        <div className="theater-ticket__perforation theater-ticket__perforation--bottom" aria-hidden="true" />

        <header className="theater-ticket__header">
          <div className="theater-ticket__badge">NOW SHOWING</div>
          <h3 className="theater-ticket__title">Guess the Movie</h3>
        </header>

        <div className="theater-ticket__cast">
          <div className="theater-ticket__cast-member">
            <ActorPhoto src={clue.actor1Photo} name={clue.actor1} />
            <span>{clue.actor1}</span>
          </div>

          <div className="theater-ticket__ampersand" aria-hidden="true">
            <span>&</span>
            <span>STARS</span>
          </div>

          <div className="theater-ticket__cast-member theater-ticket__cast-member--mirror">
            <span>{clue.actor2}</span>
            <ActorPhoto src={clue.actor2Photo} name={clue.actor2} />
          </div>
        </div>

        <div className="theater-ticket__divider" role="separator" aria-hidden="true">
          <span>Pick Tonight&apos;s Feature</span>
        </div>

        <div className="theater-ticket__choices">
          {options.map((option, index) => {
            const isSelected = selectedOption?.id === option.id
            const revealState = lastResult
              ? option.isCorrect
                ? 'correct'
                : isSelected
                  ? 'incorrect'
                  : 'idle'
              : 'idle'

            const optionClasses = [
              'theater-ticket__choice',
              revealState !== 'idle' ? `theater-ticket__choice--${revealState}` : '',
              isSelected && !lastResult ? 'theater-ticket__choice--active' : ''
            ]

            return (
              <motion.div key={option.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                <button
                  type="button"
                  className={optionClasses.join(' ')}
                  onClick={() => handleOptionSelect(option)}
                  onKeyDown={event => handleKeyboardSelect(event, option)}
                  disabled={disabled || isSubmitting || Boolean(lastResult)}
                  data-choice-state={revealState}
                  aria-pressed={isSelected}
                >
                  <span className="theater-ticket__choice-letter" aria-hidden="true">
                    {String.fromCharCode(65 + index)}
                  </span>

                  <span className="theater-ticket__choice-details">
                    <span className="theater-ticket__choice-title">{option.title}</span>
                    <span className="theater-ticket__choice-meta">
                      <span>{option.year}</span>
                    </span>
                  </span>

                  <AnimatePresence>
                    {resultCopy && lastResult && selectedOption?.id === option.id && (
                      <motion.div
                        key={`${resultCopy.headline}-${option.id}`}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.25, ease: 'easeOut' }}
                        className={`theater-ticket__choice-status ${
                          lastResult.correct ? 'theater-ticket__choice-status--success' : 'theater-ticket__choice-status--error'
                        }`}
                        role="status"
                        aria-live="polite"
                      >
                        <span className="theater-ticket__choice-status-headline">{resultCopy.headline}</span>
                        <span className="theater-ticket__choice-status-detail">{resultCopy.detail}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </button>
              </motion.div>
            )
          })}
        </div>

        <footer className="theater-ticket__footer">
          <div className="theater-ticket__hint">
            <button
              type="button"
              onClick={handleHint}
              disabled={hintUsed || !onHint || disabled || Boolean(lastResult) || isSubmitting}
              className="theater-ticket__hint-button"
            >
              Show Hint
            </button>
            <p className="theater-ticket__hint-copy">{hintCopy}</p>
          </div>

          {hintUsed && (
            <div className="theater-ticket__bonus-cast" role="note">
              <p className="theater-ticket__bonus-label">Spotlight Assist</p>
              {clue.hintActor ? (
                <div className="theater-ticket__bonus-cast-details">
                  <ActorPhoto src={clue.hintActorPhoto} name={clue.hintActor} size="sm" />
                  <span>{clue.hintActor}</span>
                  {clue.year && <span className="theater-ticket__bonus-year">{clue.year}</span>}
                </div>
              ) : (
                <p className="theater-ticket__bonus-fallback">Bonus clue activated</p>
              )}
            </div>
          )}
        </footer>
      </section>
    </motion.div>
  )
}
