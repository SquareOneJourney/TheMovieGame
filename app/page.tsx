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
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-black to-zinc-950 text-amber-50">
      <main className="w-full mx-auto px-4 sm:px-6 lg:px-8 overflow-visible pt-12 pb-20 max-w-md sm:max-w-2xl lg:max-w-4xl xl:max-w-5xl">
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="flex flex-col items-center gap-8 text-center"
        >
          <div className="flex flex-col items-center gap-4">
            <Image
              src="/TheMovieGame Logo.png"
              alt="The Movie Game logo"
              width={220}
              height={106}
              className="h-24 w-auto drop-shadow-lg"
              priority
            />
            <span className="rounded-full border border-amber-300/50 bg-amber-200/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.4em] text-amber-200/90">
              Lights, Camera, Streaks
            </span>
          </div>

          <h1 className="text-balance text-4xl font-semibold leading-tight sm:text-5xl">
            The Movie Game
          </h1>

          <p className="text-base text-amber-100/80 sm:text-lg">
            Two actors, one feature. Make the right call and prove your cinema instincts.
          </p>

          <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-center">
            <a
              href="/singleplayer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-amber-300/60 bg-amber-200 px-6 py-3 text-base font-bold uppercase tracking-[0.24em] text-black transition hover:bg-amber-200/90 hover:shadow-lg hover:shadow-amber-200/30 sm:w-auto"
            >
              <Play className="h-5 w-5" />
              Play Now
            </a>
            <a
              href="#rules"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-amber-200/30 px-6 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-amber-100/80 transition hover:border-amber-200/60 hover:bg-white/5 sm:w-auto"
            >
              Tour the new rules
            </a>
          </div>

          <div className="flex flex-col items-center gap-3">
            <span className="text-xs font-semibold uppercase tracking-[0.4em] text-amber-200/70">
              Marquee Scoreboard
            </span>
            <Scoreboard streak={4} bestStreak={11} className="mt-2 scale-95 sm:scale-100" />
            <p className="text-sm text-amber-100/70 sm:text-base">
              Track your current streak and all-time highlight reel every round.
            </p>
          </div>
        </motion.section>

        <section id="rules" className="mt-12 space-y-8">
          <header className="space-y-4 text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.35em] text-amber-200/70">
              Feature Presentation
            </span>
            <h2 className="text-3xl font-bold text-amber-50">Game Rules</h2>
            <p className="text-amber-100/80">
              Every round is a quick-fire challenge. Protect your streak, call for hints when you need
              them, and chase your personal best.
            </p>
          </header>

          <div className="grid gap-6">
            {ruleHighlights.map(rule => {
              const Icon = rule.icon

              return (
                <motion.div
                  key={rule.title}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-20%' }}
                  transition={{ duration: 0.45, ease: 'easeOut' }}
                  className="flex items-start gap-4 rounded-2xl border border-amber-200/15 bg-white/5 p-5 text-left shadow-lg shadow-black/30"
                >
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-amber-200/40 bg-black/40 text-amber-200">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-amber-50">{rule.title}</h3>
                    <p className="text-sm text-amber-100/80">{rule.description}</p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </section>
      </main>
    </div>
  )
}
