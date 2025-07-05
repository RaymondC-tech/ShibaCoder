import { useState, useEffect } from 'react'
import { sounds } from '../utils/sounds'

function AttackQuestions({ playerName, onSendAttack, gameFinished }) {
  // The 5 progressive questions
  const questions = [
    { id: 1, question: "What language are we coding in?", answer: "python", difficulty: "Easy" },
    { id: 2, question: "What data structure uses LIFO?", answer: "stack", difficulty: "Medium" },
    { id: 3, question: "What's the Big O of binary search?", answer: "logn", difficulty: "Medium" },
    { id: 4, question: "What sorting algorithm is O(n²) worst case?", answer: "bubble", difficulty: "Hard" },
    { id: 5, question: "What's the keyword for anonymous functions in Python?", answer: "lambda", difficulty: "Expert" }
  ]

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userAnswer, setUserAnswer] = useState('')
  const [progress, setProgress] = useState(0) // 0-5 questions answered
  const [availableAttacks, setAvailableAttacks] = useState(0)
  const [isOnCooldown, setIsOnCooldown] = useState(false)
  const [cooldownTime, setCooldownTime] = useState(0)
  const [showFeedback, setShowFeedback] = useState(null) // 'correct' or 'incorrect'

  // Cooldown timer
  useEffect(() => {
    if (isOnCooldown && cooldownTime > 0) {
      const timer = setTimeout(() => {
        setCooldownTime(cooldownTime - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (cooldownTime === 0) {
      setIsOnCooldown(false)
    }
  }, [isOnCooldown, cooldownTime])

  // Clear feedback after 2 seconds
  useEffect(() => {
    if (showFeedback) {
      const timer = setTimeout(() => {
        setShowFeedback(null)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [showFeedback])

  const handleSubmitAnswer = () => {
    if (!userAnswer.trim()) return

    const currentQuestion = questions[currentQuestionIndex]
    const isCorrect = userAnswer.toLowerCase().trim().includes(currentQuestion.answer.toLowerCase())

    if (isCorrect) {
      sounds.success()
      setProgress(progress + 1)
      setAvailableAttacks(availableAttacks + 1)
      setShowFeedback('correct')
      
      // Move to next question if not at the end
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1)
      }
    } else {
      sounds.error()
      setShowFeedback('incorrect')
    }

    setUserAnswer('')
  }

  const handleSendAttack = () => {
    if (availableAttacks > 0 && !isOnCooldown && !gameFinished) {
      // 🎯 MEGA DRAMATIC ATTACK SELECTION FOR DEMO!
      const attackTypes = ['flashbang', 'cursor-vanish', 'shake', 'zoom-chaos', 'code-blur', 'nuke']
      const randomAttack = attackTypes[Math.floor(Math.random() * attackTypes.length)]
      
      console.log('🔥💥 DEVASTATING ATTACK LAUNCHED:', randomAttack.toUpperCase()) // Debug log
      onSendAttack(randomAttack)
      setAvailableAttacks(availableAttacks - 1)
      setIsOnCooldown(true)
      setCooldownTime(15) // 15 second cooldown
      
      // 🎵 DRAMATIC ATTACK SOUND EFFECTS
      if (randomAttack === 'nuke') {
        sounds.nukeAttack()
      } else {
        sounds.attackLaunch()
      }
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmitAnswer()
    }
  }

  // Don't show if game is finished
  if (gameFinished) return null

  const currentQuestion = questions[currentQuestionIndex]
  const isCompleted = progress >= questions.length

  return (
    <div className="attack-questions nes-container is-rounded">
      <h4 className="text-sm font-bold mb-3">⚔️ Battle Questions</h4>
      
      {/* Progress Bar */}
      <div className="progress-section mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-gray-600">Progress:</span>
          <span className="text-xs font-bold">{progress}/{questions.length}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-green-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${(progress / questions.length) * 100}%` }}
          ></div>
        </div>
      </div>

      {!isCompleted ? (
        <div className="question-section">
          <div className="mb-3">
            <span className="nes-badge">
              <span className="is-primary text-xs">{currentQuestion.difficulty}</span>
            </span>
            <p className="text-sm font-bold mt-2">{currentQuestion.question}</p>
          </div>
          
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              className="nes-input text-xs"
              placeholder="Your answer..."
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={gameFinished}
            />
            <button
              className="nes-btn is-primary text-xs"
              onClick={handleSubmitAnswer}
              disabled={!userAnswer.trim() || gameFinished}
            >
              ✓
            </button>
          </div>

          {showFeedback && (
            <div className={`text-xs ${showFeedback === 'correct' ? 'text-green-600' : 'text-red-600'}`}>
              {showFeedback === 'correct' ? '✅ Correct! Attack unlocked!' : '❌ Try again!'}
            </div>
          )}
        </div>
      ) : (
        <div className="text-center">
          <p className="text-sm font-bold text-green-600">🎉 All questions completed!</p>
        </div>
      )}

      {/* Attack Section */}
      <div className="attack-section mt-4 pt-3 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <span className="text-xs text-gray-600">Available Attacks:</span>
            <span className="text-sm font-bold ml-2">{availableAttacks}</span>
          </div>
          
          <div className="flex gap-2">
            <button
              className={`nes-btn text-xs ${
                availableAttacks > 0 && !isOnCooldown ? 'is-error' : 'is-disabled'
              }`}
              onClick={handleSendAttack}
              disabled={availableAttacks === 0 || isOnCooldown || gameFinished}
            >
              {isOnCooldown ? `🔄 ${cooldownTime}s` : availableAttacks > 0 ? '💥 DEVASTATE!' : '💥 No Ammo'}
            </button>
            
            {/* Debug buttons for testing each attack */}
            {process.env.NODE_ENV === 'development' && availableAttacks > 0 && (
              <div className="flex gap-1">
                <button className="nes-btn is-error text-xs" onClick={() => onSendAttack('nuke')}>☢️</button>
                <button className="nes-btn is-error text-xs" onClick={() => onSendAttack('flashbang')}>⚡</button>
                <button className="nes-btn is-error text-xs" onClick={() => onSendAttack('shake')}>🌪️</button>
                <button className="nes-btn is-error text-xs" onClick={() => onSendAttack('zoom-chaos')}>🔍</button>
                <button className="nes-btn is-error text-xs" onClick={() => onSendAttack('code-blur')}>🌫️</button>
                <button className="nes-btn is-error text-xs" onClick={() => onSendAttack('cursor-vanish')}>👻</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AttackQuestions 