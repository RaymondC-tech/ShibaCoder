import { Browser } from 'react-kawaii'
import { sounds } from '../utils/sounds'

function WaitingRoom({ lobby, players, playerName, connected, error, onLeaveLobby, onGameStart }) {
  const currentPlayer = players.find(p => p.name === playerName)
  const opponent = players.find(p => p.name !== playerName)
  const isFull = players.length === lobby.maxPlayers

  const handleLeaveLobby = () => {
    sounds.buttonClick()
    onLeaveLobby()
  }

  const handleGameStart = () => {
    sounds.buttonClick()
    onGameStart()
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
            <div className="nes-badge is-splited">
              <span className="is-dark">Lobby ID</span>
              <span className="is-warning">{lobby.id.replace('lobby_', '')}</span>
            </div>
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
              <div className="nes-container bg-blue-50">
                <div className="text-center">
                  {currentPlayer ? (
                    <>
                      <div className="nes-avatar is-rounded mb-2">
                        <Browser size={60} mood="happy" color="#92C5F7" />
                      </div>
                      <p className="text-sm font-bold text-blue-900">{currentPlayer.name}</p>
                      <p className="text-xs text-blue-600">You</p>
                    </>
                  ) : (
                    <>
                      <div className="nes-avatar is-rounded mb-2">
                        <Browser size={60} mood="sad" color="#D1D5DB" />
                      </div>
                      <p className="text-xs text-gray-500">Waiting...</p>
                    </>
                  )}
                </div>
              </div>

              {/* Player 2 */}
              <div className="nes-container bg-pink-50">
                <div className="text-center">
                  {opponent ? (
                    <>
                      <div className="nes-avatar is-rounded mb-2">
                        <Browser size={60} mood="excited" color="#FDB7DA" />
                      </div>
                      <p className="text-sm font-bold text-pink-900">{opponent.name}</p>
                      <p className="text-xs text-pink-600">Opponent</p>
                    </>
                  ) : (
                    <>
                      <div className="nes-avatar is-rounded mb-2">
                        <Browser size={60} mood="sad" color="#D1D5DB" />
                      </div>
                      <p className="text-xs text-gray-500">Waiting...</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Status Message */}
          <div className="text-center">
            {!isFull ? (
              <>
                <Browser size={120} mood="shocked" color="#FDB7DA" />
                <p className="text-sm animate-pulse mt-4">Waiting for opponent...</p>
                <p className="text-xs text-gray-600 mt-2">
                  {lobby.type === 'private' 
                    ? 'Share the lobby ID and PIN with your friend!' 
                    : 'Share the lobby ID with your friend!'
                  }
                </p>
              </>
            ) : (
              <>
                <Browser size={120} mood="excited" color="#22C55E" />
                <p className="text-sm font-bold text-green-600 mt-4">Ready to battle! 🔥</p>
                <p className="text-xs text-gray-600 mt-2">Both players are in the lobby</p>
              </>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mt-6">
            <button
              type="button"
              className="nes-btn text-xs"
              onClick={handleLeaveLobby}
              disabled={!connected}
            >
              Leave Lobby
            </button>
            
            {/* Demo start button - in real implementation, this would be automatic */}
            {isFull && (
              <button
                type="button"
                className="nes-btn is-primary text-xs"
                onClick={handleGameStart}
                disabled={!connected}
              >
                Start Game (Demo)
              </button>
            )}
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