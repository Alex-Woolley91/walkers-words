import { useState, useEffect, useCallback } from 'react'
import { supabase } from './lib/supabase.js'
import HomeScreen from './components/HomeScreen.jsx'
import HostView from './components/HostView.jsx'
import PlayerView from './components/PlayerView.jsx'
import vocab from './vocab.json'

const SAFE_CHARS = 'ABCDEFGHJKLMNPQRTUVWXY' // no O, I, S, Z

function generateCode() {
  let code = ''
  for (let i = 0; i < 4; i++) {
    code += SAFE_CHARS[Math.floor(Math.random() * SAFE_CHARS.length)]
  }
  return code
}

function drawPair(theme = 'all') {
  const pool = vocab.filter(w => {
    if (theme === 'all') return true
    if (theme === 'nouns') return w.pos === 'noun'
    if (theme === 'adjectives') return w.pos === 'adjective'
    if (theme === 'verbs') return w.pos === 'verb'
    return w.theme === theme
  })
  if (pool.length < 2) return null
  const shuffled = [...pool].sort(() => Math.random() - 0.5)
  return [shuffled[0], shuffled[1]]
}

export default function App() {
  const [view, setView] = useState('home') // home | host | player
  const [room, setRoom] = useState(null)
  const [players, setPlayers] = useState([])
  const [submissions, setSubmissions] = useState([])
  const [playerId, setPlayerId] = useState(null)
  const [playerName, setPlayerName] = useState(null)
  const [roomCode, setRoomCode] = useState(null)
  const [loading, setLoading] = useState(false)

  // ── Realtime subscription ─────────────────────────
  useEffect(() => {
    if (!roomCode) return

    const channel = supabase
      .channel('room:' + roomCode)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'rooms',
        filter: `id=eq.${roomCode}`,
      }, payload => {
        if (payload.eventType === 'DELETE') {
          // Session ended by host
          setView('home')
          setRoom(null)
          setPlayers([])
          setSubmissions([])
          setRoomCode(null)
        } else {
          setRoom(payload.new)
        }
      })
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'players',
        filter: `room_id=eq.${roomCode}`,
      }, payload => {
        setPlayers(prev => {
          if (prev.find(p => p.id === payload.new.id)) return prev
          return [...prev, payload.new]
        })
      })
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'submissions',
        filter: `room_id=eq.${roomCode}`,
      }, payload => {
        setSubmissions(prev => {
          const existing = prev.find(s =>
            s.room_id === payload.new.room_id &&
            s.player_id === payload.new.player_id &&
            s.round === payload.new.round
          )
          if (existing) {
            return prev.map(s =>
              s.room_id === payload.new.room_id &&
              s.player_id === payload.new.player_id &&
              s.round === payload.new.round
                ? payload.new
                : s
            )
          }
          return [...prev, payload.new]
        })
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'submissions',
        filter: `room_id=eq.${roomCode}`,
      }, payload => {
        setSubmissions(prev =>
          prev.map(s => s.id === payload.new.id ? payload.new : s)
        )
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [roomCode])

  // ── Host: create room ─────────────────────────────
  const handleHost = useCallback(async () => {
    setLoading(true)
    let code = generateCode()
    let attempts = 0

    while (attempts < 10) {
      const { error } = await supabase.from('rooms').insert({
        id: code,
        status: 'waiting',
        round: 1,
      })
      if (!error) break
      // code collision — try another
      code = generateCode()
      attempts++
    }

    if (attempts >= 10) {
      setLoading(false)
      alert('Could not create room. Please try again.')
      return
    }

    const { data: roomData } = await supabase
      .from('rooms')
      .select('*')
      .eq('id', code)
      .single()

    setRoom(roomData)
    setRoomCode(code)
    setView('host')
    setLoading(false)
  }, [])

  // ── Player: join room ─────────────────────────────
  const handleJoin = useCallback(async (name, code) => {
    const { data: roomData, error: roomError } = await supabase
      .from('rooms')
      .select('*')
      .eq('id', code)
      .single()

    if (roomError || !roomData) {
      return 'Room not found. Check the code and try again.'
    }

    const { data: playerData, error: playerError } = await supabase
      .from('players')
      .insert({ room_id: code, name })
      .select()
      .single()

    if (playerError) {
      return 'Could not join room. Please try again.'
    }

    // Load existing players and submissions
    const { data: existingPlayers } = await supabase
      .from('players')
      .select('*')
      .eq('room_id', code)

    const { data: existingSubs } = await supabase
      .from('submissions')
      .select('*')
      .eq('room_id', code)

    setRoom(roomData)
    setRoomCode(code)
    setPlayerId(playerData.id)
    setPlayerName(name)
    setPlayers(existingPlayers || [])
    setSubmissions(existingSubs || [])
    setView('player')

    return null // no error
  }, [])

  // ── Host: draw pair ───────────────────────────────
  const handleDrawPair = useCallback(async (theme) => {
    const pair = drawPair(theme)
    if (!pair) return

    const timerEnd = new Date(Date.now() + 3 * 60 * 1000).toISOString()

    await supabase.from('rooms').update({
      status: 'active',
      word_a: pair[0],
      word_b: pair[1],
      timer_end: timerEnd,
      timer_duration: 180,
    }).eq('id', roomCode)
  }, [roomCode])

  // ── Host: redraw pair (from active screen) ───────
  const handleRedrawPair = useCallback(async () => {
    const pair = drawPair('all')
    if (!pair) return
    const timerEnd = new Date(Date.now() + 3 * 60 * 1000).toISOString()
    await supabase.from('rooms').update({
      status: 'active',
      word_a: pair[0],
      word_b: pair[1],
      timer_end: timerEnd,
      timer_duration: 180,
      round: (room?.round || 1) + 1,
    }).eq('id', roomCode)
  }, [room, roomCode])

  // ── Host: reveal ──────────────────────────────────
  const handleReveal = useCallback(async () => {
    await supabase.from('rooms').update({ status: 'revealed' }).eq('id', roomCode)
  }, [roomCode])

  // ── Host: adjust timer ────────────────────────────
  const handleAdjustTimer = useCallback(async (seconds) => {
    if (!room?.timer_end) return
    const newEnd = new Date(new Date(room.timer_end).getTime() + seconds * 1000).toISOString()
    await supabase.from('rooms').update({ timer_end: newEnd }).eq('id', roomCode)
  }, [room, roomCode])

  // ── Host: next pair ───────────────────────────────
  const handleNextPair = useCallback(async () => {
    await supabase.from('rooms').update({
      status: 'waiting',
      word_a: null,
      word_b: null,
      timer_end: null,
      round: (room?.round || 1) + 1,
    }).eq('id', roomCode)
  }, [room, roomCode])

  // ── Host: end session ─────────────────────────────
  const handleEndSession = useCallback(async () => {
    if (!window.confirm('End the session? This will disconnect all students.')) return
    await supabase.from('rooms').delete().eq('id', roomCode)
    setView('home')
    setRoom(null)
    setPlayers([])
    setSubmissions([])
    setRoomCode(null)
  }, [roomCode])

  // ── Player: submit chain ──────────────────────────
  const handleSubmitChain = useCallback(async (chain) => {
    if (!playerId || !room) return

    await supabase.from('submissions').upsert({
      room_id: roomCode,
      player_id: playerId,
      player_name: playerName,
      chain: chain,
      chain_length: chain.length,
      round: room.round,
      submitted_at: new Date().toISOString(),
    }, { onConflict: 'room_id,player_id,round' })
  }, [playerId, playerName, room, roomCode])

  // ── Render ────────────────────────────────────────
  if (loading) {
    return (
      <div className="screen-center">
        <div style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-faint)', letterSpacing: '0.1em' }}>
          Creating room<span className="waiting-dots"></span>
        </div>
      </div>
    )
  }

  if (view === 'home') {
    return <HomeScreen onHost={handleHost} onJoin={handleJoin} />
  }

  if (view === 'host') {
    return (
      <HostView
        room={room}
        players={players}
        submissions={submissions}
        onDrawPair={handleDrawPair}
        onRedrawPair={handleRedrawPair}
        onReveal={handleReveal}
        onAdjustTimer={handleAdjustTimer}
        onNextPair={handleNextPair}
        onEndSession={handleEndSession}
      />
    )
  }

  if (view === 'player') {
    return (
      <PlayerView
        room={room}
        players={players}
        submissions={submissions}
        playerId={playerId}
        playerName={playerName}
        roomCode={roomCode}
        onSubmitChain={handleSubmitChain}
      />
    )
  }

  return null
}
