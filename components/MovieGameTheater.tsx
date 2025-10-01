'use client'

import React from 'react'
import { motion } from 'framer-motion'
import clsx from 'clsx'
import { useReducedMotion } from 'framer-motion'

interface MovieGameTheaterProps {
  className?: string
}

export function MovieGameTheater({ className }: MovieGameTheaterProps) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <div className={clsx("flex justify-center items-center w-full", className)}>
      {/* Movie Theater Marquee Sign */}
      <motion.div
        className="relative"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        {/* Main Marquee Frame */}
        <div className="relative bg-gradient-to-br from-zinc-800 via-zinc-900 to-black rounded-2xl p-1 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          {/* Chrome Frame Effect */}
          <div className="relative bg-gradient-to-br from-zinc-700 via-zinc-800 to-zinc-900 rounded-xl p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.15),inset_0_-8px_20px_rgba(0,0,0,0.7)]">

            {/* Neon Glow Background */}
            <motion.div
              className="absolute inset-0 rounded-xl bg-gradient-radial from-amber-200/20 via-transparent to-transparent opacity-60"
              animate={prefersReducedMotion ? {} : {
                opacity: [0.4, 0.8, 0.5],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut"
              }}
            />

            {/* Marquee Content */}
            <div className="relative bg-gradient-to-b from-slate-100 via-white to-slate-50 rounded-lg px-8 py-6 shadow-[inset_0_2px_4px_rgba(255,255,255,0.8),inset_0_-8px_16px_rgba(0,0,0,0.15)]">

              {/* Decorative Border Elements */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" />

              {/* Theater Name */}
              <motion.div
                className="relative text-center"
                animate={prefersReducedMotion ? {} : {
                  textShadow: [
                    "0 0 10px rgba(253,224,71,0.6), 0 0 20px rgba(253,224,71,0.4)",
                    "0 0 15px rgba(253,224,71,0.8), 0 0 30px rgba(253,224,71,0.6)",
                    "0 0 10px rgba(253,224,71,0.6), 0 0 20px rgba(253,224,71,0.4)",
                  ],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "easeInOut"
                }}
              >
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-[0.15em] text-amber-900">
                  THE MOVIE GAME
                </h1>
              </motion.div>

              {/* Subtitle */}
              <motion.p
                className="mt-2 text-center text-sm sm:text-base text-slate-600 font-medium tracking-[0.2em] uppercase"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                Theater
              </motion.p>

              {/* Decorative Film Strip Pattern */}
              <div className="absolute top-2 left-2 right-2 bottom-2 pointer-events-none">
                <div className="w-full h-full bg-[radial-gradient(circle_at_25%_25%,rgba(0,0,0,0.05)_1px,transparent_1px),radial-gradient(circle_at_75%_75%,rgba(0,0,0,0.05)_1px,transparent_1px)] bg-[length:8px_8px]" />
              </div>
            </div>
          </div>
        </div>

        {/* Corner Decorative Elements */}
        <div className="absolute -top-2 -left-2 w-4 h-4 bg-amber-400 rounded-full shadow-[0_0_12px_rgba(253,224,71,0.8)]" />
        <div className="absolute -top-2 -right-2 w-4 h-4 bg-amber-400 rounded-full shadow-[0_0_12px_rgba(253,224,71,0.8)]" />
        <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-amber-400 rounded-full shadow-[0_0_12px_rgba(253,224,71,0.8)]" />
        <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-amber-400 rounded-full shadow-[0_0_12px_rgba(253,224,71,0.8)]" />
      </motion.div>
    </div>
  )
}
