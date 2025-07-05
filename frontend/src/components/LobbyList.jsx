import { useState, useEffect } from 'react'
import { sounds } from '../utils/sounds'
import { useLobby } from '../hooks/useLobby'

function LobbyList({ onCreateLobby, onJoinLobby }) {
  const [selectedLobby, setSelectedLobby] = useState(null)
  const [pinInput, setPinInput] = useState('')
  const [showPasswordModal, setShowPasswordModal] = useState(false)
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
    // Check if lobby is private (note: backend sends 'type' field, not 'isPrivate')
    if (lobby.type === 'private') {
      setSelectedLobby(lobby)
      setShowPasswordModal(true)
    } else {
      // Join public lobby directly
      joinLobby(lobby.id)
      // The UI transition to waiting room will happen automatically via App.jsx useEffect
    }
  }

  const handlePasswordSubmit = () => {
    sounds.buttonClick()
    if (pinInput.length === 4) {
      joinLobby(selectedLobby.id, pinInput)
      setShowPasswordModal(false)
      setPinInput('')
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
              src="/logo.svg" 
              alt="ShibaCoder Logo" 
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
                      <h3 className="text-sm font-bold text-amber-900">{lobby.name}</h3>
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
                    <button
                      type="button"
                      className={`nes-btn ${lobby.playerCount < lobby.maxPlayers ? 'is-success' : 'is-disabled'} text-xs`}
                      onClick={() => handleJoinClick(lobby)}
                      disabled={lobby.playerCount >= lobby.maxPlayers || !connected}
                    >
                      {lobby.playerCount >= lobby.maxPlayers ? 'Full' : 'Join'}
                    </button>
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

        {/* Password Modal */}
        {showPasswordModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="nes-container is-dark bg-white max-w-md w-full">
              <h3 className="text-sm font-bold mb-4">Enter PIN</h3>
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