import React, { useState, useEffect } from 'react';
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

    on('spectator_chat_message', handleChatMessage);
    on('spectator_list_update', handleSpectatorListUpdate);

    return () => {
      off('spectator_chat_message', handleChatMessage);
      off('spectator_list_update', handleSpectatorListUpdate);
    };
  }, [on, off]);

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

      <div className="game-content">
        {/* Problem Section */}
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

          {/* Spectator Chat */}
          <div className="nes-container is-rounded mt-4">
            <h4>💬 Spectator Chat</h4>
            <div className="chat-messages bg-gray-100 p-2 h-32 overflow-y-auto mb-4 rounded text-xs">
              {chatMessages.length === 0 ? (
                <p className="text-gray-500 italic">No messages yet. Be the first to cheer!</p>
              ) : (
                chatMessages.map((msg) => (
                  <div key={msg.id} className="mb-1">
                    <strong className="text-blue-600">{msg.spectatorName}:</strong> {msg.message}
                  </div>
                ))
              )}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                className="nes-input flex-1 text-xs"
                placeholder="Cheer for the players..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                maxLength={100}
              />
              <button
                className="nes-btn is-primary text-xs"
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
              >
                Send
              </button>
            </div>
          </div>

          {/* Emoji Reactions */}
          <div className="nes-container is-rounded mt-4">
            <h4>🎉 Reactions</h4>
            <div className="flex gap-2 flex-wrap">
              {['🔥', '💪', '😱', '⚡', '🎉', '💯'].map((emoji) => (
                <button
                  key={emoji}
                  className="nes-btn is-warning text-xs"
                  onClick={() => handleSendEmoji(emoji)}
                  style={{ fontSize: '16px', padding: '8px' }}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Spectator Info Section */}
        <div className="editor-section">
          <div className="nes-container">
            <h3 className="text-lg font-bold mb-4">👁️ Spectator View</h3>
            <div className="space-y-4">
              <div className="nes-container is-rounded bg-blue-50">
                <p className="text-sm">
                  🎮 <strong>How it works:</strong> You're watching a live coding battle! 
                  Use the chat and emoji reactions to cheer for the players.
                </p>
              </div>
              
              <div className="nes-container is-rounded bg-green-50">
                <h4 className="text-sm font-bold mb-2">📊 Battle Stats</h4>
                <div className="text-xs space-y-1">
                  <p><strong>{player1?.name || 'Player 1'}:</strong> {player1?.tests_passed || 0}/5 tests passed</p>
                  <p><strong>{player2?.name || 'Player 2'}:</strong> {player2?.tests_passed || 0}/5 tests passed</p>
                  <p><strong>Status:</strong> {lobby.status === 'playing' ? '🔥 Battle in progress' : '⏳ Waiting'}</p>
                </div>
              </div>

              {/* Recently sent emojis */}
              {spectatorEmojis.length > 0 && (
                <div className="nes-container is-rounded bg-yellow-50">
                  <h4 className="text-sm font-bold mb-2">🎉 Recent Reactions</h4>
                  <div className="flex gap-2 flex-wrap">
                    {spectatorEmojis.map((emojiData) => (
                      <span key={emojiData.id} className="text-lg animate-bounce">
                        {emojiData.emoji}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <button
                className="nes-btn is-error w-full"
                onClick={onLeaveLobby}
              >
                Leave Spectator Mode
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SpectatorRoom; 