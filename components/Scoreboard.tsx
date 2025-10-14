'use client'

interface ScoreboardProps {
  streak: number
  bestStreak: number
  className?: string
}

export function Scoreboard({ streak, bestStreak, className }: ScoreboardProps) {
  const scoreboardClass = className ? `scoreboard-bar ${className}` : 'scoreboard-bar'

  return (
    <header className={scoreboardClass} aria-live="polite">
      <div className="scoreboard-pane scoreboard-pane--left">
        <span className="scoreboard-label">Current Streak</span>
        <span className="scoreboard-value">{streak}</span>
      </div>

      <div className="scoreboard-spacer" aria-hidden="true" />

      <div className="scoreboard-pane scoreboard-pane--right">
        <span className="scoreboard-label">Best Run</span>
        <span className="scoreboard-value">{bestStreak}</span>
      </div>
    </header>
  )
}
