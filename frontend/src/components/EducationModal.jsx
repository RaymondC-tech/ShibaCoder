import { useState } from 'react'

const educationalContent = [
  {
    id: 'loops',
    title: '🔄 Python For Loops',
    concept: 'Iteration Basics',
    code: `for i in range(len(nums)):
    print(f"Index {i}: {nums[i]}")

for value in nums:
    print(f"Value: {value}")`,
    explanation: 'For loops let you repeat actions. Use range(len()) to get indices, or iterate directly over values. Both are useful in different situations!'
  },
  {
    id: 'lists',
    title: '📋 Lists in Python',
    concept: 'Data Structure Fundamentals',
    code: `nums = [2, 7, 11, 15]
print(nums[0])      # First element: 2
print(nums[-1])     # Last element: 15
print(len(nums))    # Length: 4`,
    explanation: 'Lists store multiple values in order. Access elements by index (starting at 0). Negative indices count from the end!'
  },
  {
    id: 'functions',
    title: '⚡ Function Returns',
    concept: 'Function Basics',
    code: `def two_sum(nums, target):
    # Do some work here
    return [0, 1]  # Return result

result = two_sum([2, 7], 9)
print(result)  # [0, 1]`,
    explanation: 'Functions take inputs and give back outputs using return. The calling code can catch and use the returned value!'
  },
  {
    id: 'variables',
    title: '✨ Clean Variable Names',
    concept: 'Code Readability',
    code: `# Bad naming 😞
x = [2, 7, 11, 15]
y = 9
z = []

# Good naming 😊
nums = [2, 7, 11, 15]
target = 9
result = []`,
    explanation: 'Use descriptive variable names! Your future self and teammates will thank you. Code is read more often than written!'
  }
]

function EducationModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState(0)

  if (!isOpen) return null

  const currentContent = educationalContent[activeTab]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="max-w-4xl w-full pt-8">
        <div className="nes-container with-title bg-white max-h-[90vh] overflow-y-auto pixel-shadow relative">
          <p className="title">📚 Computer Science Fundamentals</p>
          
          <button
            type="button"
            className="absolute top-2 right-2 nes-btn is-error text-xs"
            onClick={onClose}
            style={{ width: '40px', height: '40px', padding: '4px' }}
          >
            ×
          </button>

          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-2 mb-6 mt-4">
            {educationalContent.map((content, index) => (
              <button
                key={content.id}
                className={`nes-btn text-xs px-3 py-2 ${
                  activeTab === index ? 'is-primary' : 'is-normal'
                }`}
                onClick={() => setActiveTab(index)}
              >
                {content.title}
              </button>
            ))}
          </div>

          {/* Content Display */}
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-bold text-amber-900 mb-2">
                {currentContent.title}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                {currentContent.concept}
              </p>
            </div>

            {/* Code Example */}
            <div className="nes-container is-rounded bg-gray-900 text-green-400 font-mono text-sm p-4">
              <pre className="whitespace-pre-wrap overflow-x-auto">
                {currentContent.code}
              </pre>
            </div>

            {/* Explanation */}
            <div className="nes-container is-rounded bg-blue-50 p-4">
              <p className="text-sm text-blue-900">
                💡 <strong>Understanding:</strong> {currentContent.explanation}
              </p>
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center mt-6">
              <button
                className={`nes-btn text-xs ${activeTab === 0 ? 'is-disabled' : 'is-normal'}`}
                onClick={() => setActiveTab(Math.max(0, activeTab - 1))}
                disabled={activeTab === 0}
              >
                ← Previous
              </button>
              
              <span className="text-xs text-gray-600">
                {activeTab + 1} of {educationalContent.length}
              </span>
              
              <button
                className={`nes-btn text-xs ${
                  activeTab === educationalContent.length - 1 ? 'is-disabled' : 'is-normal'
                }`}
                onClick={() => setActiveTab(Math.min(educationalContent.length - 1, activeTab + 1))}
                disabled={activeTab === educationalContent.length - 1}
              >
                Next →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EducationModal 