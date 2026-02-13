import { useState, useEffect, useCallback } from 'react'
import { getFingerHint } from '../utils/fingeringMap'
import '../styles/TypingPractice.css'

const TEXTS = [
  'The quick brown fox jumps over the lazy dog. This is a pangram that contains every letter of the alphabet.',
  'Practice makes perfect. Consistent typing practice helps improve speed and accuracy significantly.',
  'Typing is a fundamental skill in the digital age. Learning proper fingering technique is essential.'
]

interface Stats {
  elapsed: number
  correctChars: number
  totalChars: number
  errors: number
  backspaces: number
}

interface SavedResult {
  id: string
  text: string
  time: number
  wpm: number
  accuracy: number
  errors: number
  backspaces: number
  timestamp: string
}

export function TypingPractice() {
  const [currentTextIndex, setCurrentTextIndex] = useState(0)
  const [currentText] = useState(TEXTS[currentTextIndex])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [stats, setStats] = useState<Stats>({
    elapsed: 0,
    correctChars: 0,
    totalChars: 0,
    errors: 0,
    backspaces: 0
  })
  const [isActive, setIsActive] = useState(false)
  const [savedResults, setSavedResults] = useState<SavedResult[]>([])
  const [isFinished, setIsFinished] = useState(false)

  // Timer effect
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>
    if (isActive && currentIndex > 0) {
      interval = setInterval(() => {
        setStats(prev => ({ ...prev, elapsed: prev.elapsed + 1 }))
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isActive, currentIndex])

  // Calculate WPM: (correct characters / 5) / elapsed minutes
  const wpm = stats.elapsed > 0
    ? Math.round((stats.correctChars / 5) / (stats.elapsed / 60))
    : 0

  // Calculate accuracy: (correct characters / total input characters) * 100
  const totalInput = stats.correctChars + stats.errors
  const accuracy = totalInput > 0
    ? Math.round((stats.correctChars / totalInput) * 100)
    : 100

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (currentIndex >= currentText.length) return

    // Start timer on first input
    if (!isActive) {
      setIsActive(true)
    }

    const targetChar = currentText[currentIndex]

    if (e.key === 'Backspace') {
      e.preventDefault()
      if (currentIndex > 0) {
        setCurrentIndex(currentIndex - 1)
        setStats(prev => ({ ...prev, backspaces: prev.backspaces + 1 }))
      }
      return
    }

    // Ignore control keys and special keys
    if (e.ctrlKey || e.metaKey || e.altKey || e.key.length > 1) {
      return
    }

    e.preventDefault()

    // Check if input matches target character
    if (e.key === targetChar) {
      setCurrentIndex(currentIndex + 1)
      setStats(prev => ({
        ...prev,
        correctChars: prev.correctChars + 1,
        totalChars: prev.totalChars + 1
      }))
    } else {
      // Wrong character
      setStats(prev => ({
        ...prev,
        errors: prev.errors + 1,
        totalChars: prev.totalChars + 1
      }))
      // Always advance on error (default behavior)
      setCurrentIndex(currentIndex + 1)
    }
  }, [currentIndex, currentText, isActive])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  // Auto-end when text is completed
  useEffect(() => {
    if (currentIndex >= currentText.length && isActive && !isFinished) {
      // Automatically trigger end
      if (stats.elapsed > 0 || currentIndex > 0) {
        const newResult: SavedResult = {
          id: Date.now().toString(),
          text: currentText.substring(0, currentIndex),
          time: stats.elapsed,
          wpm,
          accuracy,
          errors: stats.errors,
          backspaces: stats.backspaces,
          timestamp: new Date().toLocaleString()
        }
        setSavedResults(prev => [newResult, ...prev])
        setIsFinished(true)
        setIsActive(false)
      }
    }
  }, [currentIndex, currentText.length, isActive, isFinished, stats, wpm, accuracy])

  const handleReset = () => {
    setCurrentIndex(0)
    setStats({
      elapsed: 0,
      correctChars: 0,
      totalChars: 0,
      errors: 0,
      backspaces: 0
    })
    setIsActive(false)
    setIsFinished(false)
  }

  const handleSelectText = (index: number) => {
    setCurrentTextIndex(index)
    handleReset()
  }

  const nextTargetChar = currentIndex < currentText.length
    ? currentText[currentIndex]
    : null

  const fingerHint = nextTargetChar ? getFingerHint(nextTargetChar) : ''

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const isCompleted = currentIndex >= currentText.length

  return (
    <div className="typing-practice-layout">
      <div className="typing-practice">
        <h1>Typing Fingers Practice</h1>

      {/* Text Selection */}
      <div className="text-selector">
        {TEXTS.map((_, index) => (
          <button
            key={index}
            className={`text-btn ${index === currentTextIndex ? 'active' : ''}`}
            onClick={() => handleSelectText(index)}
            disabled={isActive}
          >
            {`Text ${index + 1}`}
          </button>
        ))}
      </div>

        {/* Stats Display */}
        <div className="stats">
          <div className="stat-item">
            <span className="label">Time</span>
            <span className="value">{formatTime(stats.elapsed)}</span>
          </div>
          <div className="stat-item">
            <span className="label">WPM</span>
            <span className="value">{wpm}</span>
          </div>
          <div className="stat-item">
            <span className="label">Accuracy</span>
            <span className="value">{accuracy}%</span>
          </div>
          <div className="stat-item">
            <span className="label">Errors</span>
            <span className="value">{stats.errors}</span>
          </div>
          <div className="stat-item">
            <span className="label">Backspace</span>
            <span className="value">{stats.backspaces}</span>
          </div>
        </div>

        {/* Text Display */}
        <div className={`text-display ${isCompleted && !isFinished ? 'completed' : ''} ${isFinished ? 'finished' : ''}`}>
          {currentText.split('').map((char, index) => (
            <span
              key={index}
              className={`char ${
                index < currentIndex ? 'correct' : index === currentIndex ? 'current' : 'pending'
              }`}
            >
              {char === ' ' ? '·' : char}
            </span>
          ))}
        </div>

        {/* Fingering Hint */}
        {fingerHint && (
          <div className="finger-hint">
            <p>Next key: <strong>{nextTargetChar === ' ' ? '(space)' : nextTargetChar}</strong></p>
            <p className="hint-text">Use: {fingerHint}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="actions">
          {isFinished && (
            <div className="completion-message">
              ✓ Finished! Time: {formatTime(stats.elapsed)} | WPM: {wpm} | Accuracy: {accuracy}%
            </div>
          )}
        </div>
      </div>

      {/* Right Sidebar - Saved Results */}
      <div className="saved-results-sidebar">
        <h2>Saved Results</h2>
        <div className="results-list">
          {savedResults.length === 0 ? (
            <p className="no-results">No results yet</p>
          ) : (
            savedResults.map((result) => (
              <div key={result.id} className="result-item">
                <div className="result-header">
                  <span className="timestamp">{result.timestamp}</span>
                </div>
                <div className="result-stats">
                  <div className="result-stat">
                    <span className="label">Time</span>
                    <span className="value">{formatTime(result.time)}</span>
                  </div>
                  <div className="result-stat">
                    <span className="label">WPM</span>
                    <span className="value">{result.wpm}</span>
                  </div>
                  <div className="result-stat">
                    <span className="label">Accuracy</span>
                    <span className="value">{result.accuracy}%</span>
                  </div>
                </div>
                <div className="result-text">
                  <small>Text: {result.text.substring(0, 50)}{result.text.length > 50 ? '...' : ''}</small>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
