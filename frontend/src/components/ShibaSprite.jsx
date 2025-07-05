import { useState, useEffect, useRef } from 'react'

const ShibaSprite = ({ behavior = 'follow' }) => {
  const [position, setPosition] = useState({ x: window.innerWidth / 2, y: window.innerHeight / 2 })
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 })
  const [wanderTarget, setWanderTarget] = useState({ x: 0, y: 0 })
  const [isMoving, setIsMoving] = useState(false)
  const [currentAnimation, setCurrentAnimation] = useState('idle_front')
  const [currentFrame, setCurrentFrame] = useState(0)
  const [direction, setDirection] = useState('front')
  const [isIdle, setIsIdle] = useState(true)
  const [isSitting, setIsSitting] = useState(false)
  
  const spriteRef = useRef(null)
  const animationRef = useRef(null)
  const idleTimeoutRef = useRef(null)
  const lastMoveTimeRef = useRef(Date.now())

  // Animation configurations
  const animations = {
    idle_front: { row: 0, frames: 4, speed: 600 },
    idle_right: { row: 1, frames: 4, speed: 600 },
    walk_front: { row: 2, frames: 4, speed: 200 },
    walk_right: { row: 3, frames: 4, speed: 200 },
    walk_up: { row: 5, frames: 4, speed: 200 },
    sit_front: { row: 6, frames: 4, speed: 150 },
    sit_right: { row: 7, frames: 4, speed: 150 }
  }

  // Track mouse position (only for follow behavior)
  useEffect(() => {
    if (behavior !== 'follow') return

    const handleMouseMove = (e) => {
      setCursorPosition({ x: e.clientX, y: e.clientY })
      lastMoveTimeRef.current = Date.now()
      
      // Clear idle timeout when mouse moves
      if (idleTimeoutRef.current) {
        clearTimeout(idleTimeoutRef.current)
      }
      
      // Set idle timeout
      idleTimeoutRef.current = setTimeout(() => {
        setIsIdle(true)
        setIsSitting(true)
      }, 300) // 300ms of no movement
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      if (idleTimeoutRef.current) {
        clearTimeout(idleTimeoutRef.current)
      }
    }
  }, [behavior])

  // Generate random wander targets (for wander behavior)
  useEffect(() => {
    if (behavior !== 'wander') return

    const generateWanderTarget = () => {
      const margin = 100
      const newTarget = {
        x: Math.random() * (window.innerWidth - 2 * margin) + margin,
        y: Math.random() * (window.innerHeight - 2 * margin) + margin
      }
      setWanderTarget(newTarget)
    }

    // Generate initial target
    generateWanderTarget()

    // Generate new target every 3-8 seconds
    const interval = setInterval(() => {
      generateWanderTarget()
    }, Math.random() * 5000 + 3000)

    return () => clearInterval(interval)
  }, [behavior])

  // Movement logic
  useEffect(() => {
    const moveShiba = () => {
      if (isSitting && behavior === 'follow') return

      let target = behavior === 'follow' ? cursorPosition : wanderTarget
      const dx = target.x - position.x
      const dy = target.y - position.y
      const distance = Math.sqrt(dx * dx + dy * dy)

      const deadZone = behavior === 'follow' ? 50 : 30
      const speed = behavior === 'follow' ? 8 : 2

      if (distance > deadZone) {
        setIsMoving(true)
        setIsIdle(false)
        setIsSitting(false)
        
        // Determine direction and animation
        const angle = Math.atan2(dy, dx)
        const angleDeg = (angle * 180 / Math.PI + 360) % 360
        
        let newDirection = 'front'
        let newAnimation = 'walk_front'
        
        if (angleDeg >= 45 && angleDeg < 135) {
          // Moving down
          newDirection = 'front'
          newAnimation = 'walk_front'
        } else if (angleDeg >= 135 && angleDeg < 225) {
          // Moving left
          newDirection = 'left'
          newAnimation = 'walk_right' // Flip horizontally
        } else if (angleDeg >= 225 && angleDeg < 315) {
          // Moving up
          newDirection = 'up'
          newAnimation = 'walk_up'
        } else {
          // Moving right
          newDirection = 'right'
          newAnimation = 'walk_right'
        }
        
        setDirection(newDirection)
        setCurrentAnimation(newAnimation)
        
        // Move towards target
        const moveX = (dx / distance) * speed
        const moveY = (dy / distance) * speed
        
        setPosition(prev => ({
          x: prev.x + moveX,
          y: prev.y + moveY
        }))
      } else {
        setIsMoving(false)
        
        // For wander behavior, sit sometimes when reaching target
        if (behavior === 'wander' && Math.random() < 0.6) {
          setIsSitting(true)
          setTimeout(() => setIsSitting(false), Math.random() * 6000 + 4000) // 4-10 seconds
        }
        
        // Set idle animation based on current direction
        if (direction === 'right' || direction === 'left') {
          setCurrentAnimation('idle_right')
        } else {
          setCurrentAnimation('idle_front')
        }
      }
    }

    const interval = setInterval(moveShiba, 16) // ~60fps
    return () => clearInterval(interval)
  }, [cursorPosition, wanderTarget, position, direction, isSitting, behavior])

  // Handle sitting animation
  useEffect(() => {
    if (isSitting && !isMoving) {
      // Choose sit animation based on current direction
      if (direction === 'right' || direction === 'left') {
        setCurrentAnimation('sit_right')
      } else {
        setCurrentAnimation('sit_front')
      }
    } else if (!isSitting && !isMoving) {
      // Back to idle when not sitting
      if (direction === 'right' || direction === 'left') {
        setCurrentAnimation('idle_right')
      } else {
        setCurrentAnimation('idle_front')
      }
    }
  }, [isSitting, isMoving, direction])

  // Animation frame cycling
  useEffect(() => {
    const animation = animations[currentAnimation]
    if (!animation) return

    const cycleFrame = () => {
      setCurrentFrame(prev => {
        const nextFrame = (prev + 1) % animation.frames
        
        // For sitting animation, stay on last frame after one complete cycle
        if (currentAnimation.includes('sit') && isSitting) {
          if (prev === animation.frames - 1) {
            return animation.frames - 1 // Stay on last frame
          }
        }
        
        return nextFrame
      })
    }

    animationRef.current = setInterval(cycleFrame, animation.speed)
    return () => {
      if (animationRef.current) {
        clearInterval(animationRef.current)
      }
    }
  }, [currentAnimation, isSitting])

  // Reset sitting when mouse moves
  useEffect(() => {
    if (cursorPosition.x !== 0 || cursorPosition.y !== 0) {
      if (Date.now() - lastMoveTimeRef.current < 100) {
        setIsSitting(false)
        setIsIdle(false)
      }
    }
  }, [cursorPosition])

  const spriteStyle = {
    position: 'fixed',
    left: `${position.x - 50}px`, // Center the sprite
    top: `${position.y - 50}px`,
    width: '100px',
    height: '100px',
    backgroundImage: 'url(/shibasheet.png)',
    backgroundSize: '400px 800px', // 4x8 grid
    backgroundPosition: `-${currentFrame * 100}px -${animations[currentAnimation]?.row * 100}px`,
    transform: direction === 'left' ? 'scaleX(-1)' : 'scaleX(1)',
    pointerEvents: 'none',
    zIndex: 5,
    imageRendering: 'pixelated',
    transition: 'transform 0.1s ease'
  }

  return (
    <div
      ref={spriteRef}
      style={spriteStyle}
      className="shiba-sprite"
    />
  )
}

export default ShibaSprite