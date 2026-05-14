import Timer from './Timer.jsx'
import ChainBuilder from './ChainBuilder.jsx'
import RevealGallery from './RevealGallery.jsx'

// ── Lobby ─────────────────────────────────────────────
function PlayerLobby({ playerName, roomCode }) {
  return (
    <div className="screen-center">
      <div style={{ maxWidth: '400px', width: '100%', textAlign: 'center' }}>
        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: '0.75rem',
          letterSpacing: '0.15em',
          color: 'var(--ink-faint)',
          textTransform: 'uppercase',
          marginBottom: '0.4rem',
        }}>
          Room
        </div>
        <div className="room-code" style={{ fontSize: 'clamp(2rem, 8vw, 4rem)' }}>{roomCode}</div>

        <hr className="divider" style={{ margin: '1.5rem 0' }} />

        <div style={{ fontFamily: 'var(--font-body)', fontSize: '1.1rem', color: 'var(--ink-light)' }}>
          Salvē, <strong style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>{playerName}</strong>.
        </div>
        <div className="muted" style={{ marginTop: '0.75rem', fontSize: '0.95rem' }}>
          Waiting for the teacher to draw a pair<span className="waiting-dots"></span>
        </div>
      </div>
    </div>
  )
}

// ── Game Screen ───────────────────────────────────────
function PlayerGame({ room, playerName, playerId, onSubmitChain }) {
  const wordA = room.word_a
  const wordB = room.word_b

  return (
    <div className="screen">
      {/* Name / Room indicator */}
      <div className="flex justify-between items-center" style={{ flexWrap: 'wrap', gap: '0.5rem' }}>
        <span style={{ fontFamily: 'var(--font-body)', color: 'var(--ink-faint)', fontStyle: 'italic', fontSize: '0.9rem' }}>
          {playerName} · {room.id}
        </span>
        <Timer timerEnd={room.timer_end} frozenSeconds={room.timer_duration} paused={!room.timer_end} showControls={false} />
      </div>

      <hr className="divider" />

      {/* Word pair */}
      <div className="word-pair-container">
        <div className="word-card start">
          <div className="latin-word-display size-lg">{wordA.latin}</div>
          <div className="dict-form">{wordA.dictForm}</div>
          <div className="meaning">{wordA.meaning}</div>
        </div>
        <div className="word-pair-divider">→</div>
        <div className="word-card end">
          <div className="latin-word-display size-lg">{wordB.latin}</div>
          <div className="dict-form">{wordB.dictForm}</div>
          <div className="meaning">{wordB.meaning}</div>
        </div>
      </div>

      <hr className="divider" />

      {/* Chain builder */}
      <ChainBuilder
        wordA={wordA}
        wordB={wordB}
        onSubmit={onSubmitChain}
        disabled={false}
      />
    </div>
  )
}

// ── Reveal Screen ─────────────────────────────────────
function PlayerReveal({ room, submissions, playerId }) {
  const wordA = room.word_a
  const wordB = room.word_b

  const mySubmission = submissions.find(s => s.player_id === playerId)

  return (
    <div className="screen">
      <div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.75rem', letterSpacing: '0.12em', color: 'var(--ink-faint)', textTransform: 'uppercase' }}>
          Results
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'baseline', marginTop: '0.2rem', flexWrap: 'wrap' }}>
          <span className="latin-word-display size-lg">{wordA.latin}</span>
          <span style={{ color: 'var(--ink-faint)' }}>→</span>
          <span className="latin-word-display size-lg">{wordB.latin}</span>
        </div>

        {mySubmission && (
          <div style={{ marginTop: '0.5rem', fontFamily: 'var(--font-body)', fontStyle: 'italic', color: 'var(--ink-light)', fontSize: '0.9rem' }}>
            Your chain: {mySubmission.chain_length === 0 ? 'direct link' : `${mySubmission.chain_length} intermediate${mySubmission.chain_length > 1 ? 's' : ''}`}
          </div>
        )}
        {!mySubmission && (
          <div style={{ marginTop: '0.5rem', fontFamily: 'var(--font-body)', fontStyle: 'italic', color: 'var(--ink-faint)', fontSize: '0.9rem' }}>
            You did not submit a chain this round.
          </div>
        )}
      </div>

      <hr className="divider" />

      <RevealGallery submissions={submissions} wordA={wordA} wordB={wordB} />

      <div style={{ marginTop: '2rem', textAlign: 'center', fontFamily: 'var(--font-body)', fontStyle: 'italic', color: 'var(--ink-faint)', fontSize: '0.9rem' }}>
        Waiting for the teacher to start the next round<span className="waiting-dots"></span>
      </div>
    </div>
  )
}

// ── Main PlayerView ───────────────────────────────────
export default function PlayerView({ room, players, submissions, playerId, playerName, roomCode, onSubmitChain }) {
  if (!room || room.status === 'waiting') {
    return <PlayerLobby playerName={playerName} roomCode={roomCode} />
  }

  const currentSubmissions = submissions.filter(s => s.round === room.round)

  if (room.status === 'active') {
    return (
      <PlayerGame
        room={room}
        playerName={playerName}
        playerId={playerId}
        onSubmitChain={onSubmitChain}
      />
    )
  }

  if (room.status === 'revealed') {
    return (
      <PlayerReveal
        room={room}
        submissions={currentSubmissions}
        playerId={playerId}
      />
    )
  }

  return null
}
