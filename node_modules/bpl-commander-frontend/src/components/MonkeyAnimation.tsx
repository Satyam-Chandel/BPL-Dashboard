import React, { useState, useEffect, useRef } from 'react'

interface Position {
  x: number
  y: number
}

interface MonkeyAnimationProps {
  isActive?: boolean
}

export function MonkeyAnimation({ isActive = true }: MonkeyAnimationProps) {
  const [position, setPosition] = useState<Position>({ x: 100, y: 100 })
  const [isRunning, setIsRunning] = useState(false)
  const [direction, setDirection] = useState(0) // 0: right, 1: down, 2: left, 3: up
  const [mousePosition, setMousePosition] = useState<Position>({ x: 0, y: 0 })
  const animationRef = useRef<number>()
  const lastUpdateRef = useRef<number>(0)

  const MONKEY_SIZE = 40
  const BORDER_PADDING = 20
  const NORMAL_SPEED = 1
  const RUN_SPEED = 4
  const FEAR_DISTANCE = 100
  const ANIMATION_SPEED = 16 // ~60 FPS

  // Monkey emoji with banana
  const monkeyEmojis = ['🐒🍌', '🐵🍌', '🙊🍌', '🙈🍌']
  const [currentEmojiIndex, setCurrentEmojiIndex] = useState(0)

  useEffect(() => {
    if (!isActive) return

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [isActive])

  useEffect(() => {
    if (!isActive) return

    const animate = (timestamp: number) => {
      if (timestamp - lastUpdateRef.current >= ANIMATION_SPEED) {
        const windowWidth = window.innerWidth
        const windowHeight = window.innerHeight

        // Calculate distance from mouse
        const distanceFromMouse = Math.sqrt(
          Math.pow(mousePosition.x - position.x, 2) + 
          Math.pow(mousePosition.y - position.y, 2)
        )

        const shouldRun = distanceFromMouse < FEAR_DISTANCE
        setIsRunning(shouldRun)

        let newX = position.x
        let newY = position.y
        let newDirection = direction
        const speed = shouldRun ? RUN_SPEED : NORMAL_SPEED

        if (shouldRun) {
          // Run away from mouse
          const angle = Math.atan2(position.y - mousePosition.y, position.x - mousePosition.x)
          newX += Math.cos(angle) * speed
          newY += Math.sin(angle) * speed

          // Change emoji when running
          setCurrentEmojiIndex((prev) => (prev + 1) % monkeyEmojis.length)
        } else {
          // Normal border patrol
          switch (direction) {
            case 0: // Moving right along top
              newX += speed
              if (newX >= windowWidth - MONKEY_SIZE - BORDER_PADDING) {
                newDirection = 1 // Change to down
                newX = windowWidth - MONKEY_SIZE - BORDER_PADDING
              }
              break
            case 1: // Moving down along right
              newY += speed
              if (newY >= windowHeight - MONKEY_SIZE - BORDER_PADDING) {
                newDirection = 2 // Change to left
                newY = windowHeight - MONKEY_SIZE - BORDER_PADDING
              }
              break
            case 2: // Moving left along bottom
              newX -= speed
              if (newX <= BORDER_PADDING) {
                newDirection = 3 // Change to up
                newX = BORDER_PADDING
              }
              break
            case 3: // Moving up along left
              newY -= speed
              if (newY <= BORDER_PADDING) {
                newDirection = 0 // Change to right
                newY = BORDER_PADDING
              }
              break
          }
        }

        // Keep monkey within bounds
        newX = Math.max(BORDER_PADDING, Math.min(windowWidth - MONKEY_SIZE - BORDER_PADDING, newX))
        newY = Math.max(BORDER_PADDING, Math.min(windowHeight - MONKEY_SIZE - BORDER_PADDING, newY))

        setPosition({ x: newX, y: newY })
        setDirection(newDirection)
        lastUpdateRef.current = timestamp
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [position, direction, mousePosition, isActive])

  // Change emoji periodically when not running
  useEffect(() => {
    if (isRunning || !isActive) return

    const interval = setInterval(() => {
      setCurrentEmojiIndex((prev) => (prev + 1) % monkeyEmojis.length)
    }, 2000)

    return () => clearInterval(interval)
  }, [isRunning, isActive])

  if (!isActive) return null

  return (
    <div
      className="fixed pointer-events-none z-50 select-none"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${MONKEY_SIZE}px`,
        height: `${MONKEY_SIZE}px`,
        fontSize: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: isRunning ? 'none' : 'transform 0.3s ease-out',
        transform: `scale(${isRunning ? 1.2 : 1}) ${isRunning ? 'rotate(5deg)' : 'rotate(0deg)'}`,
        filter: isRunning ? 'drop-shadow(2px 2px 4px rgba(0,0,0,0.3))' : 'none',
        animation: isRunning ? 'bounce 0.5s infinite alternate' : 'none',
      }}
      title={isRunning ? "Ahh! The cursor is chasing me! 🏃‍♂️💨" : "Just carrying my banana around 🐒🍌"}
    >
      <span style={{ 
        display: 'inline-block',
        animation: isRunning ? 'shake 0.1s infinite' : 'float 3s infinite ease-in-out'
      }}>
        {monkeyEmojis[currentEmojiIndex]}
      </span>

      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes bounce {
            0% { transform: translateY(0px) scale(1.2); }
            100% { transform: translateY(-10px) scale(1.2); }
          }
          
          @keyframes shake {
            0% { transform: translateX(0px) rotate(-2deg); }
            25% { transform: translateX(-2px) rotate(1deg); }
            50% { transform: translateX(2px) rotate(-1deg); }
            75% { transform: translateX(-1px) rotate(2deg); }
            100% { transform: translateX(0px) rotate(-2deg); }
          }
          
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-5px); }
          }
        `
      }} />
    </div>
  )
}