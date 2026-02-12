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
    }
  }, [currentIndex, currentText, isActive])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

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
    <div className="typing-practice">
      <h1>Typing Fingers Practice</h1>

      {/* Text Selection */}
      <div className="text-selector">
        {TEXTS.map((_, index) => (
          <button
            key={index}
            className={`text-btn ${index === currentTextIndex ? 'active' : ''}`}
            onClick={() => handleSelectText(index)}
          >
            Text {index + 1}
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

      {/* Fingering Hint */}
      {fingerHint && (
        <div className="finger-hint">
          <p>Next key: <strong>{nextTargetChar === ' ' ? '(space)' : nextTargetChar}</strong></p>
          <p className="hint-text">Use: {fingerHint}</p>
        </div>
      )}

      {/* Text Display */}
      <div className={`text-display ${isCompleted ? 'completed' : ''}`}>
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

      {/* Action Buttons */}
      <div className="actions">
        <button className="reset-btn" onClick={handleReset}>
          Reset
        </button>
        {isCompleted && (
          <div className="completion-message">
            ✓ Completed! Time: {formatTime(stats.elapsed)} | WPM: {wpm} | Accuracy: {accuracy}%
          </div>
        )}
      </div>
    </div>
  )
}
