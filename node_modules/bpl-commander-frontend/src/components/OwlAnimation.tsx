import React, { useState, useEffect, useRef } from 'react'

interface Position {
  x: number
  y: number
}

interface OwlAnimationProps {
  isActive?: boolean
}

export function OwlAnimation({ isActive = true }: OwlAnimationProps) {
  const [mousePosition, setMousePosition] = useState<Position>({ x: 0, y: 0 })
  const [isVisible, setIsVisible] = useState(true)
  const [eyePosition, setEyePosition] = useState({ left: { x: 0, y: 0 }, right: { x: 0, y: 0 } })
  const owlRef = useRef<HTMLDivElement>(null)

  const OWL_SIZE = 90
  const DISAPPEAR_DISTANCE = 120
  const BOTTOM_MARGIN = 20
  const RIGHT_MARGIN = 20

  useEffect(() => {
    if (!isActive) return

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
      
      if (owlRef.current) {
        const owlRect = owlRef.current.getBoundingClientRect()
        const owlCenterX = owlRect.left + owlRect.width / 2
        const owlCenterY = owlRect.top + owlRect.height / 2
        
        // Calculate distance from mouse to owl
        const distanceFromMouse = Math.sqrt(
          Math.pow(e.clientX - owlCenterX, 2) + 
          Math.pow(e.clientY - owlCenterY, 2)
        )
        
        // Hide owl if cursor is too close
        setIsVisible(distanceFromMouse > DISAPPEAR_DISTANCE)
        
        // Calculate eye positions to follow mouse
        if (distanceFromMouse > DISAPPEAR_DISTANCE) {
          const leftEyeCenterX = owlCenterX - 15
          const leftEyeCenterY = owlCenterY - 5
          const rightEyeCenterX = owlCenterX + 15
          const rightEyeCenterY = owlCenterY - 5
          
          // Calculate angles for each eye
          const leftAngle = Math.atan2(e.clientY - leftEyeCenterY, e.clientX - leftEyeCenterX)
          const rightAngle = Math.atan2(e.clientY - rightEyeCenterY, e.clientX - rightEyeCenterX)
          
          // Limit pupil movement within eye bounds (max 5px radius)
          const maxMovement = 5
          
          setEyePosition({
            left: {
              x: Math.cos(leftAngle) * maxMovement,
              y: Math.sin(leftAngle) * maxMovement
            },
            right: {
              x: Math.cos(rightAngle) * maxMovement,
              y: Math.sin(rightAngle) * maxMovement
            }
          })
        }
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [isActive])

  if (!isActive) return null

  return (
    <div
      ref={owlRef}
      className={`fixed z-40 select-none transition-all duration-300 ${
        isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
      }`}
      style={{
        right: `${RIGHT_MARGIN}px`,
        bottom: `${BOTTOM_MARGIN}px`,
        width: `${OWL_SIZE}px`,
        height: `${OWL_SIZE}px`,
        pointerEvents: 'none',
        animation: 'owlFloat 4s ease-in-out infinite',
      }}
      title={isVisible ? "🦉 BPL Commander's watchful companion" : "🦉 *swooshes away*"}
    >
      <div className="relative w-full h-full drop-shadow-lg">
        {/* Main owl body - rounder and more proportional */}
        <div 
          className="absolute bottom-0 left-1/2 transform -translate-x-1/2"
          style={{
            width: '68px',
            height: '52px',
            backgroundColor: '#20B2AA',
            borderRadius: '50% 50% 30% 30%',
            boxShadow: 'inset -6px -6px 0 rgba(0,0,0,0.15), 0 4px 8px rgba(0,0,0,0.1)',
          }}
        />
        
        {/* Wing accents - subtle shading */}
        <div 
          className="absolute"
          style={{
            bottom: '12px',
            left: '10px',
            width: '22px',
            height: '28px',
            backgroundColor: '#1E9A92',
            borderRadius: '0 60% 60% 0',
            opacity: 0.8,
          }}
        />
        <div 
          className="absolute"
          style={{
            bottom: '12px',
            right: '10px',
            width: '22px',
            height: '28px',
            backgroundColor: '#1E9A92',
            borderRadius: '60% 0 0 60%',
            opacity: 0.8,
          }}
        />
        
        {/* Head - perfectly round */}
        <div 
          className="absolute top-5 left-1/2 transform -translate-x-1/2"
          style={{
            width: '58px',
            height: '48px',
            backgroundColor: '#20B2AA',
            borderRadius: '50%',
            boxShadow: 'inset -4px -4px 0 rgba(0,0,0,0.12), 0 2px 6px rgba(0,0,0,0.1)',
          }}
        />
        
        {/* Head tufts - more defined */}
        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 flex justify-between items-end" style={{ width: '36px' }}>
          <div 
            style={{
              width: '8px',
              height: '12px',
              backgroundColor: '#20B2AA',
              borderRadius: '40% 60% 10% 90%',
              transform: 'rotate(-20deg)',
              transformOrigin: 'bottom center',
              boxShadow: '1px 1px 2px rgba(0,0,0,0.2)',
            }}
          />
          <div 
            style={{
              width: '6px',
              height: '14px',
              backgroundColor: '#20B2AA',
              borderRadius: '50% 50% 10% 10%',
              boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
            }}
          />
          <div 
            style={{
              width: '8px',
              height: '12px',
              backgroundColor: '#20B2AA',
              borderRadius: '60% 40% 90% 10%',
              transform: 'rotate(20deg)',
              transformOrigin: 'bottom center',
              boxShadow: '-1px 1px 2px rgba(0,0,0,0.2)',
            }}
          />
        </div>
        
        {/* Eyes container - properly spaced */}
        <div className="absolute top-12 left-1/2 transform -translate-x-1/2 flex items-center" style={{ gap: '8px' }}>
          {/* Left Eye */}
          <div 
            className="relative"
            style={{
              width: '24px',
              height: '24px',
              backgroundColor: '#FFFFFF',
              borderRadius: '50%',
              border: '2px solid #E8E8E8',
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1), 0 1px 3px rgba(0,0,0,0.1)',
            }}
          >
            {/* Left Pupil */}
            <div
              className="absolute transition-all duration-200 ease-out"
              style={{
                width: '10px',
                height: '10px',
                backgroundColor: '#1A1A1A',
                borderRadius: '50%',
                top: '50%',
                left: '50%',
                transform: `translate(-50%, -50%) translate(${eyePosition.left.x}px, ${eyePosition.left.y}px)`,
                boxShadow: 'inset 1px 1px 2px rgba(0,0,0,0.3)',
              }}
            >
              {/* Eye shine - more prominent */}
              <div
                className="absolute"
                style={{
                  width: '3px',
                  height: '3px',
                  backgroundColor: '#FFFFFF',
                  borderRadius: '50%',
                  top: '2px',
                  left: '2.5px',
                  opacity: 0.9,
                }}
              />
            </div>
          </div>
          
          {/* Right Eye */}
          <div 
            className="relative"
            style={{
              width: '24px',
              height: '24px',
              backgroundColor: '#FFFFFF',
              borderRadius: '50%',
              border: '2px solid #E8E8E8',
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1), 0 1px 3px rgba(0,0,0,0.1)',
            }}
          >
            {/* Right Pupil */}
            <div
              className="absolute transition-all duration-200 ease-out"
              style={{
                width: '10px',
                height: '10px',
                backgroundColor: '#1A1A1A',
                borderRadius: '50%',
                top: '50%',
                left: '50%',
                transform: `translate(-50%, -50%) translate(${eyePosition.right.x}px, ${eyePosition.right.y}px)`,
                boxShadow: 'inset 1px 1px 2px rgba(0,0,0,0.3)',
              }}
            >
              {/* Eye shine - more prominent */}
              <div
                className="absolute"
                style={{
                  width: '3px',
                  height: '3px',
                  backgroundColor: '#FFFFFF',
                  borderRadius: '50%',
                  top: '2px',
                  left: '2.5px',
                  opacity: 0.9,
                }}
              />
            </div>
          </div>
        </div>
        
        {/* Beak - more defined triangular shape */}
        <div 
          className="absolute"
          style={{
            top: '38px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '0',
            height: '0',
            borderLeft: '5px solid transparent',
            borderRight: '5px solid transparent',
            borderTop: '8px solid #FF8C42',
            filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.2))',
          }}
        />
        
        {/* Feet - more detailed */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-2 flex" style={{ gap: '6px' }}>
          {/* Left foot */}
          <div className="flex items-end" style={{ gap: '1px' }}>
            <div 
              style={{
                width: '2.5px',
                height: '5px',
                backgroundColor: '#FF8C42',
                borderRadius: '0 0 40% 40%',
              }}
            />
            <div 
              style={{
                width: '2.5px',
                height: '6px',
                backgroundColor: '#FF8C42',
                borderRadius: '0 0 40% 40%',
              }}
            />
            <div 
              style={{
                width: '2.5px',
                height: '5px',
                backgroundColor: '#FF8C42',
                borderRadius: '0 0 40% 40%',
              }}
            />
          </div>
          
          {/* Right foot */}
          <div className="flex items-end" style={{ gap: '1px' }}>
            <div 
              style={{
                width: '2.5px',
                height: '5px',
                backgroundColor: '#FF8C42',
                borderRadius: '0 0 40% 40%',
              }}
            />
            <div 
              style={{
                width: '2.5px',
                height: '6px',
                backgroundColor: '#FF8C42',
                borderRadius: '0 0 40% 40%',
              }}
            />
            <div 
              style={{
                width: '2.5px',
                height: '5px',
                backgroundColor: '#FF8C42',
                borderRadius: '0 0 40% 40%',
              }}
            />
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes owlFloat {
            0%, 100% { 
              transform: translateY(0px) rotate(0deg); 
            }
            25% { 
              transform: translateY(-2px) rotate(0.5deg); 
            }
            50% { 
              transform: translateY(-4px) rotate(0deg); 
            }
            75% { 
              transform: translateY(-2px) rotate(-0.5deg); 
            }
          }
        `
      }} />
    </div>
  )
}