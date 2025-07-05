import { useState } from 'react'
import { sounds } from '../utils/sounds'
import { useLobby } from '../hooks/useLobby.js'
import { dbFunctions } from '../lib/supabase'

function CreateLobbyForm({ onCreateRoom }) {
  const [playerName, setPlayerName] = useState('')
  const [lobbyName, setLobbyName] = useState('')
  const [eloRange, setEloRange] = useState('easy') // 🎯 New ELO range state for demo
  const [isPrivate, setIsPrivate] = useState(false)
  const [pin, setPin] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { createLobby, error, connected } = useLobby()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (playerName.trim() && lobbyName.trim() && (!isPrivate || pin.length === 4)) {
      setIsSubmitting(true)
      sounds.buttonClick()
      
      try {
        // First, ensure the user exists in Supabase
        let user = await dbFunctions.getUserByUsername(playerName.trim())
        
        if (!user) {
          // Create user if they don't exist
          console.log('Creating new user:', playerName.trim())
          user = await dbFunctions.createUser(playerName.trim())
        }
        
        // Create lobby in Supabase
        console.log('Creating lobby in Supabase:', {
          hostId: user.id,
          isPrivate,
          password: isPrivate ? pin : null
        })
        
        const supabaseLobby = await dbFunctions.createLobby(
          user.id,
          lobbyName.trim(),
          isPrivate,
          isPrivate ? pin : null
        )
        
        console.log('Lobby created in Supabase:', supabaseLobby)
        
        // Also create lobby via Socket.IO for real-time features
        createLobby({
          name: lobbyName.trim(),
          type: isPrivate ? 'private' : 'public',
          pin: isPrivate ? pin : undefined,
          playerName: playerName.trim(),
          supabaseId: supabaseLobby.id,
          eloRange: eloRange
        })
        
        // Store player name for future use
        localStorage.setItem('shibacoder_player_name', playerName.trim())
        
        // Call the original callback (for UI state management)
        onCreateRoom({
          playerName: playerName.trim(),
          lobbyName: lobbyName.trim(),
          isPrivate,
          pin: isPrivate ? pin : null,
          supabaseId: supabaseLobby.id
        })
        
      } catch (error) {
        console.error('Failed to create lobby:', error)
        // You might want to show an error message to the user here
        alert(`Failed to create lobby: ${error.message}`)
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex flex-col items-center mb-6">
        <img 
          src="/logo.svg" 
          alt="ShibaCoder Logo" 
          className="h-48 w-48 mb-4 float-animation"
          style={{ imageRendering: 'auto', objectFit: 'contain' }}
        />
        <p className="text-xs">Create your coding battle arena!</p>
      </div>

      {/* Connection Status */}
      {!connected && (
        <div className="nes-container is-error mb-4">
          <p className="text-xs">⚠️ Not connected to server</p>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="nes-container is-error mb-4">
          <p className="text-xs">❌ {error}</p>
        </div>
      )}
      
      <div className="nes-field">
        <label htmlFor="name_field" className="text-xs block">
          <span className="flex items-center">
            <i className="nes-icon user is-small" style={{ marginRight: '8px' }}></i>
            Your Name
          </span>
        </label>
        <input
          type="text"
          id="name_field"
          className="nes-input"
          placeholder="Enter your name..."
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          maxLength={12}
          required
          disabled={!connected}
        />
      </div>

      <div className="nes-field">
        <label htmlFor="lobby_name_field" className="text-xs block">
          Lobby Name
        </label>
        <input
          type="text"
          id="lobby_name_field"
          className="nes-input"
          placeholder="e.g. Epic Coders Arena"
          value={lobbyName}
          onChange={(e) => setLobbyName(e.target.value)}
          maxLength={25}
          required
          disabled={!connected}
        />
      </div>

      {/* 🎯 ELO Range Dropdown - Demo Feature for Judges */}
      <div className="nes-field">
        <label htmlFor="elo_range_field" className="text-xs block mb-2">
          <span className="flex items-center">
            <i className="nes-icon trophy is-small" style={{ marginRight: '8px' }}></i>
            Skill Level / ELO Range
          </span>
        </label>
        <div 
          className={`nes-select ${
            eloRange === 'easy' ? 'border-green-500' : 
            eloRange === 'medium' ? 'border-yellow-500' : 
            'border-red-500'
          }`}
          style={{
            backgroundColor: 
              eloRange === 'easy' ? '#f0fff4' : 
              eloRange === 'medium' ? '#fffbf0' : 
              '#fff5f5',
            borderWidth: '3px'
          }}
        >
          <select 
            id="elo_range_field"
            value={eloRange} 
            onChange={(e) => {
              sounds.buttonClick()
              setEloRange(e.target.value)
            }}
            disabled={!connected}
            className="text-sm font-bold"
            style={{
              color: 
                eloRange === 'easy' ? '#155724' : 
                eloRange === 'medium' ? '#856404' : 
                '#721c24'
            }}
          >
            <option value="easy">
              🟢 Easy League (Under 3,000 ELO)
            </option>
            <option value="medium">
              🟡 Medium League (3,000 - 5,000 ELO)
            </option>
            <option value="hard">
              🔴 Hard League (Above 5,000 ELO)
            </option>
          </select>
        </div>
        <div className={`text-xs mt-1 p-2 rounded ${
          eloRange === 'easy' ? 'bg-green-100 text-green-800' : 
          eloRange === 'medium' ? 'bg-yellow-100 text-yellow-800' : 
          'bg-red-100 text-red-800'
        }`}>
          {eloRange === 'easy' && '🌱 Beginner-friendly questions and challenges'}
          {eloRange === 'medium' && '⚡ Intermediate algorithms and data structures'}
          {eloRange === 'hard' && '🔥 Expert-level competitive programming'}
        </div>
      </div>

      <div className="nes-container is-rounded p-4 bg-amber-50">
        <label className="text-xs flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            className="nes-checkbox"
            checked={isPrivate}
            onChange={(e) => {
              sounds.buttonClick()
              setIsPrivate(e.target.checked)
              if (!e.target.checked) setPin('')
            }}
            disabled={!connected}
          />
          <span>Make this lobby private</span>
        </label>
        
        {isPrivate && (
          <div className="nes-field mt-4">
            <label htmlFor="pin_field" className="text-xs block">
              4-Digit PIN
            </label>
            <input
              type="text"
              id="pin_field"
              className="nes-input text-center"
              placeholder="0000"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
              maxLength={4}
              style={{ fontSize: '20px', letterSpacing: '12px', fontFamily: 'monospace' }}
              required={isPrivate}
              disabled={!connected}
            />
          </div>
        )}
      </div>

      <button
        type="submit"
        className={`nes-btn ${(playerName.trim() && lobbyName.trim() && (!isPrivate || pin.length === 4) && connected && !isSubmitting) ? 'is-primary' : 'is-disabled'} w-full pixel-shadow`}
        disabled={!playerName.trim() || !lobbyName.trim() || (isPrivate && pin.length !== 4) || !connected || isSubmitting}
      >
        {isSubmitting ? 'Creating...' : 'Create Lobby'}
      </button>
    </form>
  )
}

export default CreateLobbyForm