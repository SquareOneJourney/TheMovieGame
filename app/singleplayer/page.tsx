'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Sparkles } from 'lucide-react'
import { movieService, type GameMovie } from '@/lib/movieService'
import { MultipleChoiceInput } from '@/components/MultipleChoiceInput'
import {
  generateMultipleChoiceOptions,
  type MultipleChoiceOption
} from '@/lib/multipleChoiceGenerator'

interface LastResult {
  correct: boolean
  guess: string
  correctAnswer: string
  hintUsed: boolean
}

interface GameState {
  currentMovie: GameMovie | null
  options: MultipleChoiceOption[]
  streak: number
  bestStreak: number
  totalCorrect: number
  totalRounds: number
  hintUsed: boolean
  lastResult: LastResult | null
  status: 'loading' | 'ready'
}

export default function SinglePlayerPage() {
  const [movies, setMovies] = useState<GameMovie[]>([])
  const [gameState, setGameState] = useState<GameState>({
    currentMovie: null,
    options: [],
    streak: 0,
    bestStreak: 0,
    totalCorrect: 0,
    totalRounds: 0,
    hintUsed: false,
    lastResult: null,
    status: 'loading'
  })

  const nextRoundTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const usedIndicesRef = useRef<Set<number>>(new Set())

  const pickNextMovie = useCallback(() => {
    if (movies.length === 0) return null

    if (usedIndicesRef.current.size === movies.length) {
      usedIndicesRef.current.clear()
    }

    const available = movies
      .map((movie, index) => ({ movie, index }))
      .filter(entry => !usedIndicesRef.current.has(entry.index))

    if (available.length === 0) {
      return null
    }

    const choice = available[Math.floor(Math.random() * available.length)]
    usedIndicesRef.current.add(choice.index)
    return choice.movie
  }, [movies])

  const startRound = useCallback(() => {
    const nextMovie = pickNextMovie()
    if (!nextMovie) {
      return
    }

    const options = generateMultipleChoiceOptions(nextMovie, movies)

    setGameState(prev => ({
      ...prev,
      currentMovie: nextMovie,
      options,
      hintUsed: false,
      lastResult: null,
      status: 'ready'
    }))
  }, [movies, pickNextMovie])

  useEffect(() => {
    let cancelled = false

    const loadMovies = async () => {
      try {
        const loaded = await movieService.getAllMovies()
        if (cancelled) return

        setMovies(loaded)
        usedIndicesRef.current.clear()
        setGameState(prev => ({
          ...prev,
          status: 'ready'
        }))
      } catch (error) {
        console.error('Failed to load movies', error)
      }
    }

    loadMovies()

    return () => {
      cancelled = true
      if (nextRoundTimeout.current) {
        clearTimeout(nextRoundTimeout.current)
      }
    }
  }, [])

  useEffect(() => {
    if (movies.length > 0 && !gameState.currentMovie) {
      startRound()
    }
  }, [movies, gameState.currentMovie, startRound])

  const scheduleNextRound = useCallback(() => {
    if (nextRoundTimeout.current) {
      clearTimeout(nextRoundTimeout.current)
    }
    nextRoundTimeout.current = setTimeout(() => {
      startRound()
    }, 1500)
  }, [startRound])

  const handleGuess = useCallback(
    (option: MultipleChoiceOption) => {
      setGameState(prev => {
        if (!prev.currentMovie || prev.lastResult) {
          return prev
        }

        const correct = option.isCorrect
        const totalRounds = prev.totalRounds + 1
        const totalCorrect = correct ? prev.totalCorrect + 1 : prev.totalCorrect
        const streak = correct
          ? prev.hintUsed
            ? prev.streak
            : prev.streak + 1
          : 0
        const bestStreak = Math.max(prev.bestStreak, streak)

        return {
          ...prev,
          streak,
          bestStreak,
          totalCorrect,
          totalRounds,
          lastResult: {
            correct,
            guess: option.title,
            correctAnswer: prev.currentMovie.movie,
            hintUsed: prev.hintUsed
          }
        }
      })

      scheduleNextRound()
    },
    [scheduleNextRound]
  )

  const handleHint = useCallback(() => {
    setGameState(prev => {
      if (prev.hintUsed || prev.lastResult) return prev
      return {
        ...prev,
        hintUsed: true
      }
    })
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-black to-zinc-950 text-amber-50">
      {/* Top Navigation Bar */}
      <nav className="w-full px-4 sm:px-6 lg:px-8 py-4 border-b border-amber-200/10">
        <div className="max-w-md sm:max-w-2xl lg:max-w-4xl xl:max-w-5xl mx-auto flex items-center justify-between">
          {/* Left: Current Streak */}
          <div className="flex flex-col items-start">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-200/70">
              Current Streak
            </span>
            <span className="text-2xl font-bold text-amber-100">
              {gameState.streak}
            </span>
          </div>

          {/* Center: Title/Home Button */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-amber-200/50 bg-amber-200/15 px-4 py-2 text-sm font-bold uppercase tracking-[0.4em] text-amber-100 transition hover:bg-amber-200/25"
          >
            THE MOVIE GAME
          </Link>

          {/* Right: Best Run */}
          <div className="flex flex-col items-end">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-200/70">
              Best Run
            </span>
            <span className="text-2xl font-bold text-amber-100">
              {gameState.bestStreak}
            </span>
          </div>
        </div>
      </nav>

      <main className="w-full mx-auto px-4 sm:px-6 lg:px-8 overflow-visible pt-8 pb-24 max-w-md sm:max-w-2xl lg:max-w-4xl xl:max-w-5xl">

        <section className="mt-8 space-y-6 pb-10">
          {gameState.status === 'loading' || !gameState.currentMovie ? (
            <div className="flex flex-col items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-10 text-sm text-amber-100/80">
              <Sparkles className="h-10 w-10 animate-pulse text-amber-300" />
              Loading the next trivia card...
            </div>
          ) : (
            <MultipleChoiceInput
              clue={{
                actor1: gameState.currentMovie.actor1,
                actor2: gameState.currentMovie.actor2,
                actor1Photo: gameState.currentMovie.actor1Photo,
                actor2Photo: gameState.currentMovie.actor2Photo,
                year: gameState.hintUsed ? gameState.currentMovie.year : undefined,
                hintActor: gameState.hintUsed
                  ? gameState.currentMovie.actor3 ?? gameState.currentMovie.hintActor
                  : undefined,
                hintActorPhoto: gameState.hintUsed
                  ? gameState.currentMovie.actor3Photo ?? gameState.currentMovie.hintActorPhoto
                  : undefined
              }}
              options={gameState.options}
              onSelect={handleGuess}
              onHint={handleHint}
              disabled={Boolean(gameState.lastResult)}
              hintUsed={gameState.hintUsed}
              lastResult={gameState.lastResult}
            />
          )}
        </section>
      </main>
    </div>
  )
}
