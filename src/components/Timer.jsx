import { useState, useEffect } from 'react'

export default function Timer({ timerEnd, frozenSeconds, paused, showControls, onAdjust, onPause, onResume, onRestart }) {
  const [seconds, setSeconds] = useState(frozenSeconds ?? 0)

  useEffect(() => {
    if (paused) {
      setSeconds(frozenSeconds ?? 0)
      return
    }
    if (!timerEnd) {
      setSeconds(0)
      return
    }

    const update = () => {
      const remaining = Math.max(0, Math.floor((new Date(timerEnd).getTime() - Date.now()) / 1000))
      setSeconds(remaining)
    }

    update()
    const id = setInterval(update, 500)
    return () => clearInterval(id)
  }, [timerEnd, frozenSeconds, paused])

  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  const display = `${mins}:${String(secs).padStart(2, '0')}`

  let timerClass = 'timer'
  if (paused) timerClass += ' warning'
  else if (seconds === 0) timerClass += ' expired'
  else if (seconds <= 10) timerClass += ' critical'
  else if (seconds <= 30) timerClass += ' warning'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
      <div className={timerClass}>{!paused && seconds === 0 ? 'TIME' : display}</div>
      {showControls && (
        <div className="flex gap-1">
          <button className="btn-ghost btn-sm" onClick={() => onAdjust(-30)} disabled={paused}>−30s</button>
          {paused
            ? <button className="btn-ghost btn-sm" onClick={onResume}>Resume</button>
            : <button className="btn-ghost btn-sm" onClick={onPause}>Pause</button>
          }
          <button className="btn-ghost btn-sm" onClick={onRestart}>Restart</button>
          <button className="btn-ghost btn-sm" onClick={() => onAdjust(30)} disabled={paused}>+30s</button>
        </div>
      )}
    </div>
  )
}
