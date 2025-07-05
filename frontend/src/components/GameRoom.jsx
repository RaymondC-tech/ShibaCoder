import { useState } from 'react'
import Editor from '@monaco-editor/react'
import { Cat, Ghost } from 'react-kawaii'
import { sounds } from '../utils/sounds'

function GameRoom({ playerName, roomCode }) {
  const [code, setCode] = useState('def two_sum(nums, target):\n    # Start coding here...\n    pass')
  const [opponentProgress, setOpponentProgress] = useState(0)
  const [playerProgress, setPlayerProgress] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const problem = {
    title: "Two Sum",
    description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
    example: "Input: nums = [2,7,11,15], target = 9\nOutput: [0,1]\nExplanation: Because nums[0] + nums[1] == 9, we return [0, 1].",
    testCases: 3
  }

  const handleCodeChange = (value) => {
    setCode(value)
  }

  const handleSubmit = () => {
    sounds.buttonClick()
    setIsSubmitting(true)
    setTimeout(() => {
      const newProgress = Math.min(playerProgress + 1, problem.testCases)
      setPlayerProgress(newProgress)
      
      if (newProgress < problem.testCases) {
        sounds.testPass()
      } else {
        sounds.gameWin()
      }
      
      setIsSubmitting(false)
    }, 1000)
  }

  const playerMood = playerProgress === problem.testCases ? 'blissful' : playerProgress > 0 ? 'happy' : 'excited'
  const opponentMood = opponentProgress === problem.testCases ? 'blissful' : opponentProgress > 0 ? 'happy' : 'excited'

  return (
    <div className="h-screen flex flex-col bg-shiba-bg">
      <header className="nes-container is-dark p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-xl flex items-center gap-2">
            <i className="nes-icon trophy is-small mr-2"></i>
            ShibaCoder
          </h1>
          <div className="nes-badge">
            <span className="is-warning text-xs">Room: {roomCode}</span>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-1/3 p-4 bg-white border-r-4 border-black overflow-y-auto">
          <div className="nes-container with-title is-rounded mb-4">
            <p className="title text-xs">{problem.title}</p>
            <p className="text-xs leading-relaxed">{problem.description}</p>
          </div>
          
          <div className="nes-container is-rounded mb-4">
            <p className="text-xs font-bold mb-2">Example:</p>
            <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">{problem.example}</pre>
          </div>
          
          <div className="nes-container with-title is-rounded">
            <p className="title text-xs">Battle Status</p>
            
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Cat size={40} mood={playerMood} color="#B6F9C9" />
                    <span className="text-xs">{playerName}</span>
                  </div>
                  <span className="text-xs">{playerProgress}/{problem.testCases}</span>
                </div>
                <progress 
                  className="nes-progress is-success" 
                  value={playerProgress} 
                  max={problem.testCases}
                ></progress>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Ghost size={40} mood={opponentMood} color="#C1E6F9" />
                    <span className="text-xs">Opponent</span>
                  </div>
                  <span className="text-xs">{opponentProgress}/{problem.testCases}</span>
                </div>
                <progress 
                  className="nes-progress is-error" 
                  value={opponentProgress} 
                  max={problem.testCases}
                ></progress>
              </div>
            </div>
          </div>
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
            <button
              type="button"
              className={`nes-btn ${isSubmitting ? 'is-disabled' : 'is-success'} w-full`}
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Running Tests...' : 'Submit Solution'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GameRoom