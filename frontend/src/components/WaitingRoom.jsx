import { useState, useEffect } from 'react'
import { sounds } from '../utils/sounds'
import { useLobby } from '../hooks/useLobby.js'
import { useWebSocket } from '../hooks/useWebSocket.jsx'
import CustomShibaAvatar from './CustomShibaAvatar'

function WaitingRoom({ lobby, players, playerName, connected, error, onLeaveLobby }) {
  if (!lobby) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-68px)] p-4">
        <div className="nes-container">
          <p>Loading lobby...</p>
        </div>
      </div>
    );
  }
  const { playerReady } = useLobby()
  const { on, off } = useWebSocket()
  const [countdown, setCountdown] = useState(null)
  
  const currentPlayer = players.find(p => p.name === playerName)
  const opponent = players.find(p => p.name !== playerName)
  const isFull = players.length === lobby.maxPlayers
  const allReady = players.length === 2 && players.every(p => p.ready)
  
  // Listen for countdown events
  useEffect(() => {
    const handleCountdownStart = () => {
      setCountdown(3)
    }
    
    const handleCountdownUpdate = (data) => {
      setCountdown(data.countdown)
    }
    
    on('countdown_start', handleCountdownStart)
    on('countdown_update', handleCountdownUpdate)
    
    return () => {
      off('countdown_start', handleCountdownStart)
      off('countdown_update', handleCountdownUpdate)
    }
  }, [on, off])
  

  const handleLeaveLobby = () => {
    sounds.buttonClick()
    onLeaveLobby()
  }

  const handlePlayerReady = () => {
    sounds.buttonClick()
    playerReady()
  }


  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-68px)] p-4">
      <div className="nes-container with-title is-centered bg-white max-w-2xl w-full">
        <p className="title">Waiting Room</p>
        
        {/* Connection Status */}
        {!connected && (
          <div className="nes-container is-error mb-4">
            <p className="text-xs">⚠️ Disconnected from server</p>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="nes-container is-error mb-4">
            <p className="text-xs">❌ {error}</p>
          </div>
        )}

        <div className="flex flex-col items-center space-y-6">
          {/* Lobby Info */}
          <div className="text-center">
            <h2 className="text-lg font-bold text-amber-900 mb-2">{lobby.name}</h2>
            {lobby.type === 'private' && (
              <div className="nes-badge mt-2">
                <span className="is-warning text-xs">Private</span>
              </div>
            )}
          </div>

          {/* Players Section */}
          <div className="w-full">
            <h3 className="text-sm font-bold mb-4 text-center">
              Players ({players.length}/{lobby.maxPlayers})
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              {/* Player 1 */}
              <div className={`nes-container ${currentPlayer?.ready ? 'bg-green-50' : 'bg-blue-50'}`}>
                <div className="text-center">
                  {currentPlayer ? (
                    <>
                      <div className="mb-2">
                        <CustomShibaAvatar size={64} className="mx-auto" />
                      </div>
                      <p className="text-sm font-bold text-blue-900">{currentPlayer.name}</p>
                      <p className="text-xs text-blue-600">You</p>
                      {currentPlayer.ready ? (
                        <div className="mt-2">
                          <span className="nes-text is-success text-xs">✓ Ready!</span>
                        </div>
                      ) : (
                        <div className="mt-2">
                          <span className="nes-text is-warning text-xs">Not Ready</span>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <div className="mb-2">
                        <img 
                          src="/shibaface.svg" 
                          alt="Empty" 
                          className="w-16 h-16 mx-auto opacity-30"
                          style={{ imageRendering: 'pixelated' }}
                        />
                      </div>
                      <p className="text-xs text-gray-500">Waiting...</p>
                    </>
                  )}
                </div>
              </div>

              {/* Player 2 */}
              <div className={`nes-container ${opponent?.ready ? 'bg-green-50' : 'bg-pink-50'}`}>
                <div className="text-center">
                  {opponent ? (
                    <>
                      <div className="mb-2">
                        <img 
                          src="/shibaface.svg" 
                          alt="Opponent" 
                          className="w-16 h-16 mx-auto"
                          style={{ imageRendering: 'pixelated' }}
                        />
                      </div>
                      <p className="text-sm font-bold text-pink-900">{opponent.name}</p>
                      <p className="text-xs text-pink-600">Opponent</p>
                      {opponent.ready ? (
                        <div className="mt-2">
                          <span className="nes-text is-success text-xs">✓ Ready!</span>
                        </div>
                      ) : (
                        <div className="mt-2">
                          <span className="nes-text is-warning text-xs">Not Ready</span>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <div className="mb-2">
                        <img 
                          src="/shibaface.svg" 
                          alt="Empty" 
                          className="w-16 h-16 mx-auto opacity-30"
                          style={{ imageRendering: 'pixelated' }}
                        />
                      </div>
                      <p className="text-xs text-gray-500">Waiting...</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Countdown Display */}
          {countdown && (
            <div className="text-center">
              <h2 className="text-4xl font-bold text-green-600 animate-pulse">
                {countdown}
              </h2>
              <p className="text-sm text-gray-600 mt-2">Game starting...</p>
            </div>
          )}
          
          {/* Status Message - Simple and Clean */}
          {allReady && !countdown && (
            <div className="text-center">
              <p className="text-sm font-bold text-green-600 animate-pulse">🚀 Starting game...</p>
              <p className="text-xs text-gray-600 mt-2">Both players are ready!</p>
            </div>
          )}

          {/* Ready Button - Show when player is not ready */}
          {currentPlayer && !currentPlayer.ready && (
            <button
              type="button"
              className="nes-btn is-success"
              onClick={handlePlayerReady}
              disabled={!connected}
            >
              Ready to Battle!
            </button>
          )}

          {/* Waiting message when player is ready */}
          {currentPlayer?.ready && !allReady && (
            <p className="text-sm text-gray-600 animate-pulse">
              {isFull ? 'Waiting for opponent to ready up...' : 'You are ready! Waiting for opponent to join...'}
            </p>
          )}

          {/* Leave Lobby Button */}
          <div className="mt-4">
            <button
              type="button"
              className="nes-btn is-error text-xs"
              onClick={handleLeaveLobby}
              disabled={!connected}
            >
              Leave Lobby
            </button>
          </div>

          {/* Instructions */}
          {lobby.type === 'private' && (
            <div className="nes-container is-rounded bg-amber-50 text-center">
              <p className="text-xs">
                <strong>Private Lobby</strong><br />
                Share this info with your friend:<br />
                <strong>ID:</strong> {lobby.id.replace('lobby_', '')} • <strong>PIN:</strong> {lobby.pin}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default WaitingRoom