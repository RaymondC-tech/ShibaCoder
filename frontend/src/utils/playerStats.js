// Player statistics and customization utilities

export const getPlayerStats = () => {
  const wins = localStorage.getItem('playerWins') || '0'
  const losses = localStorage.getItem('playerLosses') || '0'
  const gamesPlayed = localStorage.getItem('gamesPlayed') || '0'
  
  return {
    wins: parseInt(wins),
    losses: parseInt(losses),
    gamesPlayed: parseInt(gamesPlayed),
    winRate: parseInt(gamesPlayed) > 0 ? Math.round((parseInt(wins) / parseInt(gamesPlayed)) * 100) : 0
  }
}

export const incrementWins = () => {
  const currentWins = parseInt(localStorage.getItem('playerWins') || '0')
  const currentGames = parseInt(localStorage.getItem('gamesPlayed') || '0')
  
  localStorage.setItem('playerWins', (currentWins + 1).toString())
  localStorage.setItem('gamesPlayed', (currentGames + 1).toString())
  
  console.log(`🏆 Player wins increased to: ${currentWins + 1}`)
  return currentWins + 1
}

export const incrementLosses = () => {
  const currentLosses = parseInt(localStorage.getItem('playerLosses') || '0')
  const currentGames = parseInt(localStorage.getItem('gamesPlayed') || '0')
  
  localStorage.setItem('playerLosses', (currentLosses + 1).toString())
  localStorage.setItem('gamesPlayed', (currentGames + 1).toString())
  
  console.log(`😢 Player losses increased to: ${currentLosses + 1}`)
  return currentLosses + 1
}

export const getShibaCustomization = () => {
  const customization = localStorage.getItem('shibaCustomization')
  if (customization) {
    return JSON.parse(customization)
  }
  return {
    color: 'default'
  }
}

export const applyShibaCustomization = (element) => {
  const customization = getShibaCustomization()
  
  // Apply color filter
  if (customization.color && customization.color !== 'default') {
    const colorMap = {
      'red': 'hue-rotate(340deg) saturate(1.2)',
      'blue': 'hue-rotate(210deg) saturate(1.3)',
      'green': 'hue-rotate(90deg) saturate(1.1)',
      'purple': 'hue-rotate(270deg) saturate(1.4)',
      'golden': 'hue-rotate(30deg) saturate(1.8) brightness(1.3)',
      'silver': 'saturate(0) brightness(1.3)',
      'pink': 'hue-rotate(320deg) saturate(1.5) brightness(1.1)',
      'cyan': 'hue-rotate(180deg) saturate(1.4)',
      'lime': 'hue-rotate(75deg) saturate(2) brightness(1.2)',
      'magenta': 'hue-rotate(300deg) saturate(2) brightness(1.1)',
      'amber': 'hue-rotate(40deg) saturate(1.6) brightness(1.4)'
    }
    
    if (colorMap[customization.color]) {
      element.style.filter = colorMap[customization.color]
    }
  }
  
  return customization
}