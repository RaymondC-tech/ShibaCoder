import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import './Navbar.css'

function Navbar() {
  // ELO state that can be refreshed
  const [playerELO, setPlayerELO] = useState(0)

  // Get ELO from localStorage
  const getPlayerELO = () => {
    let elo = localStorage.getItem('shibacoder_player_elo')
    if (!elo) {
      elo = Math.floor(Math.random() * 10000) // 0-10000
      localStorage.setItem('shibacoder_player_elo', elo)
    }
    return parseInt(elo)
  }

  // Initialize and refresh ELO
  useEffect(() => {
    setPlayerELO(getPlayerELO())
    
    // Refresh ELO when window gains focus (after games)
    const handleFocus = () => {
      setPlayerELO(getPlayerELO())
    }
    
    window.addEventListener('focus', handleFocus)
    
    // Also refresh every 5 seconds to catch updates
    const interval = setInterval(() => {
      setPlayerELO(getPlayerELO())
    }, 5000)
    
    return () => {
      window.removeEventListener('focus', handleFocus)
      clearInterval(interval)
    }
  }, [])

  const getELOColor = (elo) => {
    if (elo < 3000) return { bg: 'bg-green-100', text: 'text-green-800', icon: '🟢' }
    if (elo < 6000) return { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: '🟡' }
    return { bg: 'bg-red-100', text: 'text-red-800', icon: '🔴' }
  }

  const eloStyle = getELOColor(playerELO)
  return (
    <nav className="bg-shiba-bg border-b-4 border-amber-700 relative z-20">
      <div className="flex items-center justify-between px-6 py-3">
        <div className="flex items-center gap-3">
          <img 
            src="/logo.svg" 
            alt="ShibaCoder Logo" 
            className="h-16 w-16"
            style={{ imageRendering: 'auto', objectFit: 'cover', transform: 'scale(1.3)' }}
          />
          <div className="flex items-center gap-2">
            <h1 className="text-xs font-bold text-amber-900">ShibaCoder</h1>
            <span className="text-xs text-amber-700 mx-1">×</span>
            <span className="text-xs text-amber-700">hack404</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Link to="/about">
            <button 
              type="button" 
              className="nes-btn is-normal text-xs px-4 py-1"
              style={{ height: '32px' }}
            >
              About
            </button>
          </Link>
          <Link to="/discussion">
            <button 
              type="button" 
              className="nes-btn is-normal text-xs px-4 py-1"
              style={{ height: '32px' }}
            >
              Discussion
            </button>
          </Link>
          <Link to="/daily">
            <button 
              type="button" 
              className="nes-btn is-warning text-xs px-4 py-1 daily-glow"
              style={{ height: '32px' }}
            >
              Daily
            </button>
          </Link>
          <Link to="/leaderboard">
            <button 
              type="button" 
              className="nes-btn is-normal text-xs px-4 py-1"
              style={{ height: '32px' }}
            >
              Leaderboard
            </button>
          </Link>
          <Link to="/rules">
            <button 
              type="button" 
              className="nes-btn is-normal text-xs px-4 py-1"
              style={{ height: '32px' }}
            >
              Rules
            </button>
          </Link>
          <a 
            href="https://github.com/RaymondC-tech/ShibaCoder" 
            target="_blank" 
            rel="noopener noreferrer"
            className="nes-btn is-normal text-xs px-4 py-1 inline-flex items-center"
            style={{ height: '32px' }}
          >
            <i className="nes-icon github is-small mr-2"></i>
            Code
          </a>
          
          {/* ELO Display - far right position */}
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${eloStyle.bg} border-2 border-amber-300`}>
            <span className="text-xs font-bold">{eloStyle.icon}</span>
            <span className={`text-xs font-bold ${eloStyle.text}`}>
              {playerELO.toLocaleString()} ELO
            </span>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar