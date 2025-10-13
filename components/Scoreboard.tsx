'use client'

interface ScoreboardProps {
  streak: number
  bestStreak: number
  className?: string
}

export function Scoreboard({
  streak,
  bestStreak,
  className
}: ScoreboardProps) {
  const marqueeClassName = className ? `scoreboard-marquee ${className}` : 'scoreboard-marquee'

  return (
    <section className={marqueeClassName} aria-live="polite">
      <div className="scoreboard-marquee__shell">
        <div className="scoreboard-marquee__inner">
          <div className="scoreboard-marquee__letterboard">
            <div className="scoreboard-marquee__letterboard-grid" aria-hidden="true" />

            <dl className="scoreboard-marquee__stats">
              <div className="scoreboard-marquee__stat scoreboard-marquee__stat--primary">
                <dt className="scoreboard-marquee__label">Current Streak</dt>
                <dd className="scoreboard-marquee__value">{streak}</dd>
              </div>

              <div className="scoreboard-marquee__stat scoreboard-marquee__stat--secondary">
                <dt className="scoreboard-marquee__label">Best Run</dt>
                <dd className="scoreboard-marquee__value scoreboard-marquee__value--secondary">{bestStreak}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </section>
  )
}
