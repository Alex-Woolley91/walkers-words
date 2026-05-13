import { useState, useRef, useEffect } from 'react'
import vocab from '../vocab.json'

export default function ChainBuilder({ wordA, wordB, onSubmit, disabled }) {
  const [chain, setChain] = useState([])
  const [input, setInput] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [activeIndex, setActiveIndex] = useState(-1)
  const [submitted, setSubmitted] = useState(false)
  const inputRef = useRef(null)

  const forbiddenIds = new Set([wordA.id, wordB.id, ...chain.map(w => w.id)])

  useEffect(() => {
    if (input.length < 2) {
      setSuggestions([])
      setActiveIndex(-1)
      return
    }
    const q = input.toLowerCase()
    const results = vocab
      .filter(w =>
        !forbiddenIds.has(w.id) &&
        (w.latin.toLowerCase().startsWith(q) || w.latin.toLowerCase().includes(q))
      )
      .sort((a, b) => {
        const aStarts = a.latin.toLowerCase().startsWith(q)
        const bStarts = b.latin.toLowerCase().startsWith(q)
        if (aStarts && !bStarts) return -1
        if (!aStarts && bStarts) return 1
        return a.latin.localeCompare(b.latin)
      })
      .slice(0, 8)
    setSuggestions(results)
    setActiveIndex(-1)
  }, [input, chain])

  const addWord = (word) => {
    setChain(prev => [...prev, word])
    setInput('')
    setSuggestions([])
    setActiveIndex(-1)
    inputRef.current?.focus()
  }

  const removeWord = (index) => {
    setChain(prev => prev.filter((_, i) => i !== index))
  }

  const handleKeyDown = (e) => {
    if (suggestions.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex(i => Math.min(i + 1, suggestions.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex(i => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (activeIndex >= 0 && activeIndex < suggestions.length) {
        addWord(suggestions[activeIndex])
      } else if (suggestions.length > 0) {
        addWord(suggestions[0])
      }
    } else if (e.key === 'Escape') {
      setSuggestions([])
      setActiveIndex(-1)
    }
  }

  const handleSubmit = () => {
    onSubmit(chain)
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 2500)
  }

  const chainLength = chain.length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Chain visualisation */}
      <div className="chain-display">
        <span className="chain-endpoint">{wordA.latin}</span>

        {chain.length === 0 && (
          <span className="muted" style={{ fontSize: '0.9rem', padding: '0 0.5rem' }}>
            Add words between the two endpoints
          </span>
        )}

        {chain.map((word, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <span className="chain-arrow">→</span>
            <span className="chain-word-chip">
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.85rem' }}>{word.latin}</span>
              <span style={{ fontFamily: 'var(--font-body)', fontStyle: 'italic', fontSize: '0.72rem', color: 'var(--ink-faint)' }}>
                {word.meaning.split(',')[0]}
              </span>
              <button
                className="remove"
                onClick={() => removeWord(i)}
                disabled={disabled}
                title={`Remove ${word.latin}`}
              >×</button>
            </span>
          </div>
        ))}

        <span className="chain-arrow">→</span>
        <span className="chain-endpoint">{wordB.latin}</span>
      </div>

      {/* Input */}
      {!disabled && (
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
          <div className="autocomplete-wrapper" style={{ flex: 1 }}>
            <input
              ref={inputRef}
              type="text"
              placeholder="Type a Latin word to add to your chain…"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              autoComplete="off"
              autoCapitalize="off"
              spellCheck={false}
            />
            {suggestions.length > 0 && (
              <div className="autocomplete-list">
                {suggestions.map((word, i) => (
                  <div
                    key={word.id}
                    className={`autocomplete-item ${i === activeIndex ? 'active' : ''}`}
                    onMouseDown={() => addWord(word)}
                  >
                    <span className="latin">{word.latin}</span>
                    <span className="meaning-hint">{word.meaning}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Submit */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ fontFamily: 'var(--font-body)', fontStyle: 'italic', color: 'var(--ink-faint)', fontSize: '0.9rem' }}>
          {chainLength === 0
            ? 'Chain length: direct link'
            : chainLength === 1
            ? 'Chain length: 1 intermediate'
            : `Chain length: ${chainLength} intermediates`}
        </div>
        <button
          className="btn-primary"
          onClick={handleSubmit}
          disabled={disabled}
        >
          {submitted ? 'Submitted ✓' : 'Submit Chain'}
        </button>
      </div>

      {submitted && (
        <div style={{
          fontFamily: 'var(--font-body)',
          fontStyle: 'italic',
          color: 'var(--ink-light)',
          fontSize: '0.9rem',
          textAlign: 'center',
        }}>
          Submission received — you can resubmit any time before the timer ends.
        </div>
      )}
    </div>
  )
}
