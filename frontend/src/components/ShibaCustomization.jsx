import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import './ShibaCustomization.css'

// Simple customization options using CSS filters and overlays
const SHIBA_COLORS = [
  { id: 'default', name: 'Classic Orange', filter: 'none', unlockAt: 0 },
  { id: 'red', name: 'Crimson Shiba', filter: 'hue-rotate(340deg) saturate(1.2)', unlockAt: 1 },
  { id: 'blue', name: 'Azure Shiba', filter: 'hue-rotate(210deg) saturate(1.3)', unlockAt: 3 },
  { id: 'green', name: 'Forest Shiba', filter: 'hue-rotate(90deg) saturate(1.1)', unlockAt: 5 },
  { id: 'purple', name: 'Royal Shiba', filter: 'hue-rotate(270deg) saturate(1.4)', unlockAt: 8 },
  { id: 'golden', name: 'Golden Shiba', filter: 'hue-rotate(45deg) saturate(1.5) brightness(1.2)', unlockAt: 10 },
  { id: 'silver', name: 'Silver Shiba', filter: 'saturate(0) brightness(1.3)', unlockAt: 15 },
  { id: 'rainbow', name: 'Rainbow Shiba', filter: 'hue-rotate(180deg) saturate(2)', unlockAt: 20 }
]

const ACCESSORIES = [
  { id: 'none', name: 'No Hat', emoji: '', unlockAt: 0 },
  { id: 'crown', name: 'Crown', emoji: '👑', unlockAt: 2 },
  { id: 'cap', name: 'Cap', emoji: '🧢', unlockAt: 4 },
  { id: 'wizard', name: 'Wizard Hat', emoji: '🧙‍♂️', unlockAt: 7 },
  { id: 'party', name: 'Party Hat', emoji: '🎉', unlockAt: 6 },
  { id: 'ninja', name: 'Ninja Mask', emoji: '🥷', unlockAt: 12 },
  { id: 'cool', name: 'Sunglasses', emoji: '😎', unlockAt: 9 },
  { id: 'christmas', name: 'Santa Hat', emoji: '🎅', unlockAt: 25 }
]

const BACKGROUNDS = [
  { id: 'default', name: 'Classic Sky', color: '#EBC697', unlockAt: 0 },
  { id: 'sunset', name: 'Sunset Glow', color: 'linear-gradient(135deg, #ff6b6b, #ffa500, #ffeb3b)', unlockAt: 3 },
  { id: 'ocean', name: 'Ocean Blue', color: 'linear-gradient(135deg, #74b9ff, #0984e3)', unlockAt: 6 },
  { id: 'forest', name: 'Forest Green', color: 'linear-gradient(135deg, #55a3ff, #00b894)', unlockAt: 10 },
  { id: 'galaxy', name: 'Galaxy', color: 'linear-gradient(135deg, #667eea, #764ba2, #f093fb)', unlockAt: 15 },
  { id: 'neon', name: 'Neon City', color: 'linear-gradient(135deg, #ff0844, #ffb199)', unlockAt: 20 }
]

