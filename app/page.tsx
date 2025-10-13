'use client'

import { motion } from 'framer-motion'
import { Scoreboard } from '@/components/Scoreboard'
import {
  Play,
  Clapperboard,
  Sparkles,
  RotateCcw,
  Film
} from 'lucide-react'
import Image from 'next/image'

const ruleHighlights = [
  {
    title: 'Keep the streak rolling',
    description:
      'Correct guesses without hints push your marquee streak higher and light up the theatre.',
    icon: Clapperboard
  },
  {
    title: 'Hints freeze the bonus',
    description:
      'Use Show Hint to reveal a third co-star and the release year. You can still answer, but your streak holds steady.',
    icon: Sparkles
  },
  {
    title: 'Miss and reset',
    description:
      'Pick the wrong feature and Mr. Robot wipes your streak back to zero. The next round starts like a fresh premiere.',
    icon: RotateCcw
  },
  {
    title: 'Chase your best run',
    description:
      'The scoreboard now tracks both your current streak and your all-time best run so every game feels like opening night.',
    icon: Film
  }
]

export default function Home() {
  return (
    <div className="movie-backdrop min-h-screen text-white">
      <div className="movie-backdrop__texture" aria-hidden="true" />
      <div className="movie-backdrop__inner relative">
        <div className="spotlight-overlay" aria-hidden="true" />

        <div className="relative z-10 mx-auto flex max-w-6xl flex-col gap-16 px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
          <motion.section
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="flex flex-col items-center text-center"
          >
            <div className="mb-8 inline-flex flex-col items-center gap-4">
              <Image
                src="/TheMovieGame Logo.png"
                alt="The Movie Game logo"
                width={220}
                height={106}
                className="h-24 w-auto drop-shadow-[0_10px_25px_rgba(0,0,0,0.45)]"
                priority
              />
              <span className="rounded-full border border-amber-300/40 bg-amber-200/10 px-5 py-2 text-xs font-semibold uppercase tracking-[0.4em] text-amber-200/90">
                Lights, Camera, Streaks
              </span>
            </div>

            <h1 className="text-balance text-4xl font-semibold leading-tight text-amber-50 sm:text-5xl md:text-6xl">
              The Movie Game
            </h1>

            <p className="mt-6 max-w-2xl text-lg text-amber-100/80 sm:text-xl">
              The game is simple: two actors, one movie. Guess the movie to prove your cinema knowledge!
            </p>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <a
                href="/singleplayer"
                className="inline-flex items-center gap-2 rounded-full border border-amber-300/60 bg-amber-200 px-8 py-3 text-lg font-bold uppercase tracking-[0.24em] text-black transition hover:bg-amber-200/90 hover:shadow-[0_18px_50px_rgba(255,200,120,0.35)]"
              >
                <Play className="h-5 w-5" />
                Play Now
              </a>
              <a
                href="#rules"
                className="inline-flex items-center gap-2 rounded-full border border-amber-200/30 px-7 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-amber-100/80 transition hover:border-amber-200/60 hover:bg-white/5"
              >
                Tour the new rules
              </a>
            </div>

            <div className="mt-14 flex flex-col items-center gap-4">
              <span className="text-xs font-semibold uppercase tracking-[0.4em] text-amber-200/70">
                Marquee Scoreboard
              </span>
              <Scoreboard streak={4} bestStreak={11} className="scale-95 sm:scale-100" />
              <p className="max-w-xl text-sm text-amber-100/70 sm:text-base">
                Track your current streak and all-time highlight reel each round.
              </p>
            </div>
          </motion.section>

          <section id="rules" className="relative">
            <div className="absolute inset-0 rounded-3xl bg-white/5 blur-3xl" aria-hidden="true" />
            <div className="relative rounded-3xl border border-white/10 bg-black/30 p-8 sm:p-10 lg:p-12">
              <header className="mb-10 text-center">
                <span className="text-xs font-semibold uppercase tracking-[0.35em] text-amber-200/70">
                  Feature Presentation
                </span>
                <h2 className="mt-3 text-3xl font-bold text-amber-50 sm:text-4xl">Game Rules</h2>
                <p className="mt-4 text-amber-100/80">
                  Every round is a rapid-fire trivia scene. Keep your streak alive, use hints like a
                  director, and keep chasing the red-carpet record.
                </p>
              </header>

              <div className="grid gap-6 sm:grid-cols-2">
                {ruleHighlights.map(rule => {
                  const Icon = rule.icon

                  return (
                    <motion.div
                      key={rule.title}
                      initial={{ opacity: 0, y: 12 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: '-20%' }}
                      transition={{ duration: 0.45, ease: 'easeOut' }}
                      className="flex flex-col gap-4 rounded-2xl border border-amber-200/20 bg-white/5 p-6 text-left shadow-[0_24px_45px_rgba(0,0,0,0.35)]"
                    >
                      <span className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-amber-200/40 bg-black/40 text-amber-200">
                        <Icon className="h-6 w-6" />
                      </span>
                      <div>
                        <h3 className="text-xl font-semibold text-amber-50">{rule.title}</h3>
                        <p className="mt-2 text-sm text-amber-100/80">{rule.description}</p>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
