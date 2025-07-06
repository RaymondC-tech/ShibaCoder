import React, { useState, useEffect, useRef, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import { useLobby } from '../hooks/useLobby';
import AttackQuestions from './AttackQuestions';
import { useWebSocket } from '../hooks/useWebSocket';
import { sounds } from '../utils/sounds';
import EducationModal from './EducationModal';
import CustomShibaAvatar from './CustomShibaAvatar';
import './GameRoom.css';

function GameRoom({ lobby, players, playerName }) {
  const { testResults, gameFinished, submitCode, leaveLobby } = useLobby();
  const { emit, on, off } = useWebSocket();
  const [code, setCode] = useState(`def two_sum(nums, target):
    # Write your solution here
    # Return the indices of two numbers that add up to target
    # Example: nums = [2,7,11,15], target = 9 → return [0,1]
    
    return []`);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [gameStartTime, setGameStartTime] = useState(null);
  const [currentTime, setCurrentTime] = useState(Date.now());
  
  // Attack system state (NEW - doesn't affect existing logic)
  const [activeAttackEffect, setActiveAttackEffect] = useState(null);
  
  // Education modal state (ISOLATED - doesn't affect game logic)
  const [showEducationModal, setShowEducationModal] = useState(false);
  
  // Spectator emoji reactions (NEW - isolated)
  const [spectatorEmojis, setSpectatorEmojis] = useState([]);
  
  // Live code broadcasting (NEW - isolated) - use useRef to prevent re-renders
  const codeUpdateTimeoutRef = useRef(null);
  
  // Set game start time when lobby status becomes 'playing'
  useEffect(() => {
    if (lobby?.status === 'playing' && !gameStartTime) {
      setGameStartTime(Date.now());
    }
  }, [lobby?.status, gameStartTime]);

  // Update timer every second
  useEffect(() => {
    if (gameStartTime && lobby?.status === 'playing') {
      const interval = setInterval(() => {
        setCurrentTime(Date.now());
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [gameStartTime, lobby?.status]);

  // Cleanup timeout on unmount - simplified to prevent closure issues
  useEffect(() => {
    return () => {
      if (codeUpdateTimeoutRef.current) {
        clearTimeout(codeUpdateTimeoutRef.current);
      }
    };
  }, []);

  // Attack system handlers (NEW - isolated from existing logic)
  useEffect(() => {
    const handleAttackReceived = (data) => {
      console.log('💥 MEGA ATTACK RECEIVED:', data.attackType, 'from', data.attacker);
      setActiveAttackEffect(data.attackType);
      
      // 🎯 MEGA DRAMATIC DURATIONS for demo impact!
      const duration = data.attackType === 'nuke' ? 8000 :         // 💥 ULTIMATE NUKE ATTACK
                      data.attackType === 'code-blur' ? 6000 : 
                      data.attackType === 'zoom-chaos' ? 5000 : 
                      data.attackType === 'cursor-vanish' ? 5000 :
                      data.attackType === 'shake' ? 4000 : 2000; // flashbang
      
      console.log('🎯 MEGA ATTACK effect active for', duration, 'ms');
      
      // 🎵 DRAMATIC INCOMING ATTACK SOUND
      if (data.attackType === 'nuke') {
        sounds.nukeAttack()
      } else {
        sounds.attackReceived()
      }
      
      // Add screen-wide attack effect
      document.querySelector('.game-room')?.classList.add('under-attack');
      
      setTimeout(() => {
        console.log('✅ MEGA ATTACK effect cleared');
        setActiveAttackEffect(null);
        document.querySelector('.game-room')?.classList.remove('under-attack');
      }, duration);
    };

    const handleSpectatorEmojiReaction = (data) => {
      console.log('🎉 Spectator emoji reaction:', data.emoji, 'from', data.spectatorName);
      
      // Add emoji to display
      const emojiId = Date.now() + Math.random();
      setSpectatorEmojis(prev => [...prev, {
        id: emojiId,
        emoji: data.emoji,
        spectatorName: data.spectatorName,
        x: Math.random() * 80 + 10, // Random position 10-90%
        y: Math.random() * 80 + 10
      }]);
      
      // Remove emoji after 4 seconds
      setTimeout(() => {
        setSpectatorEmojis(prev => prev.filter(e => e.id !== emojiId));
      }, 4000);
    };

    on('attack_received', handleAttackReceived);
    on('spectator_emoji_reaction', handleSpectatorEmojiReaction);
    
    return () => {
      off('attack_received', handleAttackReceived);
      off('spectator_emoji_reaction', handleSpectatorEmojiReaction);
    };
  }, [on, off]);

  const handleSendAttack = (attackType) => {
    if (lobby?.status === 'playing' && !gameFinished) {
      emit('send_attack', { attackType });
      console.log('Sending attack:', attackType);
    }
  };

  // Stable broadcast function with latest emit reference - prevents stale closures
  const broadcastCodeUpdate = useCallback((newCode) => {
    if (lobby?.status === 'playing' && !gameFinished) {
      // Clear existing timeout
      if (codeUpdateTimeoutRef.current) {
        clearTimeout(codeUpdateTimeoutRef.current);
      }
      
      // Set new timeout to broadcast after 300ms of no typing
      codeUpdateTimeoutRef.current = setTimeout(() => {
        emit('code_update', { code: newCode });
      }, 300);
    }
  }, [lobby?.status, gameFinished, emit]);

  const handleCodeChange = (newCode) => {
    setCode(newCode);
    broadcastCodeUpdate(newCode); // Broadcast to spectators
  };

  // Debug logging
  console.log('GameRoom state:', {
    lobby,
    players,
    playerName,
    status: lobby?.status,
    gameStartTime
  });

  // Debug winner comparison
  if (gameFinished) {
    console.log('🏆 WINNER DEBUG:', {
      'gameFinished.winner': gameFinished.winner,
      'playerName': playerName,
      'comparison': gameFinished.winner === playerName,
      'winnerTrimmed': gameFinished.winner?.trim(),
      'playerNameTrimmed': playerName?.trim(),
      'normalizedComparison': gameFinished.winner?.trim().toLowerCase() === playerName?.trim().toLowerCase()
    });
  }

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
    if (!gameStartTime) return '0:00';
    const elapsed = Math.floor((currentTime - gameStartTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!lobby || (lobby.status !== 'playing' && lobby.status !== 'finished')) {
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
            <CustomShibaAvatar 
              size={32}
              className="shiba-avatar player-shiba"
            />
            <span>{currentPlayer?.name || 'You'}</span>
            <div className="progress-bar">
              <div className="progress-fill player" style={{ width: `${playerProgress}%` }}></div>
            </div>
          </div>
          <div className="vs">VS</div>
          <div className="player-status">
            <CustomShibaAvatar 
              size={32}
              className="shiba-avatar opponent-shiba"
              colorId="default"
            />
            <span>{opponent?.name || 'Waiting...'}</span>
            <div className="progress-bar">
              <div className="progress-fill opponent" style={{ width: `${opponentProgress}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      {gameFinished && (
        <div className={`nes-container is-centered ${gameFinished.winner?.trim().toLowerCase() === playerName?.trim().toLowerCase() ? 'winner-banner' : 'loser-banner'}`}>
          {gameFinished.winner?.trim().toLowerCase() === playerName?.trim().toLowerCase() ? (
            <h2>🎉 You Won! 🎉</h2>
          ) : (
            <h2>😢 You Lost! Better luck next time! 😢</h2>
          )}
          <p className="text-sm mt-2">
            {gameFinished.winner?.trim().toLowerCase() === playerName?.trim().toLowerCase()
              ? "Congratulations on solving the challenge!" 
              : `${gameFinished.winner} solved it first!`
            }
          </p>
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

          {/* Attack Questions Section (NEW) */}
          <AttackQuestions 
            playerName={playerName}
            onSendAttack={handleSendAttack}
            gameFinished={gameFinished}
          />

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
          <div className={`editor-container nes-container ${
            activeAttackEffect === 'nuke' ? 'attack-nuke' :
            activeAttackEffect === 'flashbang' ? 'attack-flashbang' :
            activeAttackEffect === 'shake' ? 'attack-shake' :
            activeAttackEffect === 'zoom-chaos' ? 'attack-zoom-chaos' :
            activeAttackEffect === 'code-blur' ? 'attack-code-blur' :
            activeAttackEffect === 'cursor-vanish' ? 'attack-cursor-vanish' :
            ''
          }`} data-attack={activeAttackEffect || 'none'}>
            <Editor
              height="500px"
              language="python"
              theme="vs-dark"
              value={code}
              onChange={handleCodeChange}
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

      {/* Floating Education Button - doesn't affect existing layout */}
      <button
        className="nes-btn is-warning text-xs fixed bottom-6 right-6 z-40 pixel-shadow"
        onClick={() => setShowEducationModal(true)}
        style={{ 
          width: '60px', 
          height: '60px',
          borderRadius: '50%',
          fontSize: '20px'
        }}
        title="Learn CS Fundamentals"
      >
        📚
      </button>

      {/* Education Modal - completely isolated */}
      <EducationModal 
        isOpen={showEducationModal}
        onClose={() => setShowEducationModal(false)}
      />

      {/* Spectator Emoji Overlay */}
      {spectatorEmojis.map((emojiData) => (
        <div
          key={emojiData.id}
          className="fixed pointer-events-none z-50 text-4xl animate-bounce"
          style={{
            left: `${emojiData.x}%`,
            top: `${emojiData.y}%`,
            animation: 'bounce 1s infinite, fadeIn 4s ease-out'
          }}
          title={`From ${emojiData.spectatorName}`}
        >
          {emojiData.emoji}
        </div>
      ))}
    </div>
  );
}

export default GameRoom;