import { useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from './Navbar'
import CloudBackground from './CloudBackground'
import ShibaSprite from './ShibaSprite'

function Discussion() {
  const [activeTab, setActiveTab] = useState('easy')
  const [searchQuery, setSearchQuery] = useState('')
  const [showAskModal, setShowAskModal] = useState(false)
  const [selectedThread, setSelectedThread] = useState(null)
  const [newQuestion, setNewQuestion] = useState('')
  const [newReply, setNewReply] = useState('')

  // Hardcoded mock data for demo
  const discussions = {
    easy: [
      {
        id: 1,
        title: "Two Sum - Why is my solution timing out?",
        author: "CodeNewbie23",
        elo: "1,250",
        timeAgo: "2 hours ago",
        replies: 5,
        content: "I'm using nested loops but getting TLE on large test cases. Can someone help me understand why?",
        tags: ["arrays", "hash-table"],
        solved: false,
        likes: 3
      },
      {
        id: 2,
        title: "Valid Palindrome - String comparison help",
        author: "ShibaLearner",
        elo: "2,100",
        timeAgo: "4 hours ago", 
        replies: 12,
        content: "My palindrome function works for simple cases but fails with special characters...",
        tags: ["strings", "two-pointers"],
        solved: true,
        likes: 8
      },
      {
        id: 3,
        title: "Best time to buy and sell stock - confused about approach",
        author: "AlgoStarter",
        elo: "900",
        timeAgo: "1 day ago",
        replies: 3,
        content: "I understand the problem but can't figure out the optimal solution approach.",
        tags: ["arrays", "dynamic-programming"],
        solved: false,
        likes: 2
      }
    ],
    medium: [
      {
        id: 4,
        title: "Longest Substring Without Repeating Characters optimization",
        author: "MidTierCoder",
        elo: "4,200",
        timeAgo: "1 hour ago",
        replies: 7,
        content: "My sliding window solution works but feels inefficient. Any optimization tips?",
        tags: ["strings", "sliding-window"],
        solved: false,
        likes: 15
      },
      {
        id: 5,
        title: "Binary Tree Level Order Traversal - BFS vs iterative",
        author: "TreeMaster",
        elo: "3,800",
        timeAgo: "3 hours ago",
        replies: 9,
        content: "When should I use BFS versus iterative approach for level order traversal?",
        tags: ["trees", "bfs", "queue"],
        solved: true,
        likes: 22
      }
    ],
    hard: [
      {
        id: 6,
        title: "Median of Two Sorted Arrays - Binary search approach",
        author: "AlgoExpert99",
        elo: "7,500",
        timeAgo: "30 minutes ago",
        replies: 4,
        content: "Struggling with the binary search implementation. The logic is confusing.",
        tags: ["binary-search", "arrays"],
        solved: false,
        likes: 31
      },
      {
        id: 7,
        title: "Segment Tree construction optimization",
        author: "CompetitivePro",
        elo: "8,900",
        timeAgo: "2 hours ago",
        replies: 13,
        content: "Looking for ways to optimize segment tree build time for contest scenarios.",
        tags: ["data-structures", "competitive"],
        solved: true,
        likes: 45
      }
    ]
  }

  const comments = {
    1: [
      {
        author: "AlgoMaster",
        elo: "2,800",
        content: "Try using a HashMap for O(n) time complexity instead of nested loops!",
        timeAgo: "1 hour ago",
        likes: 12
      },
      {
        author: "HashTableGuru",
        elo: "3,200", 
        content: "Here's the key insight: store numbers as keys and their indices as values.",
        timeAgo: "45 minutes ago",
        likes: 8
      }
    ]
  }

  const getELOColor = (elo) => {
    const eloNum = parseInt(elo.replace(',', ''))
    if (eloNum < 3000) return { bg: 'bg-green-100', text: 'text-green-800', icon: '🟢' }
    if (eloNum < 6000) return { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: '🟡' }
    return { bg: 'bg-red-100', text: 'text-red-800', icon: '🔴' }
  }

  const filteredDiscussions = discussions[activeTab].filter(discussion =>
    discussion.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    discussion.content.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleAskQuestion = () => {
    setShowAskModal(true)
  }

  const handleLike = (id) => {
    // Demo only - visual feedback but no persistence
    console.log('Liked post:', id)
  }

  return (
    <div className="min-h-screen bg-shiba-bg flex flex-col relative">
      <CloudBackground />
      <ShibaSprite behavior="wander" />
      <Navbar />
      
      <div className="flex-1 relative z-10 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-amber-900 mb-2">💬 ShibaCoder Discussion</h1>
            <p className="text-sm text-amber-700">Ask questions, share knowledge, help the community!</p>
          </div>

          {/* ELO Tabs */}
          <div className="flex justify-center gap-4 mb-6">
            <button
              className={`nes-btn ${activeTab === 'easy' ? 'is-success' : ''} text-xs`}
              onClick={() => setActiveTab('easy')}
            >
              🟢 Easy League
            </button>
            <button
              className={`nes-btn ${activeTab === 'medium' ? 'is-warning' : ''} text-xs`}
              onClick={() => setActiveTab('medium')}
            >
              🟡 Medium League
            </button>
            <button
              className={`nes-btn ${activeTab === 'hard' ? 'is-error' : ''} text-xs`}
              onClick={() => setActiveTab('hard')}
            >
              🔴 Hard League
            </button>
          </div>

          {/* Action Bar */}
          <div className="flex gap-4 mb-6">
            <button
              className="nes-btn is-primary text-xs"
              onClick={handleAskQuestion}
            >
              💬 Ask Question
            </button>
            <div className="nes-field flex-1">
              <input
                type="text"
                className="nes-input"
                placeholder="🔍 Search discussions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Discussion List */}
          <div className="space-y-4">
            {filteredDiscussions.map((discussion) => {
              const authorColor = getELOColor(discussion.elo)
              return (
                <div key={discussion.id} className="nes-container bg-white">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 
                          className="text-sm font-bold text-blue-900 cursor-pointer hover:underline"
                          onClick={() => setSelectedThread(discussion)}
                        >
                          {discussion.title}
                        </h3>
                        {discussion.solved && (
                          <span className="nes-badge">
                            <span className="is-success text-xs">✓ Solved</span>
                          </span>
                        )}
                      </div>
                      
                      <p className="text-xs text-gray-600 mb-2">
                        {discussion.content.substring(0, 120)}...
                      </p>
                      
                      <div className="flex items-center gap-4 text-xs">
                        <div className="flex items-center gap-1">
                          <span className={`px-2 py-1 rounded ${authorColor.bg} ${authorColor.text}`}>
                            {authorColor.icon} {discussion.author} ({discussion.elo} ELO)
                          </span>
                        </div>
                        <span className="text-gray-500">{discussion.timeAgo}</span>
                        <span className="text-gray-500">{discussion.replies} replies</span>
                        <button 
                          className="text-red-500 hover:text-red-700"
                          onClick={() => handleLike(discussion.id)}
                        >
                          ❤️ {discussion.likes}
                        </button>
                      </div>
                      
                      <div className="flex gap-1 mt-2">
                        {discussion.tags.map(tag => (
                          <span key={tag} className="text-xs bg-gray-200 px-2 py-1 rounded">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {filteredDiscussions.length === 0 && (
            <div className="nes-container bg-white text-center py-12">
              <p className="text-sm text-gray-600">
                No discussions found for "{searchQuery}" in {activeTab} category.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Ask Question Modal */}
      {showAskModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="nes-container bg-white max-w-2xl w-full">
            <h3 className="text-sm font-bold mb-4">Ask a Question</h3>
            
            <div className="nes-field mb-4">
              <label className="text-xs block mb-2">Question Title</label>
              <input
                type="text"
                className="nes-input"
                placeholder="e.g. Two Sum - Need help with optimization"
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
              />
            </div>
            
            <div className="nes-field mb-4">
              <label className="text-xs block mb-2">Description</label>
              <textarea
                className="nes-textarea"
                rows={6}
                placeholder="Describe your problem in detail..."
              />
            </div>
            
            <div className="flex gap-2">
              <button
                className="nes-btn flex-1"
                onClick={() => setShowAskModal(false)}
              >
                Cancel
              </button>
              <button
                className="nes-btn is-primary flex-1"
                onClick={() => {
                  // Demo only - no actual submission
                  console.log('Would submit question:', newQuestion)
                  setShowAskModal(false)
                  setNewQuestion('')
                }}
              >
                Ask Question 
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Thread View Modal */}
      {selectedThread && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="nes-container bg-white max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-lg font-bold">{selectedThread.title}</h2>
              <button
                className="nes-btn is-error text-xs"
                onClick={() => setSelectedThread(null)}
              >
                ✕
              </button>
            </div>
            
            <div className="mb-4">
              <p className="text-sm mb-4">{selectedThread.content}</p>
              <div className="flex items-center gap-4 text-xs">
                <span className={`px-2 py-1 rounded ${getELOColor(selectedThread.elo).bg} ${getELOColor(selectedThread.elo).text}`}>
                  {getELOColor(selectedThread.elo).icon} {selectedThread.author} ({selectedThread.elo} ELO)
                </span>
                <span className="text-gray-500">{selectedThread.timeAgo}</span>
              </div>
            </div>
            
            {/* Comments */}
            <div className="space-y-4 mb-4">
              <h4 className="font-bold">Replies ({selectedThread.replies})</h4>
              {comments[selectedThread.id]?.map((comment, idx) => (
                <div key={idx} className="nes-container is-rounded bg-gray-50">
                  <p className="text-sm mb-2">{comment.content}</p>
                  <div className="flex items-center gap-4 text-xs">
                    <span className={`px-2 py-1 rounded ${getELOColor(comment.elo).bg} ${getELOColor(comment.elo).text}`}>
                      {getELOColor(comment.elo).icon} {comment.author} ({comment.elo} ELO)
                    </span>
                    <span className="text-gray-500">{comment.timeAgo}</span>
                    <span className="text-red-500">❤️ {comment.likes}</span>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Reply Input */}
            <div className="nes-field">
              <label className="text-xs block mb-2">Add Reply</label>
              <textarea
                className="nes-textarea"
                rows={3}
                placeholder="Share your thoughts or solution..."
                value={newReply}
                onChange={(e) => setNewReply(e.target.value)}
              />
              <button 
                className="nes-btn is-primary text-xs mt-2"
                onClick={() => {
                  // Demo only - no actual posting
                  console.log('Would post reply:', newReply)
                  setNewReply('')
                }}
              >
                Post Reply 
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Discussion 