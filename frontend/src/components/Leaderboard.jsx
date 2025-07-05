import { Link } from 'react-router-dom'
import CloudBackground from './CloudBackground'
import ShibaSprite from './ShibaSprite'
import Navbar from './Navbar'

function Leaderboard() {
  // Hardcoded leaderboard data
  const leaderboardData = {
    easy: [
      { rank: 1, name: "ShibaGod", elo: 2999, wins: 420, avatar: "🐕" },
      { rank: 2, name: "CodeNinja", elo: 2850, wins: 315, avatar: "🥷" },
      { rank: 3, name: "BugSquasher", elo: 2720, wins: 289, avatar: "🔨" },
      { rank: 4, name: "LoopMaster", elo: 2650, wins: 256, avatar: "🔄" },
      { rank: 5, name: "SyntaxKing", elo: 2580, wins: 203, avatar: "👑" }
    ],
    medium: [
      { rank: 1, name: "AlgoWizard", elo: 4999, wins: 666, avatar: "🧙‍♂️" },
      { rank: 2, name: "DataStructGuru", elo: 4750, wins: 542, avatar: "📚" },
      { rank: 3, name: "RecursionQueen", elo: 4500, wins: 478, avatar: "👸" },
      { rank: 4, name: "BigONotation", elo: 4250, wins: 401, avatar: "📈" },
      { rank: 5, name: "HashTableHero", elo: 4000, wins: 356, avatar: "🦸‍♂️" }
    ],
    hard: [
      { rank: 1, name: "CodeGenius42", elo: 6969, wins: 1337, avatar: "🧠" },
      { rank: 2, name: "LeetCodeLegend", elo: 6420, wins: 999, avatar: "⚡" },
      { rank: 3, name: "BinarySearchBeast", elo: 6180, wins: 888, avatar: "🔍" },
      { rank: 4, name: "DynamicProgrammer", elo: 5950, wins: 777, avatar: "💎" },
      { rank: 5, name: "GraphTraverser", elo: 5730, wins: 654, avatar: "🕸️" }
    ]
  }

  const CategoryCard = ({ title, players, color, description }) => (
    <div className="nes-container with-title bg-white">
      <p className="title" style={{ color }}>{title}</p>
      <p className="text-xs text-gray-600 mb-4">{description}</p>
      
      <div className="space-y-3">
        {players.map((player, index) => (
          <div 
            key={player.rank} 
            className={`flex items-center justify-between p-3 rounded ${
              index === 0 ? 'bg-yellow-100 border-2 border-yellow-400' : 
              index === 1 ? 'bg-gray-100 border-2 border-gray-400' :
              index === 2 ? 'bg-orange-100 border-2 border-orange-400' :
              'bg-blue-50 border border-blue-200'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-200 text-amber-900 font-bold text-sm">
                #{player.rank}
              </div>
              <span className="text-2xl">{player.avatar}</span>
              <div>
                <p className="font-bold text-sm">{player.name}</p>
                <p className="text-xs text-gray-600">{player.wins} wins</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-lg" style={{ color }}>{player.elo}</p>
              <p className="text-xs text-gray-500">ELO</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-shiba-bg flex flex-col relative">
      <CloudBackground />
      <ShibaSprite behavior="wander" />
      <Navbar />
      
      <div className="flex-1 flex items-center justify-center relative z-10 p-4">
        <div className="max-w-6xl w-full">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="nes-container with-title is-centered bg-white max-w-2xl mx-auto relative">
              <p className="title">🏆 Leaderboard</p>
              
              {/* Trophy image positioned at top center */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-8 z-20">
                <div className="text-6xl">🏆</div>
              </div>
              
              <div className="pt-8">
                <h2 className="text-lg font-bold text-amber-900 mb-2">Top Coders of ShibaCoder</h2>
                <p className="text-sm text-gray-600">
                  Battle your way through the ranks and become a coding legend!
                </p>
              </div>
            </div>
          </div>

          {/* Leaderboard Categories */}
          <div className="grid md:grid-cols-3 gap-6">
            <CategoryCard 
              title="🟢 Easy League" 
              players={leaderboardData.easy}
              color="#16a34a"
              description="ELO: Under 3,000"
            />
            <CategoryCard 
              title="🟡 Medium League" 
              players={leaderboardData.medium}
              color="#ca8a04"
              description="ELO: 3,000 - 5,000"
            />
            <CategoryCard 
              title="🔴 Hard League" 
              players={leaderboardData.hard}
              color="#dc2626"
              description="ELO: Above 5,000"
            />
          </div>

          {/* Footer */}
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

export default Leaderboard 