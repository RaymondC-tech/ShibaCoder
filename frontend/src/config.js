// Configuration for different environments
const config = {
  development: {
    wsUrl: 'wss://shibacoder-production.up.railway.app/ws',
    apiUrl: 'https://shibacoder-production.up.railway.app'
  },
  production: {
    wsUrl: 'wss://shibacoder-production.up.railway.app/ws',
    apiUrl: 'https://shibacoder-production.up.railway.app'
  }
}

// Auto-detect environment based on hostname
const isProduction = window.location.hostname !== 'localhost'
const env = isProduction ? 'production' : 'development'

export default config[env]
