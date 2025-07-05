import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom'
import FrontPage from './components/FrontPage'
import About from './components/About'
import Navbar from './components/Navbar'
import LobbyList from './components/LobbyList'
import CreateLobbyForm from './components/CreateLobbyForm'
import GameRoom from './components/GameRoom'
import Modal from './components/Modal'
import CloudBackground from './components/CloudBackground'
import WaitingRoom from './components/WaitingRoom'
import { useLobby } from './hooks/useLobby.js'
import './App.css'

// Main game component that handles the lobby/game logic
function GameLobby() {
  const navigate = useNavigate()
  const [gameState, setGameState] = useState('lobbyList')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [playerName, setPlayerName] = useState('')

  const { 
    currentLobby, 
    players, 
    connected, 
    error,
    leaveLobby,
    currentPlayerName 
  } = useLobby()

  // Watch for lobby state changes to update game state
  useEffect(() => {
    if (currentLobby) {
      // When we join/create a lobby, go to waiting room
      if (currentLobby.status === 'waiting') {
        setGameState('waiting')
        // Use the current player name from the lobby hook
        if (currentPlayerName) {
          setPlayerName(currentPlayerName)
        }
      }
      // When game starts, go to playing state
      else if (currentLobby.status === 'playing') {
        setGameState('playing')
      }
    } else {
      // When we leave lobby or get disconnected, go back to lobby list
      setGameState('lobbyList')
    }
  }, [currentLobby, currentPlayerName])

  const handleCreateLobby = () => {
    setShowCreateModal(true)
  }

  const handleJoinRoom = (lobbyId, pin) => {
    // Socket.IO join logic is already handled in LobbyList component
    // This function is kept for compatibility but the real work happens in useLobby hook
    console.log('Joining lobby:', lobbyId, pin ? 'with PIN' : 'public')
  }

  const handleCreateRoom = (lobbyData) => {
    // Socket.IO create logic is already handled in CreateLobbyForm component
    // Store player name and close modal
    setPlayerName(lobbyData.playerName)
    setShowCreateModal(false)
    console.log('Creating lobby:', lobbyData)
  }

  const handleGameStart = () => {
    setGameState('playing')
  }

  const handleLeaveLobby = () => {
    leaveLobby()
    setGameState('lobbyList')
  }

  return (
    <div className="min-h-screen bg-shiba-bg flex flex-col relative">
      <CloudBackground />
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
        
        {gameState === 'waiting' && currentLobby && (
          <WaitingRoom 
            lobby={currentLobby}
            players={players}
            playerName={playerName}
            connected={connected}
            error={error}
            onLeaveLobby={handleLeaveLobby}
            onGameStart={handleGameStart}
          />
        )}
        
        {gameState === 'playing' && currentLobby && (
          <GameRoom 
            lobby={currentLobby}
            players={players}
            playerName={playerName}
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
      </Routes>
    </Router>
  )
}

export default App