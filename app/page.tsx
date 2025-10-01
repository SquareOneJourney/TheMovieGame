'use client'

import { motion } from 'framer-motion'
import { Play } from 'lucide-react'
import Image from 'next/image'

export default function Home() {

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">

      <div className="container mx-auto px-4 py-8">
        {/* Main Content */}
        <div className="text-center mb-16">
          <div className="inline-block mb-6">
            <Image 
              src="/TheMovieGame Logo.png" 
              alt="The Movie Game" 
              width={200}
              height={96}
              className="h-24 w-auto mx-auto"
            />
          </div>
          
          <h1 className="text-6xl font-bold text-white mb-4">
            The Movie Game
          </h1>
          <p className="text-2xl font-semibold text-gray-300 max-w-2xl mx-auto mb-8">
            Challenge Mr. Robot to a movie trivia duel!
          </p>
          
          {/* Single Player Button */}
          <div className="flex justify-center">
            <a
              href="/singleplayer"
              className="inline-block bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-bold text-xl px-8 py-4 rounded-full shadow-2xl transform hover:scale-105 transition-all duration-200"
            >
              <Play className="inline h-6 w-6 mr-2" />
              Play Now
            </a>
          </div>
        </div>

        {/* Game Rules */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 text-center">
            <div className="text-4xl mb-4">🤖</div>
            <h3 className="text-xl font-bold text-white mb-2">AI Opponent</h3>
            <p className="text-gray-300">Challenge Mr. Robot in movie trivia</p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 text-center">
            <div className="text-4xl mb-4">🎭</div>
            <h3 className="text-xl font-bold text-white mb-2">Actor Clues</h3>
            <p className="text-gray-300">See two actors and guess the movie</p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 text-center">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="text-xl font-bold text-white mb-2">Score Points</h3>
            <p className="text-gray-300">Correct guess = 1 point for you</p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 text-center">
            <div className="text-4xl mb-4">🏆</div>
            <h3 className="text-xl font-bold text-white mb-2">Win Big</h3>
            <p className="text-gray-300">First to 10 points wins!</p>
          </div>
        </div>

        {/* How to Play */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-white text-center mb-6">How to Play</h2>
            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">1</div>
                <p className="text-gray-300">
                  <strong className="text-white">Mr. Robot</strong> shows you two actors from a movie
                </p>
              </div>
              <div className="flex items-start space-x-4">
                <div className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">2</div>
                <p className="text-gray-300">
                  <strong className="text-white">You guess</strong> the movie title from the actors
                </p>
              </div>
              <div className="flex items-start space-x-4">
                <div className="bg-yellow-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">3</div>
                <p className="text-gray-300">
                  <strong className="text-white">Correct?</strong> You get 1 point and it&apos;s your turn to give clues
                </p>
              </div>
              <div className="flex items-start space-x-4">
                <div className="bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">4</div>
                <p className="text-gray-300">
                  <strong className="text-white">Wrong?</strong> Mr. Robot gets 2 points and keeps giving clues
                </p>
              </div>
              <div className="flex items-start space-x-4">
                <div className="bg-purple-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">5</div>
                <p className="text-gray-300">
                  <strong className="text-white">Win!</strong> First to 10 points wins the game
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}