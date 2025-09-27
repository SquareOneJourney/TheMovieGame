export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-block mb-6">
            <span className="text-6xl">🎬</span>
          </div>
          
          <h1 className="text-6xl font-bold text-white mb-4">
            The Movie Game
          </h1>
          <p className="text-2xl font-semibold text-gray-300 max-w-2xl mx-auto mb-8">
            "If you ain't first, you're last."
          </p>
          
          <a 
            href="/singleplayer"
            className="inline-block bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-bold text-xl px-8 py-4 rounded-full shadow-2xl transform hover:scale-105 transition-all duration-200"
          >
            Play Against AI
          </a>
        </div>

        {/* Game Rules */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 text-center">
            <div className="text-4xl mb-4">👥</div>
            <h3 className="text-xl font-bold text-white mb-2">Two Players</h3>
            <p className="text-gray-300">Head-to-head movie trivia competition</p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 text-center">
            <div className="text-4xl mb-4">🎭</div>
            <h3 className="text-xl font-bold text-white mb-2">Give Clues</h3>
            <p className="text-gray-300">Name two actors from a movie</p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 text-center">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="text-xl font-bold text-white mb-2">Guess Right</h3>
            <p className="text-gray-300">Correct guess = 1 point + your turn</p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 text-center">
            <div className="text-4xl mb-4">🏆</div>
            <h3 className="text-xl font-bold text-white mb-2">Win Big</h3>
            <p className="text-gray-300">Wrong guess = 2 points for clue giver</p>
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
                  <strong className="text-white">Player 1</strong> names two actors from a movie
                </p>
              </div>
              <div className="flex items-start space-x-4">
                <div className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">2</div>
                <p className="text-gray-300">
                  <strong className="text-white">Player 2</strong> guesses the movie title
                </p>
              </div>
              <div className="flex items-start space-x-4">
                <div className="bg-yellow-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">3</div>
                <p className="text-gray-300">
                  <strong className="text-white">Correct?</strong> Player 2 gets 1 point and becomes the clue giver
                </p>
              </div>
              <div className="flex items-start space-x-4">
                <div className="bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">4</div>
                <p className="text-gray-300">
                  <strong className="text-white">Wrong?</strong> Player 1 gets 2 points and keeps their turn
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}