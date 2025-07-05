import { createContext, useContext, useEffect, useState, useRef } from 'react'

const WebSocketContext = createContext()

export const useWebSocket = () => {
  const context = useContext(WebSocketContext)
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider')
  }
  return context
}

export const WebSocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null)
  const [connected, setConnected] = useState(false)
  const [error, setError] = useState(null)
  const eventHandlers = useRef({})

  useEffect(() => {
    // Create WebSocket connection
    const ws = new WebSocket('ws://localhost:8000/ws')

    // Connection event handlers
    ws.onopen = () => {
      console.log('Connected to WebSocket server')
      setConnected(true)
      setError(null)
      setSocket(ws)
    }

    ws.onclose = (event) => {
      console.log('Disconnected from WebSocket server:', event.reason)
      setConnected(false)
      setSocket(null)
    }

    ws.onerror = (err) => {
      console.error('WebSocket error:', err)
      setError('Connection error')
      setConnected(false)
    }

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data)
        const { event: eventName, data } = message
        
        // Call registered event handlers
        if (eventHandlers.current[eventName]) {
          eventHandlers.current[eventName].forEach(handler => handler(data))
        }
      } catch (err) {
        console.error('Failed to parse WebSocket message:', err)
      }
    }

    // Cleanup on unmount
    return () => {
      console.log('Cleaning up WebSocket connection')
      ws.close()
    }
  }, [])

  const emit = (event, data) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ event, data }))
    } else {
      console.warn('WebSocket not connected, cannot send event:', event)
    }
  }

  const on = (event, handler) => {
    if (!eventHandlers.current[event]) {
      eventHandlers.current[event] = []
    }
    eventHandlers.current[event].push(handler)
  }

  const off = (event, handler) => {
    if (eventHandlers.current[event]) {
      if (handler) {
        eventHandlers.current[event] = eventHandlers.current[event].filter(h => h !== handler)
      } else {
        delete eventHandlers.current[event]
      }
    }
  }

  const value = {
    socket,
    connected,
    error,
    emit,
    on,
    off,
  }

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  )
}