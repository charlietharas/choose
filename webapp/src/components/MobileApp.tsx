import { useState, useEffect, useCallback } from 'react'

type Mode = 'winners' | 'teams'

interface Touch {
  id: number
  x: number
  y: number
}

export const MobileApp: React.FC = () => {
  const [mode, setMode] = useState<Mode>('winners')
  const [winnerCount, setWinnerCount] = useState(1)
  const [touches, setTouches] = useState<Touch[]>([])
  const [countdown, setCountdown] = useState(0)
  const [isCountingDown, setIsCountingDown] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [selectedTouches, setSelectedTouches] = useState<number[]>([])
  const [showingResults, setShowingResults] = useState(false)

  const resetCountdown = useCallback(() => {
    setCountdown(0)
    setIsCountingDown(false)
  }, [])

  const startCountdown = useCallback(() => {
    setCountdown(4)
    setIsCountingDown(true)
  }, [])

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isCountingDown && countdown > 0) {
      interval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            setIsCountingDown(false)
            handleSelection()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isCountingDown, countdown, handleSelection])

  const handleSelection = useCallback(() => {
    setShowingResults(true)

    if (mode === 'winners') {
      const shuffled = [...touches].sort(() => Math.random() - 0.5)
      const winners = shuffled.slice(0, Math.min(winnerCount, touches.length))
      setSelectedTouches(winners.map(t => t.id))
    } else {
      setSelectedTouches(touches.map(t => t.id))
    }

    setTimeout(() => {
      setShowingResults(false)
      setSelectedTouches([])
      setTouches([])
    }, 5000)
  }, [mode, winnerCount, touches])

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault()

      if (showingResults) return

      const newTouches: Touch[] = []

      for (let i = 0; i < Math.min(e.touches.length, 5); i++) {
        const touch = e.touches[i]
        newTouches.push({
          id: touch.identifier,
          x: touch.clientX,
          y: touch.clientY,
        })
      }

      setTouches(newTouches)

      if (newTouches.length > 0) {
        resetCountdown()
        setTimeout(startCountdown, 100)
      }
    },
    [showingResults, resetCountdown, startCountdown]
  )

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault()

      if (showingResults) return

      const updatedTouches: Touch[] = []

      for (let i = 0; i < Math.min(e.touches.length, 5); i++) {
        const touch = e.touches[i]
        updatedTouches.push({
          id: touch.identifier,
          x: touch.clientX,
          y: touch.clientY,
        })
      }

      setTouches(updatedTouches)
    },
    [showingResults]
  )

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault()

      if (showingResults) return

      const remainingTouches: Touch[] = []

      for (let i = 0; i < Math.min(e.touches.length, 5); i++) {
        const touch = e.touches[i]
        remainingTouches.push({
          id: touch.identifier,
          x: touch.clientX,
          y: touch.clientY,
        })
      }

      setTouches(remainingTouches)

      if (remainingTouches.length === 0) {
        resetCountdown()
      } else {
        resetCountdown()
        setTimeout(startCountdown, 100)
      }
    },
    [showingResults, resetCountdown, startCountdown]
  )

  return (
    <div
      className="mobile-app"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="mobile-header">
        <h1 className="mobile-title">Choose</h1>
        <button className="settings-button" onClick={() => setShowSettings(true)}>
          ⚙️
        </button>
      </div>

      {isCountingDown && <div className="countdown-display">{countdown}</div>}

      <div className="touch-area">
        {touches.map(touch => {
          let color = '#9b59b6'
          const isSelected = selectedTouches.includes(touch.id)

          if (mode === 'teams' && showingResults) {
            const teamIndex = selectedTouches.indexOf(touch.id) % 2
            color = teamIndex === 0 ? '#e74c3c' : '#27ae60'
          } else if (mode === 'winners' && showingResults && !isSelected) {
            color = 'transparent'
          }

          return (
            <div
              key={touch.id}
              className={`touch-circle ${showingResults && !isSelected ? 'eliminated' : ''}`}
              style={{
                left: touch.x - 30,
                top: touch.y - 30,
                backgroundColor: color,
              }}
            />
          )
        })}
      </div>

      {showSettings && (
        <div className="settings-modal-backdrop">
          <div className="settings-modal">
            <div className="settings-header">
              <h2>Settings</h2>
              <button className="close-button" onClick={() => setShowSettings(false)}>
                ×
              </button>
            </div>

            <div className="settings-content">
              <div className="mode-selection">
                <button
                  className={`mode-button ${mode === 'winners' ? 'active' : ''}`}
                  onClick={() => setMode('winners')}
                >
                  Winners
                </button>
                <button
                  className={`mode-button ${mode === 'teams' ? 'active' : ''}`}
                  onClick={() => setMode('teams')}
                >
                  Teams (2)
                </button>
              </div>

              {mode === 'winners' && (
                <div className="winner-selection">
                  <h3>Number of Winners</h3>
                  <div className="winner-buttons">
                    {[1, 2, 3, 4].map(count => (
                      <button
                        key={count}
                        className={`winner-count-button ${winnerCount === count ? 'active' : ''}`}
                        onClick={() => setWinnerCount(count)}
                      >
                        {count}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