function ShibaCustomization() {
  const [selectedColor, setSelectedColor] = useState('default')
  const [selectedAccessory, setSelectedAccessory] = useState('none')
  const [selectedBackground, setSelectedBackground] = useState('default')
  const [playerWins, setPlayerWins] = useState(0)

  // Load customization and wins from localStorage
  useEffect(() => {
    const savedCustomization = localStorage.getItem('shibaCustomization')
    const savedWins = localStorage.getItem('playerWins')
    
    if (savedCustomization) {
      const custom = JSON.parse(savedCustomization)
      setSelectedColor(custom.color || 'default')
      setSelectedAccessory(custom.accessory || 'none')
      setSelectedBackground(custom.background || 'default')
    }
    
    if (savedWins) {
      setPlayerWins(parseInt(savedWins) || 0)
    }
  }, [])

  // Save customization to localStorage
  const saveCustomization = () => {
    const customization = {
      color: selectedColor,
      accessory: selectedAccessory,
      background: selectedBackground
    }
    localStorage.setItem('shibaCustomization', JSON.stringify(customization))
    
    // Show success message
    const successMsg = document.querySelector('.save-success')
    if (successMsg) {
      successMsg.style.display = 'block'
      setTimeout(() => {
        successMsg.style.display = 'none'
      }, 2000)
    }
  }

  const isUnlocked = (item) => playerWins >= item.unlockAt

  const getPreviewStyle = () => {
    const selectedBg = BACKGROUNDS.find(bg => bg.id === selectedBackground)
    return {
      background: selectedBg ? selectedBg.color : '#EBC697'
    }
  }

  const getShibaStyle = () => {
    const selectedColorObj = SHIBA_COLORS.find(color => color.id === selectedColor)
    return {
      filter: selectedColorObj ? selectedColorObj.filter : 'none'
    }
  }

  const getAccessoryEmoji = () => {
    const selectedAcc = ACCESSORIES.find(acc => acc.id === selectedAccessory)
    return selectedAcc ? selectedAcc.emoji : ''
  }

  return (
    <div className="min-h-screen flex flex-col relative" style={getPreviewStyle()}>
      <div className="customization-page">
        {/* Header */}
        <div className="flex justify-between items-center p-4">
          <Link to="/" className="nes-btn">
            ← Back to Home
          </Link>
          <h1 className="text-xl font-bold text-white text-shadow">
            🎨 Fashionable Shiba Collection
          </h1>
          <div className="nes-badge is-success">
            <span className="is-success">Wins: {playerWins}</span>
          </div>
        </div>

        {/* Preview Section */}
        <div className="preview-section nes-container with-title is-centered bg-white max-w-md mx-auto mb-6">
          <p className="title">Your Shiba</p>
          <div className="shiba-preview">
            <div className="accessory-layer">
              {getAccessoryEmoji() && (
                <span className="accessory-emoji">{getAccessoryEmoji()}</span>
              )}
            </div>
            <img 
              src="/shibaface.svg" 
              alt="Customized Shiba" 
              className="shiba-avatar"
              style={getShibaStyle()}
            />
          </div>
          <button className="nes-btn is-primary mt-4" onClick={saveCustomization}>
            💾 Save Look
          </button>
          <div className="save-success" style={{ display: 'none' }}>
            <p className="text-green-600 text-sm mt-2">✅ Saved successfully!</p>
          </div>
        </div>

        {/* Customization Options */}
        <div className="customization-grid">
          {/* Colors */}
          <div className="nes-container with-title">
            <p className="title">🎨 Shiba Colors</p>
            <div className="options-grid">
              {SHIBA_COLORS.map(color => (
                <div 
                  key={color.id}
                  className={`option-card ${selectedColor === color.id ? 'selected' : ''} ${!isUnlocked(color) ? 'locked' : ''}`}
                  onClick={() => isUnlocked(color) && setSelectedColor(color.id)}
                >
                  <div className="option-preview">
                    <img 
                      src="/shibaface.svg" 
                      alt={color.name}
                      style={{ filter: color.filter, width: '40px', height: '40px' }}
                    />
                  </div>
                  <div className="option-info">
                    <span className="option-name">{color.name}</span>
                    {!isUnlocked(color) && (
                      <span className="unlock-requirement">
                        🔒 {color.unlockAt} wins
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Accessories */}
          <div className="nes-container with-title">
            <p className="title">👑 Accessories</p>
            <div className="options-grid">
              {ACCESSORIES.map(accessory => (
                <div 
                  key={accessory.id}
                  className={`option-card ${selectedAccessory === accessory.id ? 'selected' : ''} ${!isUnlocked(accessory) ? 'locked' : ''}`}
                  onClick={() => isUnlocked(accessory) && setSelectedAccessory(accessory.id)}
                >
                  <div className="option-preview">
                    <span className="accessory-preview">
                      {accessory.emoji || '❌'}
                    </span>
                  </div>
                  <div className="option-info">
                    <span className="option-name">{accessory.name}</span>
                    {!isUnlocked(accessory) && (
                      <span className="unlock-requirement">
                        🔒 {accessory.unlockAt} wins
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Backgrounds */}
          <div className="nes-container with-title">
            <p className="title">🌅 Backgrounds</p>
            <div className="options-grid">
              {BACKGROUNDS.map(background => (
                <div 
                  key={background.id}
                  className={`option-card ${selectedBackground === background.id ? 'selected' : ''} ${!isUnlocked(background) ? 'locked' : ''}`}
                  onClick={() => isUnlocked(background) && setSelectedBackground(background.id)}
                >
                  <div className="option-preview">
                    <div 
                      className="background-preview"
                      style={{ background: background.color }}
                    ></div>
                  </div>
                  <div className="option-info">
                    <span className="option-name">{background.name}</span>
                    {!isUnlocked(background) && (
                      <span className="unlock-requirement">
                        🔒 {background.unlockAt} wins
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className="nes-container is-rounded mt-6 max-w-2xl mx-auto">
          <h4>💡 How to Unlock</h4>
          <p className="text-sm">Win coding battles to unlock new colors, accessories, and backgrounds!</p>
          <p className="text-sm mt-2">
            • Beat opponents in multiplayer matches to increase your win count<br/>
            • Each victory unlocks more customization options<br/>
            • Show off your unique Shiba style in battles!
          </p>
        </div>
      </div>
    </div>
  )
}

export default ShibaCustomization