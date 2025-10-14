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
    <div className={clsx("mx-auto flex w-full max-w-md sm:max-w-lg lg:max-w-3xl items-center justify-center px-4 sm:px-6 overflow-hidden", className)}>
      {/* Movie Theater Marquee Sign */}
      <motion.div
        className="relative w-full"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        {/* Main Marquee Frame */}
        <div className="relative rounded-2xl bg-gradient-to-br from-zinc-800 via-zinc-900 to-black p-1 shadow-xl shadow-black/40">
          {/* Chrome Frame Effect */}
          <div className="relative rounded-xl bg-gradient-to-br from-zinc-700 via-zinc-800 to-zinc-900 p-2 shadow-inner">

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
            <div className="relative rounded-lg bg-gradient-to-b from-slate-100 via-white to-slate-50 px-8 py-6 shadow-inner">

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
            </div>
          </div>
        </div>

      </motion.div>
    </div>
  )
}
