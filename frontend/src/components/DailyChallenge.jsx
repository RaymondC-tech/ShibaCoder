import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import CloudBackground from './CloudBackground'
import ShibaSprite from './ShibaSprite'
import Navbar from './Navbar'
import CustomShibaAvatar from './CustomShibaAvatar'
import './DailyChallenge.css'

function DailyChallenge() {
  const [timeUntilReset, setTimeUntilReset] = useState('')
  
  // Calculate time until midnight UTC
  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = new Date()
      const tomorrow = new Date(now)
      tomorrow.setUTCDate(tomorrow.getUTCDate() + 1)
      tomorrow.setUTCHours(0, 0, 0, 0)
      
      const diff = tomorrow - now
      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)
      
      setTimeUntilReset(`${hours}h ${minutes}m ${seconds}s`)
    }
    
    calculateTimeRemaining()
    const interval = setInterval(calculateTimeRemaining, 1000)
    return () => clearInterval(interval)
  }, [])
  
  // Mock daily challenge data
  const todaysChallenge = {
    date: new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
    problem: {
      title: "Two Sum",
      difficulty: "Easy",
      description: "Today's challenge is the classic Two Sum problem. Complete it to earn bonus rewards!",
      rewards: {
        firstTime: "🏆 +100 ELO",
        completion: "⭐ +50 ELO", 
        streak: "🔥 Maintain your streak!"
      }
    },
    leaderboard: [
      { rank: 1, name: "SpeedDemon", time: "0:45", shibaColor: "lime" },
      { rank: 2, name: "QuickCoder", time: "1:02", shibaColor: "red" },
      { rank: 3, name: "FastFingers", time: "1:15", shibaColor: "default" },
      { rank: 4, name: "RapidDev", time: "1:23", shibaColor: "cyan" },
      { rank: 5, name: "SwiftSolver", time: "1:37", shibaColor: "default" }
    ],
    stats: {
      attempts: 1337,
      completions: 842,
      avgTime: "2:34"
    }
  }
  
  return (
    <div className="min-h-screen bg-shiba-bg flex flex-col relative">
      <CloudBackground />
      <ShibaSprite behavior="wander" />
      <Navbar />
      
      <div className="flex-1 flex items-center justify-center relative z-10 p-4">
        <div className="max-w-4xl w-full">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="daily-challenge-header nes-container bg-white">
              <div className="glow-effect">
                <h1 className="text-3xl font-bold mb-2 text-amber-600">✨ Daily Challenge ✨</h1>
              </div>
              <p className="text-gray-600">{todaysChallenge.date}</p>
              <div className="countdown-timer mt-2">
                <p className="text-sm">Next challenge in: <span className="font-bold text-red-600">{timeUntilReset}</span></p>
              </div>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Challenge Details */}
            <div className="nes-container bg-white">
              <h2 className="text-xl font-bold mb-4">Today's Problem</h2>
              <div className="challenge-info mb-6">
                <h3 className="text-2xl font-bold text-amber-600 mb-2">{todaysChallenge.problem.title}</h3>
                <span className={`nes-badge ${todaysChallenge.problem.difficulty === 'Easy' ? 'is-success' : 'is-warning'}`}>
                  <span>{todaysChallenge.problem.difficulty}</span>
                </span>
                <p className="text-gray-600 mt-4">{todaysChallenge.problem.description}</p>
              </div>
              
              <div className="rewards-section mb-6">
                <h4 className="font-bold mb-2">🎁 Rewards:</h4>
                <ul className="space-y-2">
                  <li>{todaysChallenge.problem.rewards.firstTime}</li>
                  <li>{todaysChallenge.problem.rewards.completion}</li>
                  <li>{todaysChallenge.problem.rewards.streak}</li>
                </ul>
              </div>
              
              <Link to="/game">
                <button className="nes-btn is-warning w-full glow-button">
                  Start Daily Challenge
                </button>
              </Link>
            </div>
            
            {/* Today's Leaderboard */}
            <div className="nes-container bg-white">
              <h2 className="text-xl font-bold mb-4">🏃 Fastest Times Today</h2>
              <div className="space-y-3">
                {todaysChallenge.leaderboard.map((player, index) => (
                  <div 
                    key={player.rank}
                    className={`flex items-center justify-between p-3 rounded ${
                      index === 0 ? 'bg-yellow-100 border-2 border-yellow-400' :
                      'bg-gray-50 border border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-bold">#{player.rank}</span>
                      <CustomShibaAvatar size={32} colorId={player.shibaColor} />
                      <span className="font-semibold">{player.name}</span>
                    </div>
                    <span className="font-mono font-bold text-xs">{player.time}</span>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 p-3 bg-blue-50 rounded">
                <p className="text-sm text-center">
                  <strong>{todaysChallenge.stats.attempts}</strong> attempts • 
                  <strong> {todaysChallenge.stats.completions}</strong> completed • 
                  <strong> {todaysChallenge.stats.avgTime}</strong> avg time
                </p>
              </div>
            </div>
          </div>
          
          {/* Streak Counter */}
          <div className="mt-8 text-center">
            <div className="nes-container is-rounded bg-white inline-block">
              <p className="text-lg">
                🔥 Your Streak: <span className="font-bold text-2xl text-orange-600">0 days</span>
              </p>
            </div>
          </div>
          
          {/* Back Button */}
          <div className="text-center mt-8">
            <Link to="/">
              <button type="button" className="nes-btn">
                Back to Home
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DailyChallenge