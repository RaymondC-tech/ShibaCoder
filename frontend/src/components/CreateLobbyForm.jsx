import { useState } from 'react'
import { sounds } from '../utils/sounds'

function CreateLobbyForm({ onCreateRoom }) {
  const [name, setName] = useState('')
  const [lobbyName, setLobbyName] = useState('')
  const [isPrivate, setIsPrivate] = useState(false)
  const [pin, setPin] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (name.trim() && lobbyName.trim() && (!isPrivate || pin.length === 4)) {
      sounds.buttonClick()
      const roomCode = Math.floor(1000 + Math.random() * 9000).toString()
      onCreateRoom({
        name,
        lobbyName,
        roomCode,
        isPrivate,
        pin: isPrivate ? pin : null
      })
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
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={12}
          required
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
        />
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
            />
          </div>
        )}
      </div>

      <button
        type="submit"
        className={`nes-btn ${(name.trim() && lobbyName.trim() && (!isPrivate || pin.length === 4)) ? 'is-primary' : 'is-disabled'} w-full pixel-shadow`}
        disabled={!name.trim() || !lobbyName.trim() || (isPrivate && pin.length !== 4)}
      >
        Create Lobby
      </button>
    </form>
  )
}

export default CreateLobbyForm