import { useState, useEffect, useCallback } from 'react'
import { useSocket } from './useSocket'

export const useLobby = () => {
  const { socket, connected } = useSocket()
  const [lobbies, setLobbies] = useState([])
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalLobbies: 0,
    perPage: 4
  })
  const [currentLobby, setCurrentLobby] = useState(null)
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Socket event handlers
  useEffect(() => {
    if (!socket) return

    // Lobby list response
    socket.on('lobby_list', (data) => {
      console.log('Received lobby list:', data)
      setLobbies(data.lobbies)
      setPagination(data.pagination)
      setLoading(false)
      setError(null)
    })

    // Lobby created response
    socket.on('lobby_created', (data) => {
      console.log('Lobby created:', data)
      setCurrentLobby(data.lobbyData)
      setPlayers(data.lobbyData.players)
      setError(null)
    })

    // Lobby joined response
    socket.on('lobby_joined', (data) => {
      console.log('Joined lobby:', data)
      setCurrentLobby(data.lobbyData)
      setPlayers(data.lobbyData.players)
      setError(null)
    })

    // Player joined/left updates
    socket.on('player_joined', (data) => {
      console.log('Player joined:', data)
      setPlayers(data.players)
      // Update current lobby player count
      if (currentLobby) {
        setCurrentLobby(prev => ({
          ...prev,
          players: data.players
        }))
      }
    })

    socket.on('player_left', (data) => {
      console.log('Player left:', data)
      setPlayers(data.players)
      // Update current lobby player count
      if (currentLobby) {
        setCurrentLobby(prev => ({
          ...prev,
          players: data.players
        }))
      }
    })

    // Lobby left response
    socket.on('lobby_left', (data) => {
      console.log('Left lobby:', data)
      setCurrentLobby(null)
      setPlayers([])
      setError(null)
    })

    // Error handling
    socket.on('error', (data) => {
      console.error('Socket error:', data)
      setError(data.message)
      setLoading(false)
    })

    // Cleanup listeners
    return () => {
      socket.off('lobby_list')
      socket.off('lobby_created')
      socket.off('lobby_joined')
      socket.off('player_joined')
      socket.off('player_left')
      socket.off('lobby_left')
      socket.off('error')
    }
  }, [socket, currentLobby])

  // Actions
  const getLobbyList = useCallback((page = 1, search = '') => {
    if (!socket || !connected) {
      setError('Not connected to server')
      return
    }

    setLoading(true)
    setError(null)
    
    console.log('Requesting lobby list:', { page, search })
    socket.emit('get_lobby_list', { page, search })
  }, [socket, connected])

  const createLobby = useCallback((lobbyData) => {
    if (!socket || !connected) {
      setError('Not connected to server')
      return
    }

    setError(null)
    
    console.log('Creating lobby:', lobbyData)
    socket.emit('create_lobby', lobbyData)
  }, [socket, connected])

  const joinLobby = useCallback((lobbyId, pin = null) => {
    if (!socket || !connected) {
      setError('Not connected to server')
      return
    }

    setError(null)
    
    const joinData = { lobbyId }
    if (pin) joinData.pin = pin
    
    console.log('Joining lobby:', joinData)
    socket.emit('join_lobby', joinData)
  }, [socket, connected])

  const leaveLobby = useCallback(() => {
    if (!socket || !connected) {
      setError('Not connected to server')
      return
    }

    setError(null)
    
    console.log('Leaving lobby')
    socket.emit('leave_lobby')
  }, [socket, connected])

  return {
    // State
    lobbies,
    pagination,
    currentLobby,
    players,
    loading,
    error,
    connected,

    // Actions
    getLobbyList,
    createLobby,
    joinLobby,
    leaveLobby,

    // Utilities
    clearError: () => setError(null),
  }
}