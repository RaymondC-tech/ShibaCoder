import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { useWebSocket } from '../hooks/useWebSocket';
import { sounds } from '../utils/sounds';
import './GameRoom.css';

function SpectatorRoom({ lobby, players, spectatorName, onLeaveLobby }) {
  const { emit, on, off } = useWebSocket();
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [gameStartTime, setGameStartTime] = useState(null);
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [spectatorEmojis, setSpectatorEmojis] = useState([]);

  // Live code viewing state (NEW)
  const [player1Code, setPlayer1Code] = useState('# Waiting for player to start coding...');
  const [player2Code, setPlayer2Code] = useState('# Waiting for player to start coding...');

  // Typing indicators (NEW)
  const [player1Typing, setPlayer1Typing] = useState(false);
  const [player2Typing, setPlayer2Typing] = useState(false);
  const [typingTimeouts, setTypingTimeouts] = useState({ player1: null, player2: null });

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

  // Listen for spectator events
  useEffect(() => {
    const handleChatMessage = (data) => {
      setChatMessages(prev => [...prev, {
        id: Date.now() + Math.random(),
        spectatorName: data.spectatorName,
        message: data.message,
        timestamp: data.timestamp
      }]);
    };

    const handleSpectatorListUpdate = (data) => {
      console.log('Spectator list updated:', data.spectators);
    };

    const handleLiveCodeUpdate = (data) => {
      // ✅ SAFE ARRAY ACCESS: Null checks prevent crashes
      const player1 = players[0];
      const player2 = players[1];
      
      // ✅ CORRECT IDENTIFICATION: Matches by player ID
      if (player1 && data.player_id === player1.id) {
        setPlayer1Code(data.code);
        // ✅ TYPING INDICATORS: Proper timeout management
        setPlayer1Typing(true);
        if (typingTimeouts.player1) {
          clearTimeout(typingTimeouts.player1);
        }
        const timeout = setTimeout(() => setPlayer1Typing(false), 2000);
        setTypingTimeouts(prev => ({ ...prev, player1: timeout }));
        
      } else if (player2 && data.player_id === player2.id) {
        setPlayer2Code(data.code);
        
        // ✅ RESTORED: Player 2 typing indicator logic
        setPlayer2Typing(true);
        if (typingTimeouts.player2) {
          clearTimeout(typingTimeouts.player2);
        }
        const timeout = setTimeout(() => setPlayer2Typing(false), 2000);
        setTypingTimeouts(prev => ({ ...prev, player2: timeout }));
      }
    };

    on('spectator_chat_message', handleChatMessage);
    on('spectator_list_update', handleSpectatorListUpdate);
    on('live_code_update', handleLiveCodeUpdate);

    return () => {
      off('spectator_chat_message', handleChatMessage);
      off('spectator_list_update', handleSpectatorListUpdate);
      off('live_code_update', handleLiveCodeUpdate);
    };
  }, [on, off, players]);

  // Cleanup typing timeouts on unmount
  useEffect(() => {
    return () => {
      if (typingTimeouts.player1) clearTimeout(typingTimeouts.player1);
      if (typingTimeouts.player2) clearTimeout(typingTimeouts.player2);
    };
  }, [typingTimeouts]);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      emit('spectator_chat', { message: newMessage.trim() });
      setNewMessage('');
    }
  };

  const handleSendEmoji = (emoji) => {
    emit('spectator_emoji', { emoji });
    sounds.buttonClick();
    
    // Add emoji to local display for feedback
    const emojiId = Date.now() + Math.random();
    setSpectatorEmojis(prev => [...prev, { 
      id: emojiId, 
      emoji, 
      spectatorName: spectatorName 
    }]);
    
    // Remove emoji after 3 seconds
    setTimeout(() => {
      setSpectatorEmojis(prev => prev.filter(e => e.id !== emojiId));
    }, 3000);
  };

  const formatTime = () => {
    if (!gameStartTime) return '0:00';
    const elapsed = Math.floor((currentTime - gameStartTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Calculate progress for both players
  const player1 = players[0];
  const player2 = players[1];
  
  const player1Progress = player1?.tests_passed ? (player1.tests_passed / 5) * 100 : 0;
  const player2Progress = player2?.tests_passed ? (player2.tests_passed / 5) * 100 : 0;

  if (!lobby || lobby.status === 'waiting') {
    return (
      <div className="game-room">
        <div className="nes-container">
          <h2>👁️ Spectator Mode</h2>
          <p className="text-sm text-gray-600 mt-2">
            Waiting for the battle to start...
          </p>
          <button className="nes-btn is-primary mt-4" onClick={onLeaveLobby}>
            Leave Spectator Mode
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
      {/* Spectator Header */}
      <div className="game-header">
        <div className="timer-section">
          <span className="timer">👁️ SPECTATING | ⏱️ {formatTime()}</span>
        </div>
        <div className="players-section">
          <div className="player-status">
            <img 
              src="/shibaface.svg" 
              alt="Player 1" 
              className="shiba-avatar player-shiba"
            />
            <span>{player1?.name || 'Player 1'}</span>
            <div className="progress-bar">
              <div className="progress-fill player" style={{ width: `${player1Progress}%` }}></div>
            </div>
          </div>
          <div className="vs">VS</div>
          <div className="player-status">
            <img 
              src="/shibaface.svg" 
              alt="Player 2" 
              className="shiba-avatar opponent-shiba"
            />
            <span>{player2?.name || 'Player 2'}</span>
            <div className="progress-bar">
              <div className="progress-fill opponent" style={{ width: `${player2Progress}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      <div className="game-content" style={{ gridTemplateColumns: '1fr 1fr' }}>
        {/* Left Column: Chat + Reactions */}
        <div className="spectator-chat-section">
          {/* Spectator Chat */}
          <div className="nes-container with-title">
            <p className="title">💬 Spectator Chat</p>
            <div className="chat-messages bg-gray-100 p-3 h-40 overflow-y-auto mb-4 rounded text-sm">
              {chatMessages.length === 0 ? (
                <p className="text-gray-500 italic">No messages yet. Be the first to cheer!</p>
              ) : (
                chatMessages.map((msg) => (
                  <div key={msg.id} className="mb-2">
                    <strong className="text-blue-600">{msg.spectatorName}:</strong> {msg.message}
                  </div>
                ))
              )}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                className="nes-input flex-1 text-sm"
                placeholder="Cheer for the players..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                maxLength={100}
              />
              <button
                className="nes-btn is-primary text-sm"
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
              >
                Send
              </button>
            </div>
          </div>

          {/* Emoji Reactions */}
          <div className="nes-container with-title mt-4">
            <p className="title">🎉 Reactions</p>
            <div className="flex gap-2 flex-wrap">
              {['🔥', '💪', '😱', '⚡', '🎉', '💯'].map((emoji) => (
                <button
                  key={emoji}
                  className="nes-btn is-warning text-sm"
                  onClick={() => handleSendEmoji(emoji)}
                  style={{ fontSize: '18px', padding: '12px' }}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Battle Stats */}
          <div className="nes-container with-title mt-4">
            <p className="title">📊 Battle Stats</p>
            <div className="text-sm space-y-2">
              <p>
                <strong>{player1?.name || 'Player 1'}:</strong> {player1?.tests_passed || 0}/5 tests passed
                {player1Typing && <span className="text-green-600 animate-pulse ml-2">✏️ typing...</span>}
              </p>
              <p>
                <strong>{player2?.name || 'Player 2'}:</strong> {player2?.tests_passed || 0}/5 tests passed
                {player2Typing && <span className="text-green-600 animate-pulse ml-2">✏️ typing...</span>}
              </p>
              <p><strong>Status:</strong> {lobby.status === 'playing' ? '🔥 Battle in progress' : '⏳ Waiting'}</p>
            </div>
          </div>

          <button
            className="nes-btn is-error w-full mt-4"
            onClick={onLeaveLobby}
          >
            Leave Spectator Mode
          </button>
        </div>

        {/* Right Column: Problem + Live Code Viewers */}
        <div className="spectator-code-section">
          {/* Problem Description */}
          <div className="nes-container with-title mb-4">
            <p className="title">{problem.title}</p>
            <div className="problem-description text-sm">
              <p>{problem.description}</p>
              
              <h4 className="mt-3 mb-2">Example:</h4>
              {problem.examples.map((example, idx) => (
                <div key={idx} className="example bg-gray-100 p-2 rounded mb-2">
                  <p><strong>Input:</strong> {example.input}</p>
                  <p><strong>Output:</strong> {example.output}</p>
                  {example.explanation && <p><strong>Explanation:</strong> {example.explanation}</p>}
                </div>
              ))}
            </div>
          </div>

          {/* Live Code Viewers */}
          <div className="space-y-4">
            {/* Player 1 Code */}
            <div className="nes-container with-title">
              <p className="title">👁️ {player1?.name || 'Player 1'} - Live Code</p>
              <div style={{ height: '200px' }}>
                <Editor
                  height="180px"
                  language="python"
                  theme="vs-dark"
                  value={player1Code}
                  options={{
                    readOnly: true,
                    minimap: { enabled: false },
                    fontSize: 12,
                    wordWrap: 'on',
                    automaticLayout: true,
                    scrollBeyondLastLine: false,
                  }}
                />
              </div>
            </div>

            {/* Player 2 Code */}
            <div className="nes-container with-title">
              <p className="title">👁️ {player2?.name || 'Player 2'} - Live Code</p>
              <div style={{ height: '200px' }}>
                <Editor
                  height="180px"
                  language="python"
                  theme="vs-dark"
                  value={player2Code}
                  options={{
                    readOnly: true,
                    minimap: { enabled: false },
                    fontSize: 12,
                    wordWrap: 'on',
                    automaticLayout: true,
                    scrollBeyondLastLine: false,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SpectatorRoom; 