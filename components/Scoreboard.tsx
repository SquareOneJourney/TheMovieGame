'use client'

import React, { useEffect, useMemo } from "react"
import clsx from "clsx"
import { motion, useAnimationControls, useReducedMotion } from "framer-motion"
import type { Variants } from "framer-motion"
import { Bebas_Neue, Oswald } from "next/font/google"
import { CheckCircle, XCircle } from "lucide-react"

interface Player {
  id: string
  name: string
  score: number
}

interface ResultFlash {
  correct: boolean
  guess: string
  correctAnswer?: string
  similarity?: number
  confidence?: 'exact' | 'high' | 'medium' | 'low' | 'none'
}

interface ScoreboardProps {
  players: Player[]
  highlightedPlayerId?: string
  resultFlash?: ResultFlash | null
}

const bebasNeue = Bebas_Neue({ subsets: ["latin"], weight: "400" })
const oswald = Oswald({ subsets: ["latin"], weight: ["400", "600"] })

const BULBS_HORIZONTAL = 16 // Top and bottom edges
const BULBS_VERTICAL = 5 // Left and right edges

interface BulbPosition {
  id: string
  index: number
  style: React.CSSProperties
}

function generateBulbPositions(): BulbPosition[] {
  const bulbs: BulbPosition[] = []
  let runningIndex = 0
  
  const horizontalSpacing = 100 / BULBS_HORIZONTAL
  const verticalSpacing = 100 / BULBS_VERTICAL

  // Top edge - evenly spaced across the width
  for (let i = 0; i < BULBS_HORIZONTAL; i++) {
    const offset = (i + 0.5) * horizontalSpacing
    bulbs.push({
      id: `top-${i}`,
      index: runningIndex++,
      style: {
        top: "0",
        left: `${offset}%`,
        transform: "translate(-50%, -50%)",
      },
    })
  }

  // Right edge - evenly spaced down the height
  for (let i = 0; i < BULBS_VERTICAL; i++) {
    const offset = (i + 0.5) * verticalSpacing
    bulbs.push({
      id: `right-${i}`,
      index: runningIndex++,
      style: {
        top: `${offset}%`,
        right: "0",
        transform: "translate(50%, -50%)",
      },
    })
  }

  // Bottom edge - evenly spaced across the width (right to left)
  for (let i = BULBS_HORIZONTAL - 1; i >= 0; i--) {
    const offset = (i + 0.5) * horizontalSpacing
    bulbs.push({
      id: `bottom-${i}`,
      index: runningIndex++,
      style: {
        bottom: "0",
        left: `${offset}%`,
        transform: "translate(-50%, 50%)",
      },
    })
  }

  // Left edge - evenly spaced down the height (bottom to top)
  for (let i = BULBS_VERTICAL - 1; i >= 0; i--) {
    const offset = (i + 0.5) * verticalSpacing
    bulbs.push({
      id: `left-${i}`,
      index: runningIndex++,
      style: {
        top: `${offset}%`,
        left: "0",
        transform: "translate(-50%, -50%)",
      },
    })
  }

  return bulbs
}

const bulbVariants: Variants = {
  static: {
    opacity: 1,
    scale: 1,
  },
}

const playerRowVariants: Variants = {
  idle: {
    backgroundColor: "rgba(255,255,255,0)",
    scale: 1,
  },
  highlight: {
    backgroundColor: "rgba(255,200,80,0.08)",
    scale: 1.02,
    transition: { duration: 0.4, ease: "easeOut" },
  },
}

