// Shiba color options
export const SHIBA_COLORS = [
  { id: 'default', name: 'Classic Orange', filter: 'none' },
  { id: 'red', name: 'Crimson Red', filter: 'hue-rotate(340deg) saturate(1.2)' },
  { id: 'blue', name: 'Ocean Blue', filter: 'hue-rotate(210deg) saturate(1.3)' },
  { id: 'green', name: 'Forest Green', filter: 'hue-rotate(90deg) saturate(1.1)' },
  { id: 'purple', name: 'Royal Purple', filter: 'hue-rotate(270deg) saturate(1.4)' },
  { id: 'golden', name: 'Golden', filter: 'hue-rotate(30deg) saturate(1.8) brightness(1.3)' },
  { id: 'silver', name: 'Silver', filter: 'saturate(0) brightness(1.3)' },
  { id: 'pink', name: 'Sakura Pink', filter: 'hue-rotate(320deg) saturate(1.5) brightness(1.1)' },
  { id: 'cyan', name: 'Sky Cyan', filter: 'hue-rotate(180deg) saturate(1.4)' },
  { id: 'lime', name: 'Electric Lime', filter: 'hue-rotate(75deg) saturate(2) brightness(1.2)' },
  { id: 'magenta', name: 'Neon Magenta', filter: 'hue-rotate(300deg) saturate(2) brightness(1.1)' },
  { id: 'amber', name: 'Amber Gold', filter: 'hue-rotate(40deg) saturate(1.6) brightness(1.4)' }
]

// Get user's Shiba customization
export function getUserShibaStyle() {
  const savedCustomization = localStorage.getItem('shibaCustomization')
  
  if (savedCustomization) {
    const custom = JSON.parse(savedCustomization)
    const colorObj = SHIBA_COLORS.find(color => color.id === custom.color)
    return {
      filter: colorObj ? colorObj.filter : 'none'
    }
  }
  
  return { filter: 'none' }
}

// Get Shiba style for a specific color ID
export function getShibaStyleById(colorId) {
  const colorObj = SHIBA_COLORS.find(color => color.id === colorId)
  return {
    filter: colorObj ? colorObj.filter : 'none'
  }
}