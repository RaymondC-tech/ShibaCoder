import { useState } from 'react'
import { sounds } from '../utils/sounds'

function LobbyList({ onCreateLobby, onJoinLobby }) {
  const [selectedLobby, setSelectedLobby] = useState(null)
  const [pinInput, setPinInput] = useState('')
  const [showPasswordModal, setShowPasswordModal] = useState(false)

  // Mock data for now - this would come from the backend
  const mockLobbies = [
    { id: 1, name: "John's Room", host: "John", players: 1, maxPlayers: 2, isPrivate: false },
    { id: 2, name: "Pro Coders Only", host: "Alice", players: 2, maxPlayers: 2, isPrivate: true },
    { id: 3, name: "Beginner Friendly", host: "Bob", players: 1, maxPlayers: 2, isPrivate: false },
    { id: 4, name: "Speed Run Challenge", host: "Charlie", players: 1, maxPlayers: 2, isPrivate: false },
  ]

  const handleJoinClick = (lobby) => {
    sounds.buttonClick()
    if (lobby.isPrivate) {
      setSelectedLobby(lobby)
      setShowPasswordModal(true)
    } else {
      onJoinLobby(lobby.id)
    }
  }

  const handlePasswordSubmit = () => {
    sounds.buttonClick()
    // In a real app, verify password with backend
    onJoinLobby(selectedLobby.id, pinInput)
    setShowPasswordModal(false)
    setPinInput('')
  }

  return (
    <div className="min-h-[calc(100vh-68px)] p-6">
      <div className="max-w-6xl mx-auto">
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
          </h1>
          <button
            type="button"
            className="nes-btn is-primary pixel-shadow"
            onClick={onCreateLobby}
          >
            <i className="nes-icon plus is-small mr-3"></i>
            Create Lobby
          </button>
        </div>

        {/* Lobby List */}
        <div className="grid gap-4">
          {mockLobbies.map((lobby) => (
            <div key={lobby.id} className="nes-container bg-white pixel-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div>
                    <h3 className="text-sm font-bold text-amber-900">{lobby.name}</h3>
                    <p className="text-xs text-gray-600 mt-1">Host: {lobby.host}</p>
                  </div>
                  {lobby.isPrivate && (
                    <div className="nes-badge">
                      <span className="is-warning text-xs">Private</span>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-xs text-gray-600">Players</p>
                    <p className="text-sm font-bold">
                      {lobby.players}/{lobby.maxPlayers}
                    </p>
                  </div>
                  <button
                    type="button"
                    className={`nes-btn ${lobby.players < lobby.maxPlayers ? 'is-success' : 'is-disabled'} text-xs`}
                    onClick={() => handleJoinClick(lobby)}
                    disabled={lobby.players >= lobby.maxPlayers}
                  >
                    {lobby.players >= lobby.maxPlayers ? 'Full' : 'Join'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {mockLobbies.length === 0 && (
          <div className="nes-container bg-white text-center py-12">
            <i className="nes-icon trophy is-large mb-4"></i>
            <p className="text-sm text-gray-600">No active lobbies. Be the first to create one!</p>
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