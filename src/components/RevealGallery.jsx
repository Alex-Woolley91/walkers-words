export default function RevealGallery({ submissions, wordA, wordB }) {
  if (!submissions || submissions.length === 0) {
    return (
      <div className="text-center muted" style={{ padding: '3rem' }}>
        <em>No submissions were received for this round.</em>
      </div>
    )
  }

  const sorted = [...submissions].sort((a, b) => b.chain_length - a.chain_length)
  const maxLength = sorted[0].chain_length

  return (
    <div className="gallery">
      {sorted.map(sub => {
        const isWinner = sub.chain_length === maxLength
        const chain = Array.isArray(sub.chain) ? sub.chain : []

        // Full sequence: wordA → ...chain... → wordB
        const fullChain = [
          { latin: wordA.latin, meaning: wordA.meaning, isEndpoint: true },
          ...chain,
          { latin: wordB.latin, meaning: wordB.meaning, isEndpoint: true },
        ]

        const lengthLabel = sub.chain_length === 0
          ? 'direct link'
          : sub.chain_length === 1
          ? '1 intermediate'
          : `${sub.chain_length} intermediates`

        return (
          <div key={sub.id} className={`submission-card ${isWinner ? 'winner' : ''}`}>
            <div className="flex justify-between items-center">
              <div>
                <div className="submission-player">{sub.player_name}</div>
                <div className="submission-length">{lengthLabel}</div>
              </div>
              <div style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.8rem',
                fontWeight: 900,
                color: isWinner ? 'var(--gold)' : 'var(--ink-faint)',
              }}>
                {sub.chain_length}
              </div>
            </div>

            <div className="submission-chain" style={{ marginTop: '1rem' }}>
              {fullChain.map((word, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <div className="chain-step">
                    <span className={`chain-step-word ${word.isEndpoint ? 'endpoint' : ''}`}
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: word.isEndpoint ? '0.95rem' : '0.85rem',
                        fontWeight: word.isEndpoint ? 700 : 600,
                        color: word.isEndpoint ? 'var(--pompeii-dark)' : 'var(--pompeii)',
                      }}>
                      {word.latin}
                    </span>
                    <span className="chain-step gloss" style={{
                      fontFamily: 'var(--font-body)',
                      fontStyle: 'italic',
                      fontSize: '0.68rem',
                      color: 'var(--ink-faint)',
                      maxWidth: '80px',
                      textAlign: 'center',
                      display: 'block',
                      lineHeight: 1.2,
                    }}>
                      {word.meaning}
                    </span>
                  </div>
                  {i < fullChain.length - 1 && (
                    <span className="chain-link-arrow">→</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
