import { useState, useEffect } from 'react'
import Editor from '@monaco-editor/react'
import { Cat, Ghost } from 'react-kawaii'
import { sounds } from '../utils/sounds'
import { useLobby } from '../hooks/useLobby.js'

function GameRoom({ lobby, players, playerName }) {
  const [code, setCode] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const { 
    submitCode, 
    testResults, 
    gameFinished, 
    connected, 
    error,
    clearTestResults,
    clearGameFinished 
  } = useLobby()

  // Initialize code with problem template
  useEffect(() => {
    if (lobby?.problem?.template && !code) {
      setCode(lobby.problem.template)
    }
  }, [lobby?.problem?.template, code])

  // Get player progress data
  const currentPlayer = players.find(p => p.name === playerName)
  const opponent = players.find(p => p.name !== playerName)
  
  const playerProgress = currentPlayer?.tests_passed || 0
  const opponentProgress = opponent?.tests_passed || 0
  const totalTests = currentPlayer?.total_tests || 5

  // Handle test results
  useEffect(() => {
    if (testResults) {
      setIsSubmitting(false)
      if (testResults.completed) {
        sounds.gameWin()
      } else if (testResults.passed > 0) {
        sounds.testPass()
      }
      
      // Clear test results after showing them
      setTimeout(() => {
        clearTestResults()
      }, 3000)
    }
  }, [testResults, clearTestResults])

  // Handle game finished
  useEffect(() => {
    if (gameFinished) {
      if (gameFinished.winner === playerName) {
        sounds.gameWin()
      }
    }
  }, [gameFinished, playerName])

  const handleCodeChange = (value) => {
    setCode(value)
  }

  const handleSubmit = () => {
    if (!code.trim()) {
      return
    }
    
    sounds.buttonClick()
    setIsSubmitting(true)
    submitCode(code, 'python')
  }

  const playerMood = playerProgress === totalTests ? 'blissful' : playerProgress > 0 ? 'happy' : 'excited'
  const opponentMood = opponentProgress === totalTests ? 'blissful' : opponentProgress > 0 ? 'happy' : 'excited'
  
  // Use real problem data from lobby
  const problem = lobby?.problem || {
    title: "Loading...",
    description: "Loading problem...",
    examples: []
  }

  return (
    <div className="h-screen flex flex-col bg-shiba-bg">
      <header className="nes-container is-dark p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-xl flex items-center gap-2">
            <i className="nes-icon trophy is-small mr-2"></i>
            ShibaCoder
          </h1>
          <div className="nes-badge">
            <span className="is-warning text-xs">Lobby: {lobby?.name || 'Unknown'}</span>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-1/3 p-4 bg-white border-r-4 border-black overflow-y-auto">
          <div className="nes-container with-title is-rounded mb-4">
            <p className="title text-xs">{problem.title}</p>
            <p className="text-xs leading-relaxed">{problem.description}</p>
          </div>
          
          {problem.examples && problem.examples.length > 0 && (
            <div className="nes-container is-rounded mb-4">
              <p className="text-xs font-bold mb-2">Examples:</p>
              {problem.examples.map((example, index) => (
                <div key={index} className="mb-2">
                  <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                    {example.input}
                    {"\n"}
                    {example.output}
                    {example.explanation && "\n" + example.explanation}
                  </pre>
                </div>
              ))}
            </div>
          )}
          
          <div className="nes-container with-title is-rounded">
            <p className="title text-xs">Battle Status</p>
            
            <div className="space-y-4">
              {/* Player Progress */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Cat size={40} mood={playerMood} color="#B6F9C9" />
                    <span className="text-xs">{playerName} (You)</span>
                  </div>
                  <span className="text-xs">{playerProgress}/{totalTests}</span>
                </div>
                <progress 
                  className="nes-progress is-success" 
                  value={playerProgress} 
                  max={totalTests}
                ></progress>
              </div>

              {/* Opponent Progress */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Ghost size={40} mood={opponentMood} color="#FFB3E6" />
                    <span className="text-xs">{opponent?.name || 'Opponent'}</span>
                  </div>
                  <span className="text-xs">{opponentProgress}/{totalTests}</span>
                </div>
                <progress 
                  className="nes-progress is-error" 
                  value={opponentProgress} 
                  max={totalTests}
                ></progress>
              </div>
            </div>
          </div>

          {/* Test Results Display */}
          {testResults && (
            <div className={`nes-container ${testResults.completed ? 'is-success' : testResults.passed > 0 ? 'is-warning' : 'is-error'} mt-4`}>
              <p className="text-xs font-bold mb-2">
                {testResults.completed ? '🎉 All Tests Passed!' : `✅ ${testResults.passed}/${testResults.total} Tests Passed`}
              </p>
              <p className="text-xs">Runtime: {testResults.runtime}ms</p>
              {testResults.errors && testResults.errors.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs font-bold">Errors:</p>
                  {testResults.errors.map((error, index) => (
                    <p key={index} className="text-xs text-red-600">• {error}</p>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Game Finished Display */}
          {gameFinished && (
            <div className={`nes-container ${gameFinished.winner === playerName ? 'is-success' : 'is-error'} mt-4`}>
              <p className="text-xs font-bold mb-2">
                {gameFinished.winner === playerName ? '🏆 You Won!' : `😔 ${gameFinished.winner} Won!`}
              </p>
              <p className="text-xs">Game Duration: {Math.round(gameFinished.game_duration)}s</p>
            </div>
          )}
        </div>

        <div className="flex-1 flex flex-col bg-gray-900">
          <div className="flex-1 border-4 border-black">
            <Editor
              height="100%"
              defaultLanguage="python"
              value={code}
              onChange={handleCodeChange}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                fontFamily: "'Courier New', monospace",
                lineHeight: 20,
                padding: { top: 16 }
              }}
            />
          </div>
          
          <div className="p-4 bg-gray-800 border-t-4 border-black">
            {/* Connection/Error Status */}
            {!connected && (
              <div className="nes-container is-error mb-4">
                <p className="text-xs">⚠️ Disconnected from server</p>
              </div>
            )}
            
            {error && (
              <div className="nes-container is-error mb-4">
                <p className="text-xs">❌ {error}</p>
              </div>
            )}

            {gameFinished ? (
              <button
                type="button"
                className="nes-btn is-disabled w-full"
                disabled
              >
                Game Finished
              </button>
            ) : (
              <button
                type="button"
                className={`nes-btn ${isSubmitting || !connected ? 'is-disabled' : 'is-success'} w-full`}
                onClick={handleSubmit}
                disabled={isSubmitting || !connected || !code.trim()}
              >
                {isSubmitting ? 'Running Tests...' : 'Submit Solution'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default GameRoom