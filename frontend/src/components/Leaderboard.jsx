import { Link } from 'react-router-dom'
import CloudBackground from './CloudBackground'
import ShibaSprite from './ShibaSprite'
import Navbar from './Navbar'
import CustomShibaAvatar from './CustomShibaAvatar'

function Leaderboard() {
  // Hardcoded leaderboard data with randomized Shiba colors
  const leaderboardData = {
    easy: [
      { rank: 1, name: "ShibaG", elo: 2999, wins: 420, shibaColor: "golden" },
      { rank: 2, name: "CodeN", elo: 2850, wins: 315, shibaColor: "default" },
      { rank: 3, name: "BugSq", elo: 2720, wins: 289, shibaColor: "green" },
      { rank: 4, name: "LoopM", elo: 2650, wins: 256, shibaColor: "default" },
      { rank: 5, name: "SyntaxK", elo: 2580, wins: 203, shibaColor: "purple" }
    ],
    medium: [
      { rank: 1, name: "AlgoWiz", elo: 4999, wins: 666, shibaColor: "amber" },
      { rank: 2, name: "DataSt", elo: 4750, wins: 542, shibaColor: "blue" },
      { rank: 3, name: "Recurs", elo: 4500, wins: 478, shibaColor: "pink" },
      { rank: 4, name: "BigONo", elo: 4250, wins: 401, shibaColor: "default" },
      { rank: 5, name: "HashTa", elo: 4000, wins: 356, shibaColor: "red" }
    ],
    hard: [
      { rank: 1, name: "CodeGe", elo: 6969, wins: 1337, shibaColor: "magenta" },
      { rank: 2, name: "LeetCo", elo: 6420, wins: 999, shibaColor: "lime" },
      { rank: 3, name: "Binary", elo: 6180, wins: 888, shibaColor: "silver" },
      { rank: 4, name: "Dynami", elo: 5950, wins: 777, shibaColor: "cyan" },
      { rank: 5, name: "GraphT", elo: 5730, wins: 654, shibaColor: "default" }
    ]
  }

  const CategoryCard = ({ title, players, color, description }) => (
    <div className="nes-container bg-white">
      <h3 className="font-bold text-lg mb-2" style={{ color }}>{title}</h3>
      <p className="text-xs text-gray-600 mb-4">{description}</p>
      
      <div className="space-y-3">
        {players.map((player, index) => (
          <div 
            key={player.rank} 
            className={`flex items-center justify-between p-3 rounded overflow-hidden ${
              index === 0 ? 'bg-yellow-100 border-2 border-yellow-400' : 
              index === 1 ? 'bg-gray-100 border-2 border-gray-400' :
              index === 2 ? 'bg-orange-100 border-2 border-orange-400' :
              'bg-blue-50 border border-blue-200'
            }`}
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-amber-200 text-amber-900 font-bold text-sm">
                #{player.rank}
              </div>
              <CustomShibaAvatar size={40} colorId={player.shibaColor} className="flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="font-bold text-xs truncate">{player.name}</p>
                <p className="text-xs text-gray-600">{player.wins} wins</p>
              </div>
            </div>
            <div className="text-right flex-shrink-0 ml-2">
              <p className="font-bold text-xs" style={{ color }}>{player.elo.toLocaleString()}</p>
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
          <div className="text-center mb-12">
            <div className="nes-container with-title is-centered bg-white max-w-2xl mx-auto">
              <p className="title">Leaderboard</p>
              
              <div className="py-4">
                <div className="text-5xl mb-4">🏆</div>
                <h2 className="text-lg font-bold text-amber-900 mb-2">Top Coders of ShibaCoder</h2>
                <p className="text-sm text-gray-600">
                  Battle your way through the ranks and become a coding legend!
                </p>
              </div>
            </div>
          </div>

          {/* Leaderboard Categories */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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