import { useState, useEffect } from 'react'
import { sounds } from '../utils/sounds'
import { useLobby } from '../hooks/useLobby.js'

function LobbyList({ onCreateLobby, onJoinLobby }) {
  const [selectedLobby, setSelectedLobby] = useState(null)
  const [pinInput, setPinInput] = useState('')
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showNameModal, setShowNameModal] = useState(false)
  const [playerNameInput, setPlayerNameInput] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  const {
    lobbies,
    pagination,
    loading,
    error,
    connected,
    getLobbyList,
    joinLobby,
    clearError
  } = useLobby()

  // Load lobby list on component mount and when page/search changes
  useEffect(() => {
    if (connected) {
      getLobbyList(currentPage, searchTerm)
    }
  }, [connected, currentPage, searchTerm, getLobbyList])

  // Refresh lobby list every 10 seconds
  useEffect(() => {
    if (!connected) return

    const interval = setInterval(() => {
      getLobbyList(currentPage, searchTerm)
    }, 10000)

    return () => clearInterval(interval)
  }, [connected, currentPage, searchTerm, getLobbyList])

  const handleJoinClick = (lobby) => {
    sounds.buttonClick()
    setSelectedLobby(lobby)
    
    // First check if we have a saved player name
    const savedName = localStorage.getItem('shibacoder_player_name')
    if (savedName) {
      setPlayerNameInput(savedName)
      // If it's a private lobby, show password modal, otherwise join directly
      if (lobby.type === 'private') {
        setShowPasswordModal(true)
      } else {
        // Join public lobby with saved name
        joinLobby(lobby.id, null, savedName)
      }
    } else {
      // No saved name, show name prompt first
      setShowNameModal(true)
    }
  }

  const handleSpectateClick = (lobby) => {
    sounds.buttonClick()
    // Navigate to spectator mode - pass lobby info to parent
    onJoinLobby(lobby.id, null, 'spectator')
  }

  const handleNameSubmit = () => {
    sounds.buttonClick()
    if (playerNameInput.trim()) {
      // Save the name for future use
      localStorage.setItem('shibacoder_player_name', playerNameInput.trim())
      
      // If it's a private lobby, show password modal next
      if (selectedLobby.type === 'private') {
        setShowNameModal(false)
        setShowPasswordModal(true)
      } else {
        // Join public lobby directly
        joinLobby(selectedLobby.id, null, playerNameInput.trim())
        setShowNameModal(false)
        setPlayerNameInput('')
      }
    }
  }

  const handlePasswordSubmit = () => {
    sounds.buttonClick()
    if (pinInput.length === 4) {
      const playerName = playerNameInput || localStorage.getItem('shibacoder_player_name')
      joinLobby(selectedLobby.id, pinInput, playerName)
      setShowPasswordModal(false)
      setPinInput('')
      setPlayerNameInput('')
      // The UI transition to waiting room will happen automatically via App.jsx useEffect
    }
  }

  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1) // Reset to first page when searching
  }

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage)
  }

  // Clear error when user interacts
  const handleErrorDismiss = () => {
    clearError()
  }

  return (
    <div className="min-h-[calc(100vh-68px)] p-6">
      <div className="max-w-6xl mx-auto">
        {/* Connection Status */}
        {!connected && (
          <div className="nes-container is-error mb-4">
            <p className="text-xs">⚠️ Disconnected from server. Reconnecting...</p>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="nes-container is-error mb-4">
            <div className="flex justify-between items-center">
              <p className="text-xs">❌ {error}</p>
              <button 
                className="nes-btn is-error text-xs"
                onClick={handleErrorDismiss}
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-amber-900 flex items-center gap-3">
            <img 
              src="/shibaface.svg" 
              alt="Shiba Face" 
              className="h-14 w-14"
              style={{ imageRendering: 'auto', objectFit: 'contain' }}
            />
            Active Lobbies
            {connected && (
              <span className="nes-badge">
                <span className="is-success text-xs">Online</span>
              </span>
            )}
          </h1>
          <button
            type="button"
            className={`nes-btn is-primary pixel-shadow ${!connected ? 'is-disabled' : ''}`}
            onClick={onCreateLobby}
            disabled={!connected}
          >
            <i className="nes-icon plus is-small mr-3"></i>
            Create Lobby
          </button>
        </div>

        {/* Search Bar */}
        <div className="nes-field mb-6">
          <input
            type="text"
            className="nes-input"
            placeholder="🔍 Search lobbies..."
            value={searchTerm}
            onChange={handleSearch}
            disabled={!connected}
          />
        </div>

        {/* Loading State */}
        {loading && (
          <div className="nes-container bg-white text-center py-12">
            <div className="animate-pulse">
              <p className="text-sm text-gray-600">Loading lobbies...</p>
            </div>
          </div>
        )}

        {/* Lobby List */}
        {!loading && (
          <div className="grid gap-4">
            {lobbies.map((lobby) => (
              <div key={lobby.id} className="nes-container bg-white pixel-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-amber-900">{lobby.name}</h3>
                        {lobby.elo_range && (
                          <span className={`text-xs px-2 py-1 rounded ${
                            lobby.elo_range === 'easy' ? 'bg-green-100 text-green-800' :
                            lobby.elo_range === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {lobby.elo_range === 'easy' ? '🟢' :
                             lobby.elo_range === 'medium' ? '🟡' : '🔴'}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        Status: {lobby.status === 'waiting' ? 'Waiting for players' : lobby.status}
                      </p>
                    </div>
                    {lobby.type === 'private' && (
                      <div className="nes-badge">
                        <span className="is-warning text-xs">Private</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <p className="text-xs text-gray-600">Players</p>
                      <p className="text-sm font-bold">
                        {lobby.playerCount}/{lobby.maxPlayers}
                      </p>
                    </div>
                    {lobby.playerCount < lobby.maxPlayers ? (
                      <button
                        type="button"
                        className="nes-btn is-success text-xs"
                        onClick={() => handleJoinClick(lobby)}
                        disabled={!connected}
                      >
                        Join
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="nes-btn is-warning text-xs"
                        onClick={() => handleSpectateClick(lobby)}
                        disabled={!connected}
                      >
                        👁️ Spectate
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && lobbies.length === 0 && (
          <div className="nes-container bg-white text-center py-12">
            <i className="nes-icon trophy is-large mb-4"></i>
            <p className="text-sm text-gray-600">
              {searchTerm ? `No lobbies found for "${searchTerm}"` : 'No active lobbies. Be the first to create one!'}
            </p>
          </div>
        )}

        {/* Pagination */}
        {!loading && pagination.totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-6">
            <button
              type="button"
              className={`nes-btn ${currentPage === 1 ? 'is-disabled' : ''} text-xs`}
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1 || !connected}
            >
              ← Prev
            </button>
            
            <span className="text-sm">
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>
            
            <button
              type="button"
              className={`nes-btn ${currentPage === pagination.totalPages ? 'is-disabled' : ''} text-xs`}
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === pagination.totalPages || !connected}
            >
              Next →
            </button>
          </div>
        )}

        {/* Name Modal */}
        {showNameModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="nes-container bg-white max-w-md w-full">
              <h3 className="text-sm font-bold mb-4 text-gray-900">Enter Your Name</h3>
              <p className="text-xs text-gray-600 mb-4">
                Please enter your name to join the lobby.
              </p>
              <div className="nes-field mb-4">
                <input
                  type="text"
                  className="nes-input"
                  placeholder="Your name..."
                  value={playerNameInput}
                  onChange={(e) => setPlayerNameInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && playerNameInput.trim() && handleNameSubmit()}
                  maxLength={12}
                  autoFocus
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="nes-btn flex-1"
                  onClick={() => {
                    sounds.buttonClick()
                    setShowNameModal(false)
                    setPlayerNameInput('')
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="nes-btn is-primary flex-1"
                  onClick={handleNameSubmit}
                  disabled={!playerNameInput.trim()}
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Password Modal */}
        {showPasswordModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="nes-container bg-white max-w-md w-full">
              <h3 className="text-sm font-bold mb-4 text-gray-900">Enter PIN</h3>
              <p className="text-xs text-gray-600 mb-4">
                This is a private lobby. Please enter the 4-digit PIN to join.
              </p>
              <div className="nes-field mb-4">
                <input
                  type="text"
                  className="nes-input text-center"
                  placeholder="0000"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  onKeyPress={(e) => e.key === 'Enter' && pinInput.length === 4 && handlePasswordSubmit()}
                  maxLength={4}
                  style={{ fontSize: '20px', letterSpacing: '12px', fontFamily: 'monospace' }}
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="nes-btn flex-1"
                  onClick={() => {
                    sounds.buttonClick()
                    setShowPasswordModal(false)
                    setPinInput('')
                    setPlayerNameInput('')
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="nes-btn is-primary flex-1"
                  onClick={handlePasswordSubmit}
                >
                  Join
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default LobbyList