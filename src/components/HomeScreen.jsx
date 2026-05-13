import { useState } from 'react'

export default function HomeScreen({ onHost, onJoin }) {
  const [mode, setMode] = useState(null) // null | 'join'
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleJoin = async (e) => {
    e.preventDefault()
    setError('')
    const trimName = name.trim()
    const trimCode = code.trim().toUpperCase()
    if (!trimName) return setError('Please enter your name.')
    if (trimCode.length !== 4) return setError('Room code must be 4 letters.')
    setLoading(true)
    const err = await onJoin(trimName, trimCode)
    if (err) {
      setError(err)
      setLoading(false)
    }
  }

  return (
    <div className="screen-center">
      <div style={{ maxWidth: '480px', width: '100%' }}>
        <div className="title-app">WALKER'S WORDS</div>
        <div className="subtitle-app">iunge verba Latina</div>

        <hr className="divider" style={{ marginTop: '2rem', marginBottom: '2rem' }} />

        {mode === null && (
          <div className="flex flex-col gap-2">
            <button className="btn-secondary btn-lg w-full" onClick={() => onHost()}>
              Host a Game
            </button>
            <button className="btn-primary btn-lg w-full" onClick={() => setMode('join')}>
              Join a Game
            </button>
          </div>
        )}

        {mode === 'join' && (
          <form onSubmit={handleJoin} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <div>
              <label>Your First Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Marcus"
                maxLength={30}
                autoFocus
              />
            </div>
            <div>
              <label>Room Code</label>
              <input
                type="text"
                value={code}
                onChange={e => setCode(e.target.value.toUpperCase().replace(/[^A-Z]/g, ''))}
                placeholder="e.g. ABCD"
                maxLength={4}
                style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.25em', fontSize: '1.4rem', textAlign: 'center' }}
              />
            </div>
            {error && <div className="error-text">{error}</div>}
            <button
              type="submit"
              className="btn-primary btn-lg w-full"
              disabled={loading}
            >
              {loading ? 'Joining…' : 'Join'}
            </button>
            <button
              type="button"
              className="btn-ghost w-full"
              onClick={() => { setMode(null); setError('') }}
            >
              ← Back
            </button>
          </form>
        )}

      </div>
    </div>
  )
}
