import { Link } from 'react-router-dom'
import CloudBackground from './CloudBackground'
import ShibaSprite from './ShibaSprite'
import Navbar from './Navbar'

function Rules() {
  return (
    <div className="min-h-screen bg-shiba-bg flex flex-col relative">
      <CloudBackground />
      <ShibaSprite behavior="wander" />
      <Navbar />
      
      <div className="flex-1 flex items-center justify-center relative z-10 p-4">
        <div className="max-w-4xl w-full">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="nes-container with-title is-centered bg-white">
              <p className="title">Game Rules</p>
              
              <div className="py-4">
                <div className="text-5xl mb-4">📋</div>
                <h2 className="text-lg font-bold text-amber-900 mb-2">How to Play ShibaCoder</h2>
                <p className="text-sm text-gray-600">
                  Simple rules for epic coding battles!
                </p>
              </div>
            </div>
          </div>

          {/* Rules Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Game Basics */}
            <div className="nes-container bg-white">
              <h3 className="text-xl font-bold mb-4 text-blue-600">🎮 Game Basics</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <span className="text-blue-500 font-bold">1.</span>
                  <p>Join or create a lobby with up to 2 players</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-500 font-bold">2.</span>
                  <p>Both players get the same coding problem</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-500 font-bold">3.</span>
                  <p>Write your solution in the code editor</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-500 font-bold">4.</span>
                  <p>Submit when you think your code is correct</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-500 font-bold">5.</span>
                  <p>First to solve correctly wins the round!</p>
                </div>
              </div>
            </div>

            {/* Scoring */}
            <div className="nes-container bg-white">
              <h3 className="text-xl font-bold mb-4 text-green-600">🏆 Scoring</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <span className="text-green-500 font-bold">•</span>
                  <p><strong>Correct Solution:</strong> Win the match</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-500 font-bold">•</span>
                  <p><strong>Speed Bonus:</strong> Faster solutions rank higher</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-500 font-bold">•</span>
                  <p><strong>ELO System:</strong> Gain/lose rating based on wins</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-500 font-bold">•</span>
                  <p><strong>Daily Challenge:</strong> Extra ELO for daily problems</p>
                </div>
              </div>
            </div>

            {/* Code Guidelines */}
            <div className="nes-container bg-white">
              <h3 className="text-xl font-bold mb-4 text-purple-600">💻 Code Guidelines</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <span className="text-purple-500 font-bold">•</span>
                  <p>Write clean, readable code</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-purple-500 font-bold">•</span>
                  <p>Test your solution with example inputs</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-purple-500 font-bold">•</span>
                  <p>Handle edge cases properly</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-purple-500 font-bold">•</span>
                  <p>Submit only when you're confident</p>
                </div>
              </div>
            </div>

            {/* Tips & Tricks */}
            <div className="nes-container bg-white">
              <h3 className="text-xl font-bold mb-4 text-orange-600">💡 Tips & Tricks</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <span className="text-orange-500 font-bold">•</span>
                  <p>Read the problem statement carefully</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-orange-500 font-bold">•</span>
                  <p>Start with the simplest solution first</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-orange-500 font-bold">•</span>
                  <p>Use console.log() to debug your code</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-orange-500 font-bold">•</span>
                  <p>Practice daily challenges to improve</p>
                </div>
              </div>
            </div>
          </div>

          {/* Fair Play */}
          <div className="mt-6">
            <div className="nes-container bg-white text-center">
              <h3 className="text-xl font-bold mb-4 text-red-600">⚖️ Fair Play</h3>
              <div className="text-sm space-y-2">
                <p>🚫 No external tools or AI assistance during matches</p>
                <p>🤝 Be respectful to other players</p>
                <p>🎯 Play fairly and have fun!</p>
              </div>
            </div>
          </div>

          {/* Back Button */}
          <div className="text-center mt-8">
            <Link to="/">
              <button type="button" className="nes-btn is-primary">
                Back to Home
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Rules