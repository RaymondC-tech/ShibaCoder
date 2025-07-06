import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import FrontPage from './components/FrontPage'
import About from './components/About'
import Leaderboard from './components/Leaderboard'
import DailyChallenge from './components/DailyChallenge'
import ShibaCustomization from './components/ShibaCustomization'
import Rules from './components/Rules'

import Discussion from './components/Discussion'

import Navbar from './components/Navbar'
import LobbyList from './components/LobbyList'
import CreateLobbyForm from './components/CreateLobbyForm'
import GameRoom from './components/GameRoom'
import Modal from './components/Modal'
import CloudBackground from './components/CloudBackground'
import ShibaSprite from './components/ShibaSprite'
import WaitingRoom from './components/WaitingRoom'
import SpectatorRoom from './components/SpectatorRoom'
import { useLobby } from './hooks/useLobby.js'
import './App.css'

// Main game component that handles the lobby/game logic
function GameLobby() {
  const [gameState, setGameState] = useState('lobbyList')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [playerName, setPlayerName] = useState('')

  const { 
    currentLobby, 
    players, 
    connected, 
    error,
    leaveLobby,
    currentPlayerName,
    isSpectator,
    spectatorName,
    joinAsSpectator
  } = useLobby()

  // Watch for lobby state changes to update game state
  useEffect(() => {
    
    if (currentLobby) {
      if (isSpectator) {
        // Spectator mode - always go to spectating state
        setGameState('spectating')
      } else {
        // Player mode - follow normal flow
        if (currentLobby.status === 'waiting') {
          setGameState('waiting')
          // Use the current player name from the lobby hook
          if (currentPlayerName) {
            setPlayerName(currentPlayerName)
          }
        }
        else if (currentLobby.status === 'playing') {
          setGameState('playing')
        }
      }
    } else {
      // When we leave lobby or get disconnected, go back to lobby list
      setGameState('lobbyList')
    }
  }, [currentLobby, currentPlayerName, isSpectator])

  const handleCreateLobby = () => {
    setShowCreateModal(true)
  }

  const handleJoinRoom = (lobbyId, pin, mode) => {
    if (mode === 'spectator') {
      joinAsSpectator(lobbyId)
    }
  }

  const handleCreateRoom = (lobbyData) => {
    setPlayerName(lobbyData.playerName)
    setShowCreateModal(false)
  }


  const handleLeaveLobby = () => {
    leaveLobby()
    setGameState('lobbyList')
  }

  return (
    <div className="min-h-screen bg-shiba-bg flex flex-col relative">
      <CloudBackground />
      <ShibaSprite behavior="wander" />
      {gameState !== 'playing' && <Navbar />}
      
      <div className="flex-1 relative z-10">
        {gameState === 'lobbyList' && (
          <>
            <LobbyList 
              onCreateLobby={handleCreateLobby}
              onJoinLobby={handleJoinRoom}
            />
            
            <Modal
              isOpen={showCreateModal}
              onClose={() => setShowCreateModal(false)}
              title="Create New Lobby"
            >
              <CreateLobbyForm onCreateRoom={handleCreateRoom} />
            </Modal>
          </>
        )}
        
        {gameState === 'waiting' && (
          <WaitingRoom 
            lobby={currentLobby}
            players={players}
            playerName={playerName}
            connected={connected}
            error={error}
            onLeaveLobby={handleLeaveLobby}
          />
        )}
        
        {gameState === 'playing' && (
          <GameRoom
            lobby={currentLobby}
            players={players}
            playerName={currentPlayerName || playerName}
          />
        )}
        
        {gameState === 'spectating' && (
          <SpectatorRoom
            lobby={currentLobby}
            players={players}
            spectatorName={spectatorName}
            onLeaveLobby={handleLeaveLobby}
          />
        )}
      </div>
    </div>
  )
}

// Main App component with routing
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<FrontPage />} />
        <Route path="/game" element={<GameLobby />} />
        <Route path="/about" element={<About />} />
        <Route path="/discussion" element={<Discussion />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/daily" element={<DailyChallenge />} />
        <Route path="/customize" element={<ShibaCustomization />} />
        <Route path="/rules" element={<Rules />} />
      </Routes>
    </Router>
  )
}

export default App