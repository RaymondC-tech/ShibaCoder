// WebSocket configuration
const config = {
  // Change this to your Railway backend URL after deployment
  BACKEND_URL: 'localhost:8000',
  
  // Automatically detect if we're in production
  get WS_URL() {
    const isProduction = window.location.hostname !== 'localhost'
    const protocol = isProduction ? 'wss' : 'ws'
    const host = isProduction ? 'your-app-abc123.railway.app' : this.BACKEND_URL
    return `${protocol}://${host}/ws`
  }
}

export default config 