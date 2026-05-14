import { useState } from 'react'
import Timer from './Timer.jsx'
import RevealGallery from './RevealGallery.jsx'
import vocab from '../vocab.json'

const THEMES = ['all', 'nouns', 'adjectives', 'verbs', 'pronouns', 'prepositions', 'conjunctions', 'adverbs', 'numbers', 'war', 'family', 'nature', 'emotion', 'society', 'religion', 'body', 'food', 'travel', 'general']

// ── Lobby ─────────────────────────────────────────────
function HostLobby({ room, players, onDrawPair, onEndSession }) {
  const [theme, setTheme] = useState('all')

  return (
    <div className="screen">
      <div className="flex justify-between items-center" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', letterSpacing: '0.15em', color: 'var(--ink)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
            Room Code
          </div>
          <div className="room-code">{room.id}</div>
        </div>
        <button className="btn-ghost" onClick={onEndSession}>End Session</button>
      </div>

      <hr className="divider" />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'start' }}>
        {/* Roster */}
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.75rem', letterSpacing: '0.15em', color: 'var(--ink-faint)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
            Students Joined ({players.length})
          </div>
          {players.length === 0 ? (
            <p className="muted" style={{ fontSize: '0.95rem' }}>
              Waiting for students<span className="waiting-dots"></span>
            </p>
          ) : (
            <div className="roster">
              {players.map(p => (
                <span key={p.id} className="roster-chip">{p.name}</span>
              ))}
            </div>
          )}
        </div>

        {/* Draw controls */}
        <div className="card">
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.75rem', letterSpacing: '0.15em', color: 'var(--ink-faint)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
            Theme Filter <span className="muted" style={{ fontSize: '0.7rem' }}>(optional)</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.2rem' }}>
            {THEMES.map(t => (
              <button
                key={t}
                className={theme === t ? 'btn-ghost btn-sm' : 'btn-ghost btn-sm'}
                style={theme === t ? {
                  background: 'var(--pompeii)',
                  color: 'var(--parchment)',
                  border: '1px solid var(--pompeii)',
                  fontFamily: 'var(--font-display)',
                  fontStyle: 'normal',
                  fontSize: '0.7rem',
                  letterSpacing: '0.1em',
                  padding: '0.3rem 0.7rem',
                  cursor: 'pointer',
                  borderRadius: '2rem',
                } : {
                  background: 'transparent',
                  color: 'var(--ink-faint)',
                  border: '1px solid var(--parchment-dark)',
                  fontFamily: 'var(--font-display)',
                  fontStyle: 'normal',
                  fontSize: '0.7rem',
                  letterSpacing: '0.1em',
                  padding: '0.3rem 0.7rem',
                  cursor: 'pointer',
                  borderRadius: '2rem',
                }}
                onClick={() => setTheme(t)}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
          <button
            className="btn-primary w-full"
            style={{ fontSize: '1.8rem', padding: '0.8rem 2rem' }}
            onClick={() => onDrawPair(theme)}
          >
            Draw Pair
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Game Screen ───────────────────────────────────────
function HostGame({ room, submissionCount, totalPlayers, onReveal, onRedrawPair, onAdjustTimer }) {
  const wordA = room.word_a
  const wordB = room.word_b

  return (
    <div className="screen">
      {/* Top bar */}
      <div className="flex justify-between items-center" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <div className="flex items-center gap-2">
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.75rem', letterSpacing: '0.12em', color: 'var(--ink-faint)', textTransform: 'uppercase' }}>
            Walker's Words
          </span>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.75rem', letterSpacing: '0.15em', color: 'var(--pompeii)' }}>
            {room.id}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span style={{ fontFamily: 'var(--font-body)', fontStyle: 'italic', color: 'var(--ink-faint)', fontSize: '0.9rem' }}>
            {submissionCount} / {totalPlayers} submitted
          </span>
          <button className="btn-ghost" onClick={onRedrawPair}>Redraw Pair</button>
          <button className="btn-primary" onClick={onReveal}>Reveal</button>
        </div>
      </div>

      <hr className="divider" />

      {/* Word pair */}
      <div className="word-pair-container" style={{ flex: 1, alignContent: 'center' }}>
        <div className="word-card start">
          <div className="latin-word-display size-xl">{wordA.latin}</div>
          <div className="dict-form">{wordA.dictForm}</div>
          <div className="meaning">{wordA.meaning}</div>
        </div>
        <div className="word-pair-divider">
          <div style={{ textAlign: 'center' }}>
            <div>━━━</div>
            <div style={{ fontSize: '0.7rem', letterSpacing: '0.15em', marginTop: '0.3rem', color: 'var(--ink-faint)', fontFamily: 'var(--font-display)' }}>WALKER'S WORDS</div>
            <div>━━━</div>
          </div>
        </div>
        <div className="word-card end">
          <div className="latin-word-display size-xl">{wordB.latin}</div>
          <div className="dict-form">{wordB.dictForm}</div>
          <div className="meaning">{wordB.meaning}</div>
        </div>
      </div>

      {/* Timer centred below */}
      <div className="text-center" style={{ marginTop: '2rem' }}>
        <Timer timerEnd={room.timer_end} showControls={true} onAdjust={onAdjustTimer} />
      </div>
    </div>
  )
}

// ── Reveal Screen ─────────────────────────────────────
function HostReveal({ room, submissions, onNextPair, onEndSession }) {
  const wordA = room.word_a
  const wordB = room.word_b

  return (
    <div className="screen">
      {/* Header */}
      <div className="flex justify-between items-center" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.75rem', letterSpacing: '0.12em', color: 'var(--ink-faint)', textTransform: 'uppercase' }}>Results</div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'baseline', marginTop: '0.2rem' }}>
            <span className="latin-word-display size-lg">{wordA.latin}</span>
            <span style={{ color: 'var(--ink-faint)' }}>→</span>
            <span className="latin-word-display size-lg">{wordB.latin}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="btn-secondary" onClick={onNextPair}>Next Pair</button>
          <button className="btn-ghost" onClick={onEndSession}>End Session</button>
        </div>
      </div>

      <hr className="divider" />

      <RevealGallery submissions={submissions} wordA={wordA} wordB={wordB} />
    </div>
  )
}

// ── Main HostView ─────────────────────────────────────
export default function HostView({ room, players, submissions, onDrawPair, onRedrawPair, onReveal, onAdjustTimer, onNextPair, onEndSession }) {
  if (!room) return null

  const currentSubmissions = submissions.filter(s => s.round === room.round)

  if (room.status === 'waiting') {
    return <HostLobby room={room} players={players} onDrawPair={onDrawPair} onEndSession={onEndSession} />
  }
  if (room.status === 'active') {
    return (
      <HostGame
        room={room}
        submissionCount={currentSubmissions.length}
        totalPlayers={players.length}
        onReveal={onReveal}
        onRedrawPair={onRedrawPair}
        onAdjustTimer={onAdjustTimer}
      />
    )
  }
  if (room.status === 'revealed') {
    return (
      <HostReveal
        room={room}
        submissions={currentSubmissions}
        onNextPair={onNextPair}
        onEndSession={onEndSession}
      />
    )
  }
  return null
}
