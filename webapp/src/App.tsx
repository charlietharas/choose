import { useState } from 'react'
import './App.css'
import { useMobileDetection } from './hooks/useMobileDetection'
import { MobileApp } from './components'

type Mode = 'winners' | 'teams'

function DesktopApp() {
  const [mode, setMode] = useState<Mode>('winners')
  const [names, setNames] = useState<string[]>(['', ''])
  const [winnerCount, setWinnerCount] = useState(1)
  const [teamCount, setTeamCount] = useState(2)
  const [results, setResults] = useState<string[] | string[][]>([])

  const addNameField = () => {
    if (names.length < 16) {
      setNames([...names, ''])
    }
  }

  const removeNameField = (index: number) => {
    if (names.length > 2) {
      const newNames = names.filter((_, i) => i !== index)
      setNames(newNames)

      const maxWinners = Math.max(1, newNames.length - 1)
      if (winnerCount > maxWinners) {
        setWinnerCount(maxWinners)
      }

      const maxTeams = Math.ceil(newNames.length / 2)
      if (teamCount > maxTeams) {
        setTeamCount(Math.min(maxTeams, 2))
      }
    }
  }

  const updateName = (index: number, value: string) => {
    const newNames = [...names]
    newNames[index] = value
    setNames(newNames)
  }

  const canMakeTeams = () => {
    return names.every(name => name.trim() !== '')
  }

  const canChooseWinners = () => {
    return names.every(name => name.trim() !== '')
  }

  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  const handleChoose = () => {
    const processedNames = [...names]
    const nameCounts: { [key: string]: number } = {}

    for (let i = 0; i < processedNames.length; i++) {
      const name = processedNames[i].trim()
      if (name !== '') {
        if (nameCounts[name]) {
          nameCounts[name]++
          processedNames[i] = `${name} (${nameCounts[name]})`
        } else {
          nameCounts[name] = 1
        }
      }
    }

    setNames(processedNames)

    const validNames = processedNames.filter(name => name.trim() !== '')
    const shuffled = shuffleArray(validNames)

    if (mode === 'winners') {
      const winners: string[] = []
      winners.push(...shuffled.slice(0, Math.min(winnerCount, validNames.length)))
      for (let i = validNames.length; i < winnerCount; i++) {
        winners.push(`Person ${i + 1}`)
      }
      setResults(winners)
    } else {
      const teams: string[][] = []
      const baseTeamSize = Math.floor(validNames.length / teamCount)
      const remainder = validNames.length % teamCount

      let currentIndex = 0
      for (let i = 0; i < teamCount; i++) {
        const teamSize = baseTeamSize + (i < remainder ? 1 : 0)
        teams.push(shuffled.slice(currentIndex, currentIndex + teamSize))
        currentIndex += teamSize
      }
      setResults(teams)
    }
  }

  const handleReset = () => {
    const hasAnyContent = names.some(name => name.trim() !== '')

    if (hasAnyContent) {
      setNames(names.map(() => ''))
      setResults([])
    } else {
      setNames(['', ''])
      setResults([])
      setMode('winners')
      setWinnerCount(1)
      setTeamCount(2)
    }
  }

  const canChoose = mode === 'winners' ? canChooseWinners() : canMakeTeams()

  return (
    <div className="app">
      <h1 className="app-title">Choose</h1>

      <div className="mode-toggle">
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
          Teams
        </button>
      </div>

      <div className="input-section">
        <h2>Enter Names</h2>
        <div className="name-grid">
          {names.map((name, index) => {
            let highlightClass = ''

            if (results.length > 0 && name.trim() !== '') {
              if (mode === 'winners') {
                if ((results as string[]).includes(name.trim())) {
                  highlightClass = 'winner-highlight'
                }
              } else {
                const teamResults = results as string[][]
                teamResults.forEach((team, tIndex) => {
                  if (team.includes(name.trim())) {
                    highlightClass = `team-highlight-${tIndex}`
                  }
                })
              }
            }

            return (
              <div key={index} className={`name-input-container ${highlightClass}`}>
                <input
                  type="text"
                  value={name}
                  onChange={e => updateName(index, e.target.value)}
                  placeholder={`Person ${index + 1}`}
                  className="name-input"
                />
                {names.length > 2 && (
                  <button className="remove-button" onClick={() => removeNameField(index)}>
                    ×
                  </button>
                )}
              </div>
            )
          })}
        </div>
        <button
          className={`add-button ${names.length >= 16 ? 'disabled' : ''}`}
          onClick={addNameField}
          disabled={names.length >= 16}
          title={names.length >= 16 ? 'Maximum 16 people allowed' : 'Add another person'}
        >
          Add
        </button>
      </div>

      <div className="selection-controls">
        {mode === 'winners' ? (
          <div className="winner-selector">
            <div className="slider-container">
              <input
                type="range"
                min="1"
                max={Math.max(1, names.length - 1)}
                value={winnerCount}
                onChange={e => setWinnerCount(Number(e.target.value))}
                className="winner-slider"
                style={
                  {
                    '--slider-progress':
                      names.length <= 2
                        ? '0%'
                        : `${((winnerCount - 1) / Math.max(0, names.length - 2)) * 100}%`,
                  } as React.CSSProperties
                }
              />
              <input
                type="number"
                min="1"
                max={Math.max(1, names.length - 1)}
                value={winnerCount}
                onChange={e => {
                  const value = Number(e.target.value)
                  const min = 1
                  const max = Math.max(1, names.length - 1)
                  const clampedValue = Math.max(min, Math.min(max, value))
                  setWinnerCount(clampedValue)
                }}
                className="winner-number-input"
              />
            </div>
          </div>
        ) : (
          <div className="team-selector">
            {names.length < 3 ? (
              <div className="team-message">Add more people to choose teams</div>
            ) : (
              <div className="team-buttons">
                {(() => {
                  const totalNameCount = names.length
                  const maxTeams = Math.min(Math.ceil(totalNameCount / 2), 8)
                  const availableCounts = Array.from(
                    { length: Math.max(0, maxTeams - 1) },
                    (_, i) => i + 2
                  )

                  if (availableCounts.length > 0 && !availableCounts.includes(teamCount)) {
                    setTimeout(() => setTeamCount(availableCounts[0]), 0)
                  }

                  return availableCounts.map(count => (
                    <button
                      key={count}
                      className={`team-count-button ${teamCount === count ? 'active' : ''}`}
                      onClick={() => setTeamCount(count)}
                    >
                      {count}
                    </button>
                  ))
                })()}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="action-buttons">
        <button
          className={`choose-button ${canChoose ? 'ready' : 'disabled'}`}
          onClick={handleChoose}
          disabled={!canChoose}
        >
          Go
        </button>
        <button
          className="reset-button"
          onClick={handleReset}
          title={names.some(name => name.trim() !== '') ? 'Clear all names' : 'Reset to default'}
        >
          🔄
        </button>
      </div>
    </div>
  )
}

function App() {
  const isMobile = useMobileDetection()

  if (isMobile) {
    return <MobileApp />
  }

  return <DesktopApp />
}

export default App
