import { useState, useEffect, useCallback } from 'react'
import { useWebSocket } from './useWebSocket.jsx'

export const useLobby = () => {
  const { socket, connected, emit, on, off } = useWebSocket()
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
  const [testResults, setTestResults] = useState(null)
  const [gameFinished, setGameFinished] = useState(null)
  const [currentPlayerName, setCurrentPlayerName] = useState(null)

  // Socket event handlers
  useEffect(() => {
    if (!connected) return

    // Lobby list response
    const handleLobbyList = (data) => {
      console.log('Received lobby list:', data)
      setLobbies(data.lobbies)
      setPagination(data.pagination)
      setLoading(false)
      setError(null)
    }

    // Lobby created response
    const handleLobbyCreated = (data) => {
      console.log('Lobby created:', data)
      setCurrentLobby(data.lobbyData)
      setPlayers(data.lobbyData.players)
      // Set current player name (creator is always the first player)
      if (data.lobbyData.players.length > 0) {
        setCurrentPlayerName(data.lobbyData.players[0].name)
      }
      setError(null)
    }

    // Lobby joined response
    const handleLobbyJoined = (data) => {
      console.log('Joined lobby:', data)
      setCurrentLobby(data.lobbyData)
      setPlayers(data.lobbyData.players)
      // Set current player name (joiner is always the last player)
      if (data.lobbyData.players.length > 0) {
        const lastPlayer = data.lobbyData.players[data.lobbyData.players.length - 1]
        setCurrentPlayerName(lastPlayer.name)
      }
      setError(null)
    }

    // Player joined/left updates
    const handlePlayerJoined = (data) => {
      console.log('Player joined:', data)
      setPlayers(data.players)
      // Update current lobby player count
      if (currentLobby) {
        setCurrentLobby(prev => ({
          ...prev,
          players: data.players
        }))
      }
    }

    const handlePlayerLeft = (data) => {
      console.log('Player left:', data)
      setPlayers(data.players)
      // Update current lobby player count
      if (currentLobby) {
        setCurrentLobby(prev => ({
          ...prev,
          players: data.players
        }))
      }
    }

    // Lobby left response
    const handleLobbyLeft = (data) => {
      console.log('Left lobby:', data)
      setCurrentLobby(null)
      setPlayers([])
      setCurrentPlayerName(null)
      setError(null)
    }

    // Player ready updates
    const handlePlayerReadyUpdate = (data) => {
      console.log('Player ready update:', data)
      setPlayers(data.players)
      // Update current lobby with latest player ready states
      if (currentLobby) {
        setCurrentLobby(prev => ({
          ...prev,
          players: data.players
        }))
      }
    }

    // Game start event
    const handleGameStart = (data) => {
      console.log('Game started:', data)
      if (currentLobby) {
        setCurrentLobby(prev => ({
          ...prev,
          status: 'playing',
          problem: data.problem,
          timeLimit: data.timeLimit
        }))
      }
      setError(null)
    }

    // Test results
    const handleTestResults = (data) => {
      console.log('Test results received:', data)
      setTestResults(data)
      setError(null)
    }

    // Progress updates
    const handleProgressUpdate = (data) => {
      console.log('Progress update:', data)
      // Update players with progress info
      setPlayers(data.players)
    }

    // Game finished
    const handleGameFinished = (data) => {
      console.log('Game finished:', data)
      setGameFinished(data)
      if (currentLobby) {
        setCurrentLobby(prev => ({
          ...prev,
          status: 'finished',
          winner: data.winner,
          final_scores: data.final_scores
        }))
      }
      setError(null)
    }

    // Real-time lobby list updates
    const handleLobbyListUpdate = (data) => {
      console.log('Received real-time lobby list update:', data)
      setLobbies(data.lobbies)
      setPagination(data.pagination)
    }

    // Error handling
    const handleError = (data) => {
      console.error('WebSocket error:', data)
      setError(data.message)
      setLoading(false)
    }

    // Register event handlers
    on('lobby_list', handleLobbyList)
    on('lobby_created', handleLobbyCreated)
    on('lobby_joined', handleLobbyJoined)
    on('player_joined', handlePlayerJoined)
    on('player_left', handlePlayerLeft)
    on('lobby_left', handleLobbyLeft)
    on('player_ready_update', handlePlayerReadyUpdate)
    on('game_start', handleGameStart)
    on('test_results', handleTestResults)
    on('progress_update', handleProgressUpdate)
    on('game_finished', handleGameFinished)
    on('lobby_list_update', handleLobbyListUpdate)
    on('error', handleError)

    // Cleanup listeners
    return () => {
      off('lobby_list', handleLobbyList)
      off('lobby_created', handleLobbyCreated)
      off('lobby_joined', handleLobbyJoined)
      off('player_joined', handlePlayerJoined)
      off('player_left', handlePlayerLeft)
      off('lobby_left', handleLobbyLeft)
      off('player_ready_update', handlePlayerReadyUpdate)
      off('game_start', handleGameStart)
      off('test_results', handleTestResults)
      off('progress_update', handleProgressUpdate)
      off('game_finished', handleGameFinished)
      off('lobby_list_update', handleLobbyListUpdate)
      off('error', handleError)
    }
  }, [connected, currentLobby, on, off])

  // Actions
  const getLobbyList = useCallback((page = 1, search = '') => {
    if (!connected) {
      setError('Not connected to server')
      return
    }

    setLoading(true)
    setError(null)
    
    console.log('Requesting lobby list:', { page, search })
    emit('get_lobby_list', { page, search })
  }, [connected, emit])

  const createLobby = useCallback((lobbyData) => {
    if (!connected) {
      setError('Not connected to server')
      return
    }

    setError(null)
    
    console.log('Creating lobby:', lobbyData)
    emit('create_lobby', lobbyData)
  }, [connected, emit])

  const joinLobby = useCallback((lobbyId, pin = null, playerName = null) => {
    if (!connected) {
      setError('Not connected to server')
      return
    }

    setError(null)
    
    const joinData = { lobbyId }
    if (pin) joinData.pin = pin
    if (playerName) joinData.playerName = playerName
    
    console.log('Joining lobby:', joinData)
    emit('join_lobby', joinData)
  }, [connected, emit])

  const leaveLobby = useCallback(() => {
    if (!connected) {
      setError('Not connected to server')
      return
    }

    setError(null)
    
    console.log('Leaving lobby')
    emit('leave_lobby', {})
  }, [connected, emit])

  const playerReady = useCallback(() => {
    if (!connected) {
      setError('Not connected to server')
      return
    }

    setError(null)
    
    console.log('Player ready')
    emit('player_ready', {})
  }, [connected, emit])

  const submitCode = useCallback((code, language = 'python') => {
    if (!connected) {
      setError('Not connected to server')
      return
    }

    if (!code.trim()) {
      setError('Code cannot be empty')
      return
    }

    setError(null)
    
    console.log('Submitting code:', { code: code.substring(0, 50) + '...', language })
    emit('submit_code', { code, language })
  }, [connected, emit])

  return {
    // State
    lobbies,
    pagination,
    currentLobby,
    players,
    loading,
    error,
    connected,
    testResults,
    gameFinished,
    currentPlayerName,

    // Actions
    getLobbyList,
    createLobby,
    joinLobby,
    leaveLobby,
    playerReady,
    submitCode,

    // Utilities
    clearError: () => setError(null),
    clearTestResults: () => setTestResults(null),
    clearGameFinished: () => setGameFinished(null),
  }
}