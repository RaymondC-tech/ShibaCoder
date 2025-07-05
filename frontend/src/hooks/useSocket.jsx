import { createContext, useContext, useEffect, useState } from 'react'
import { io } from 'socket.io-client'

const SocketContext = createContext()

export const useSocket = () => {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider')
  }
  return context
}

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null)
  const [connected, setConnected] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Create socket connection
    const newSocket = io('http://localhost:8000', {
      transports: ['websocket', 'polling'],
      timeout: 10000,
    })

    // Connection event handlers
    newSocket.on('connect', () => {
      console.log('Connected to Socket.IO server:', newSocket.id)
      setConnected(true)
      setError(null)
    })

    newSocket.on('disconnect', (reason) => {
      console.log('Disconnected from Socket.IO server:', reason)
      setConnected(false)
    })

    newSocket.on('connect_error', (err) => {
      console.error('Socket.IO connection error:', err)
      setError(err.message)
      setConnected(false)
    })

    newSocket.on('error', (err) => {
      console.error('Socket.IO error:', err)
      setError(err.message)
    })

    setSocket(newSocket)

    // Cleanup on unmount
    return () => {
      console.log('Cleaning up socket connection')
      newSocket.close()
    }
  }, [])

  const value = {
    socket,
    connected,
    error,
  }

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  )
}