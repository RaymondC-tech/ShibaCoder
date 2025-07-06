import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Navbar from './Navbar'
import { SHIBA_COLORS } from '../utils/shibaCustomization'
import './ShibaCustomization.css'

function ShibaCustomization() {
  const [selectedColor, setSelectedColor] = useState('default')

  // Load customization from localStorage
  useEffect(() => {
    const savedCustomization = localStorage.getItem('shibaCustomization')
    
    if (savedCustomization) {
      const custom = JSON.parse(savedCustomization)
      setSelectedColor(custom.color || 'default')
    }
  }, [])

  // Save customization to localStorage
  const saveCustomization = () => {
    const customization = {
      color: selectedColor
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

  const getShibaStyle = () => {
    const selectedColorObj = SHIBA_COLORS.find(color => color.id === selectedColor)
    return {
      filter: selectedColorObj ? selectedColorObj.filter : 'none'
    }
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#EBC697' }}>
      <Navbar />
      <div className="customization-page">
        {/* Preview Section - Centered */}
        <div className="preview-section">
          <div className="nes-container with-title is-centered bg-white">
            <p className="title">Your Shiba</p>
            <div className="shiba-preview">
              <img 
                src="/shibaface.svg" 
                alt="Customized Shiba" 
                className="shiba-avatar"
                style={getShibaStyle()}
              />
            </div>
            <button className="nes-btn is-primary save-btn" onClick={saveCustomization}>
              💾 Save Look
            </button>
            <div className="save-success" style={{ display: 'none' }}>
              <p className="success-text">✅ Saved successfully!</p>
            </div>
          </div>
        </div>

        {/* Colors Section */}
        <div className="colors-section">
          <div className="nes-container with-title" style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <p className="title">🎨 Shiba Colors</p>
            <div className="colors-grid">
              {SHIBA_COLORS.map(color => (
                <div 
                  key={color.id}
                  className={`color-card ${selectedColor === color.id ? 'selected' : ''}`}
                  onClick={() => setSelectedColor(color.id)}
                >
                  <div className="color-preview">
                    <img 
                      src="/shibaface.svg" 
                      alt={color.name}
                      style={{ 
                        filter: color.filter, 
                        width: '50px', 
                        height: '50px'
                      }}
                    />
                  </div>
                  <span className="color-name">{color.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Back to Home Button at Bottom */}
        <div className="back-button-section">
          <Link to="/" className="nes-btn">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}

export default ShibaCustomization