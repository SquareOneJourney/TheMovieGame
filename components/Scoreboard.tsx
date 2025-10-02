'use client'

import React from "react"
import clsx from "clsx"
import { motion, useReducedMotion } from "framer-motion"
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

  if (!players || players.length !== 2) {
    return null
  }

  return (
    <section className="flex w-full items-center justify-center px-2 sm:px-4 py-1 sm:py-2">
      {/* Result Flash Overlay */}
      {resultFlash && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: -50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: -50 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="absolute inset-0 z-50 flex items-center justify-center"
        >
          <div className={`relative w-full max-w-2xl mx-2 sm:mx-4 rounded-xl sm:rounded-2xl p-4 sm:p-8 shadow-2xl ${
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
                className={`text-xl sm:text-3xl md:text-4xl font-bold ${
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

        {/* Top header section with "THE MOVIE GAME" - Mobile Optimized */}
        <div className="relative mb-1 sm:mb-2">
          {/* Art Deco Sunburst accent - Hidden on mobile */}
          <div className="absolute -top-8 left-1/2 hidden sm:flex -translate-x-1/2 items-end justify-center gap-1" aria-hidden>
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

          {/* "THE MOVIE GAME" header with integrated scores - Mobile Optimized */}
          <div className="relative rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#6b2d1a] via-[#4a1d10] to-[#5a2515] p-0.5 sm:p-1 shadow-[0_8px_20px_rgba(0,0,0,0.7),0_0_0_1px_rgba(34,211,238,0.4),inset_0_1px_3px_rgba(34,211,238,0.2)] sm:shadow-[0_15px_40px_rgba(0,0,0,0.7),0_0_0_2px_rgba(34,211,238,0.4),inset_0_1px_3px_rgba(34,211,238,0.2)]">
            <div className="relative overflow-hidden rounded-lg sm:rounded-xl bg-gradient-to-b from-[#5a2515] via-[#3d1810] to-[#4a1d10] px-3 py-2 sm:px-6 sm:py-4 shadow-[inset_0_2px_6px_rgba(0,0,0,0.8)]">
              
              {/* Corner Scores with highlighting - Moved inward */}
              <motion.div 
                className="absolute top-1 left-3 sm:top-3 sm:left-6 z-10"
                animate={highlightedPlayerId === players[0]?.id && !prefersReducedMotion ? {
                  scale: [1, 1.15, 1],
                  textShadow: [
                    "0 0 12px rgba(255,140,50,0.8)",
                    "0 0 24px rgba(255,140,50,1)",
                    "0 0 12px rgba(255,140,50,0.8)"
                  ]
                } : {}}
                transition={{ duration: 0.6, ease: "easeInOut" }}
              >
                <div className="text-center">
                  <div className={clsx(bebasNeue.className, "text-sm sm:text-lg md:text-xl text-amber-300 leading-none font-bold")}>
                    YOU
                  </div>
                  <div className={clsx(bebasNeue.className, "text-xl sm:text-3xl md:text-4xl lg:text-5xl text-orange-400 leading-none drop-shadow-[0_0_16px_rgba(255,140,50,0.8)] font-bold")}>
                    {players[0]?.score || 0}
                  </div>
                </div>
              </motion.div>
              
              <motion.div 
                className="absolute top-1 right-3 sm:top-3 sm:right-6 z-10"
                animate={highlightedPlayerId === players[1]?.id && !prefersReducedMotion ? {
                  scale: [1, 1.15, 1],
                  textShadow: [
                    "0 0 12px rgba(255,140,50,0.8)",
                    "0 0 24px rgba(255,140,50,1)",
                    "0 0 12px rgba(255,140,50,0.8)"
                  ]
                } : {}}
                transition={{ duration: 0.6, ease: "easeInOut" }}
              >
                <div className="text-center">
                  <div className={clsx(bebasNeue.className, "text-sm sm:text-lg md:text-xl text-amber-300 leading-none font-bold")}>
                    ROBOT
                  </div>
                  <div className={clsx(bebasNeue.className, "text-xl sm:text-3xl md:text-4xl lg:text-5xl text-orange-400 leading-none drop-shadow-[0_0_16px_rgba(255,140,50,0.8)] font-bold")}>
                    {players[1]?.score || 0}
                  </div>
                </div>
              </motion.div>

              <motion.h1
                className={clsx(
                  bebasNeue.className,
                  "text-center text-2xl sm:text-4xl md:text-5xl lg:text-6xl tracking-[0.1em] sm:tracking-[0.15em] text-transparent bg-clip-text bg-gradient-to-b from-amber-300 via-orange-300 to-amber-400 drop-shadow-[0_2px_8px_rgba(255,165,0,0.8)]"
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

        {/* Scores are now integrated into the header above */}
      </div>
    </section>
  )
}
