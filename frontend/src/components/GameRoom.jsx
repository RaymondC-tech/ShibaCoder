import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { useLobby } from '../hooks/useLobby';
import './GameRoom.css';

function GameRoom({ lobby, players, playerName }) {
  const { testResults, gameFinished, submitCode, leaveLobby } = useLobby();
  const [code, setCode] = useState(`def two_sum(nums, target):
    # Write your solution here
    pass`);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [gameStartTime] = useState(Date.now());
  
  // Debug logging
  console.log('GameRoom state:', {
    lobby,
    players,
    playerName,
    status: lobby?.status
  });

  // Calculate progress for both players
  const currentPlayer = players.find(p => p.name === playerName);
  const opponent = players.find(p => p.name !== playerName);
  
  const playerProgress = currentPlayer?.tests_passed ? (currentPlayer.tests_passed / 5) * 100 : 0;
  const opponentProgress = opponent?.tests_passed ? (opponent.tests_passed / 5) * 100 : 0;

  const handleSubmit = async () => {
    if (!code.trim() || isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      await submitCode(code);
    } catch (error) {
      console.error('Failed to submit code:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = () => {
    const elapsed = Math.floor((Date.now() - gameStartTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!lobby || lobby.status !== 'playing') {
    return (
      <div className="game-room">
        <div className="nes-container">
          <h2>Loading game...</h2>
          <p className="text-sm text-gray-600 mt-2">
            {!lobby ? 'Connecting to game...' : 'Waiting for game to start...'}
          </p>
          <button className="nes-btn is-primary mt-4" onClick={() => window.location.href = '/'}>
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  const problem = lobby.problem || {
    title: "Two Sum",
    description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
    examples: [
      {
        input: "nums = [2,7,11,15], target = 9",
        output: "[0,1]",
        explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]."
      }
    ]
  };

  return (
    <div className="game-room">
      <div className="game-header">
        <div className="timer-section">
          <span className="timer">⏱️ {formatTime()}</span>
        </div>
        <div className="players-section">
          <div className="player-status">
            <img 
              src="/shibaface.svg" 
              alt="Player Shiba" 
              className="shiba-avatar player-shiba"
            />
            <span>{currentPlayer?.name || 'You'}</span>
            <div className="progress-bar">
              <div className="progress-fill player" style={{ width: `${playerProgress}%` }}></div>
            </div>
          </div>
          <div className="vs">VS</div>
          <div className="player-status">
            <img 
              src="/shibaface.svg" 
              alt="Opponent Shiba" 
              className="shiba-avatar opponent-shiba"
            />
            <span>{opponent?.name || 'Waiting...'}</span>
            <div className="progress-bar">
              <div className="progress-fill opponent" style={{ width: `${opponentProgress}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      {gameFinished && (
        <div className="winner-banner nes-container is-centered">
          <h2>🎉 {gameFinished.winner === playerName ? 'You Won!' : `${gameFinished.winner} Won!`} 🎉</h2>
          <button className="nes-btn is-success" onClick={leaveLobby}>
            Back to Lobby
          </button>
        </div>
      )}

      <div className="game-content">
        <div className="problem-section nes-container with-title">
          <p className="title">{problem.title}</p>
          <div className="problem-description">
            <p>{problem.description}</p>
            
            <h4>Example:</h4>
            {problem.examples.map((example, idx) => (
              <div key={idx} className="example">
                <p><strong>Input:</strong> {example.input}</p>
                <p><strong>Output:</strong> {example.output}</p>
                {example.explanation && <p><strong>Explanation:</strong> {example.explanation}</p>}
              </div>
            ))}
          </div>

          {testResults && (
            <div className="test-results nes-container is-rounded">
              <h4>Test Results</h4>
              <p>✅ Passed: {testResults.passed}/{testResults.total}</p>
              {testResults.errors?.map((error, idx) => (
                <p key={idx} className="error">❌ {error}</p>
              ))}
            </div>
          )}
        </div>

        <div className="editor-section">
          <div className="editor-container nes-container">
            <Editor
              height="500px"
              language="python"
              theme="vs-dark"
              value={code}
              onChange={setCode}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                wordWrap: 'on',
                automaticLayout: true,
              }}
            />
          </div>
          
          <button 
            className={`nes-btn ${isSubmitting ? 'is-disabled' : 'is-primary'} submit-btn`}
            onClick={handleSubmit}
            disabled={isSubmitting || gameFinished}
          >
            {isSubmitting ? 'Running Tests...' : 'Submit Solution'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default GameRoom;