export function Scoreboard({ players, highlightedPlayerId, resultFlash }: ScoreboardProps) {
  const prefersReducedMotion = useReducedMotion()
  const bulbs = useMemo(() => generateBulbPositions(), [])
  const bulbControls = useAnimationControls()

  useEffect(() => {
    void bulbControls.start("static")
  }, [bulbControls])

  if (!players || players.length !== 2) {
    return null
  }

  return (
    <section className="flex w-full items-center justify-center px-4 py-2">
      {/* Result Flash Overlay */}
      {resultFlash && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: -50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: -50 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="absolute inset-0 z-50 flex items-center justify-center"
        >
          <div className={`relative w-full max-w-2xl mx-4 rounded-2xl p-8 shadow-2xl ${
            resultFlash.correct 
              ? 'bg-gradient-to-br from-green-500/90 to-green-600/90 border-2 border-green-400' 
              : 'bg-gradient-to-br from-red-500/90 to-red-600/90 border-2 border-red-400'
          }`}>
            {/* Animated background pattern */}
            <div className="absolute inset-0 rounded-2xl overflow-hidden">
              <div className={`absolute inset-0 opacity-20 ${
                resultFlash.correct ? 'bg-green-300' : 'bg-red-300'
              }`} style={{
                backgroundImage: `radial-gradient(circle at 20% 50%, transparent 20%, rgba(255,255,255,0.1) 21%, rgba(255,255,255,0.1) 34%, transparent 35%), radial-gradient(circle at 80% 20%, transparent 20%, rgba(255,255,255,0.1) 21%, rgba(255,255,255,0.1) 34%, transparent 35%), radial-gradient(circle at 40% 80%, transparent 20%, rgba(255,255,255,0.1) 21%, rgba(255,255,255,0.1) 34%, transparent 35%)`,
                backgroundSize: '60px 60px'
              }} />
            </div>
            
            <div className="relative flex flex-col items-center justify-center space-y-4 text-center">
              {/* Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, duration: 0.3, ease: "easeOut" }}
                className={`p-4 rounded-full ${
                  resultFlash.correct ? 'bg-green-400/20' : 'bg-red-400/20'
                }`}
              >
                {resultFlash.correct ? (
                  <CheckCircle className="h-12 w-12 text-green-100" />
                ) : (
                  <XCircle className="h-12 w-12 text-red-100" />
                )}
              </motion.div>
              
              {/* Main message */}
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.3 }}
                className={`text-3xl sm:text-4xl font-bold ${
                  resultFlash.correct ? 'text-green-100' : 'text-red-100'
                }`}
              >
                {resultFlash.correct 
                  ? 'Elementary, my dear Watson!' 
                  : 'Houston, we have a problem!'
                }
              </motion.h2>
              
              {/* Details */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.3 }}
                className="space-y-2"
              >
                <p className="text-lg text-white/90">
                  You selected: <span className="font-semibold">&quot;{resultFlash.guess}&quot;</span>
                </p>
                {resultFlash.correctAnswer && (
                  <p className="text-lg text-white/90">
                    The answer: <span className="font-semibold">&quot;{resultFlash.correctAnswer}&quot;</span>
                  </p>
                )}
              </motion.div>
            </div>
          </div>
        </motion.div>
      )}
      
      <div className="relative w-full max-w-5xl" aria-live="polite">

        {/* Top header section with "THE MOVIE GAME" */}
        <div className="relative mb-2">
          {/* Art Deco Sunburst accent */}
          <div className="absolute -top-8 left-1/2 flex -translate-x-1/2 items-end justify-center gap-1" aria-hidden>
            <motion.div
              className="h-8 w-1 rounded-full bg-gradient-to-t from-cyan-400 to-cyan-300"
              animate={{
                height: prefersReducedMotion ? "2rem" : ["2rem", "2.5rem", "2rem"],
                opacity: prefersReducedMotion ? 0.8 : [0.7, 1, 0.7],
              }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="h-10 w-1 rounded-full bg-gradient-to-t from-orange-400 to-orange-300"
              animate={{
                height: prefersReducedMotion ? "2.5rem" : ["2.5rem", "3rem", "2.5rem"],
                opacity: prefersReducedMotion ? 0.85 : [0.75, 1, 0.75],
              }}
              transition={{ duration: 2.3, repeat: Infinity, ease: "easeInOut", delay: 0.1 }}
            />
            <motion.div
              className="h-12 w-1.5 rounded-full bg-gradient-to-t from-cyan-400 to-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.6)]"
              animate={{
                height: prefersReducedMotion ? "3rem" : ["3rem", "3.75rem", "3rem"],
                opacity: prefersReducedMotion ? 0.9 : [0.8, 1, 0.8],
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
            />
            <motion.div
              className="h-10 w-1 rounded-full bg-gradient-to-t from-orange-400 to-orange-300"
              animate={{
                height: prefersReducedMotion ? "2.5rem" : ["2.5rem", "3rem", "2.5rem"],
                opacity: prefersReducedMotion ? 0.85 : [0.75, 1, 0.75],
              }}
              transition={{ duration: 2.3, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
            />
            <motion.div
              className="h-8 w-1 rounded-full bg-gradient-to-t from-cyan-400 to-cyan-300"
              animate={{
                height: prefersReducedMotion ? "2rem" : ["2rem", "2.5rem", "2rem"],
                opacity: prefersReducedMotion ? 0.8 : [0.7, 1, 0.7],
              }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
            />
          </div>

          {/* "THE MOVIE GAME" header with cyan neon border */}
          <div className="relative rounded-2xl bg-gradient-to-br from-[#6b2d1a] via-[#4a1d10] to-[#5a2515] p-1 shadow-[0_15px_40px_rgba(0,0,0,0.7),0_0_0_2px_rgba(34,211,238,0.4),inset_0_1px_3px_rgba(34,211,238,0.2)]">
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-b from-[#5a2515] via-[#3d1810] to-[#4a1d10] px-6 py-4 shadow-[inset_0_2px_6px_rgba(0,0,0,0.8)]">
              <motion.h1
                className={clsx(
                  bebasNeue.className,
                  "text-center text-4xl tracking-[0.15em] text-transparent bg-clip-text bg-gradient-to-b from-amber-300 via-orange-300 to-amber-400 drop-shadow-[0_2px_8px_rgba(255,165,0,0.8)] sm:text-5xl md:text-6xl"
                )}
                animate={{
                  textShadow: prefersReducedMotion
                    ? "0 2px 8px rgba(255,165,0,0.8)"
                    : [
                        "0 2px 8px rgba(255,165,0,0.7)",
                        "0 2px 12px rgba(255,165,0,0.95)",
                        "0 2px 8px rgba(255,165,0,0.7)",
                      ],
                }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                THE MOVIE GAME
              </motion.h1>
                      </div>
                      </div>
                    </div>

        {/* Main marquee scoreboard with cyan accent border */}
        <div className="relative rounded-2xl bg-gradient-to-br from-[#6b2d1a] via-[#4a1d10] to-[#5a2515] p-1.5 shadow-[0_25px_50px_rgba(0,0,0,0.75),0_0_0_2px_rgba(34,211,238,0.35),inset_0_1px_3px_rgba(34,211,238,0.15)]">
          <div className="relative rounded-xl bg-gradient-to-br from-[#5a2515] via-[#3d1810] to-[#4a1d10] p-2 shadow-[inset_0_2px_6px_rgba(0,0,0,0.85)]">
            <div className="relative rounded-lg bg-gradient-to-br from-[#5a2010] via-[#3a1508] to-[#4a1b0d] p-4 shadow-[inset_0_3px_10px_rgba(0,0,0,0.9)] sm:p-5">
              
              {/* Lightbulbs - theater marquee style */}
              {bulbs.map(bulb => (
                <motion.div
                  key={bulb.id}
                  className="pointer-events-none absolute"
                  style={bulb.style}
                  variants={bulbVariants}
                  animate={bulbControls}
                  initial="static"
                  custom={bulb.index}
                  aria-hidden
                >
                  {/* Outer glow */}
                  <div className="absolute inset-0 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-400/40 blur-md" />
                  {/* Main bulb */}
                  <div className="absolute h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-orange-200 via-orange-300 to-orange-400 shadow-[0_0_10px_rgba(255,165,0,0.8),0_0_20px_rgba(255,140,0,0.4),inset_0_1px_2px_rgba(255,255,255,0.5)]" />
                  {/* Highlight reflection */}
                  <div className="absolute left-0 top-0 h-2 w-2 -translate-x-1/2 -translate-y-1/2 translate-x-[40%] translate-y-[40%] rounded-full bg-white/60 blur-[1px]" />
                </motion.div>
              ))}

              {/* White panel - clean and simple */}
              <div className="relative overflow-hidden rounded-md bg-gradient-to-b from-[#fffef8] via-[#fffcf0] to-[#fffef8] px-6 py-4 shadow-[inset_0_2px_6px_rgba(0,0,0,0.1),0_4px_16px_rgba(0,0,0,0.35)] sm:px-8 sm:py-5">
                
                {/* Subtle warm texture overlay */}
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,_rgba(255,250,240,0.6),_transparent_50%)] opacity-70" aria-hidden />
                
                {/* Player layout - side by side */}
                <div className="relative flex flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:justify-center sm:gap-8">
                  {players.map((player, idx) => (
                    <motion.div
                      key={player.id}
                      className="flex flex-1 flex-col items-center justify-center gap-2 px-4 py-2"
                      variants={playerRowVariants}
                      initial="idle"
                      animate={highlightedPlayerId === player.id && !prefersReducedMotion ? "highlight" : "idle"}
                    >
                      {/* Player name */}
                      <p className={clsx(bebasNeue.className, "text-2xl leading-none text-slate-900 sm:text-3xl")}>
                        {player.name}
                      </p>

                      {/* Score */}
                      <div className="text-center">
                        <p className={clsx(oswald.className, "text-[10px] uppercase tracking-[0.25em] text-slate-600")}>
                          Points
                        </p>
                        <p className={clsx(bebasNeue.className, "mt-0.5 text-4xl leading-none text-orange-600 drop-shadow-[0_0_12px_rgba(255,140,50,0.5)] sm:text-5xl")}>
                          {player.score}
                        </p>
                      </div>

                      {/* Vertical divider */}
                      {idx === 0 && (
                        <div className="absolute left-1/2 top-1/2 hidden h-16 w-px -translate-x-1/2 -translate-y-1/2 bg-gradient-to-b from-transparent via-slate-400/60 to-transparent sm:block" aria-hidden />
                      )}
                    </motion.div>
                  ))}
                </div>
                  </div>
                    </div>
                  </div>
      </div>
      </div>
    </section>
  )
}
