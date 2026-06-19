import React from 'react'
import { useNavigate } from 'react-router-dom'

const CARD_STYLE = {
  background: 'rgba(255,255,255,0.03)',
  borderRadius: '8px',
  padding: '0.8rem 1rem',
  cursor: 'pointer',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  border: '1px solid rgba(255,255,255,0.05)',
  transition: 'background 0.2s',
}

function RecommendationPanel({ recommendations, sourceMovie, loading }) {
  const navigate = useNavigate()

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>
        ⏳ Loading recommendations...
      </div>
    )
  }

  if (!recommendations || recommendations.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>
        No recommendations available
      </div>
    )
  }

  return (
    <div>
      {sourceMovie && (
        <h3 style={{ color: '#ccc', marginBottom: '1rem', fontSize: '0.95rem' }}>
          Because you liked <strong style={{ color: '#fff' }}>{sourceMovie.title}</strong>
        </h3>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {recommendations.map((rec, idx) => (
          <div
            key={rec.id || idx}
            style={CARD_STYLE}
            onClick={() => navigate(`/movie/${rec.id}`)}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(108,99,255,0.08)' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)' }}
          >
            <div>
              <div style={{ color: '#fff', fontWeight: 500 }}>{rec.title}</div>
              <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.3rem', flexWrap: 'wrap' }}>
                {(rec.genres || []).slice(0, 3).map((g) => (
                  <span key={g} style={{ fontSize: '0.65rem', color: '#6c63ff', background: 'rgba(108,99,255,0.15)', padding: '1px 6px', borderRadius: '4px' }}>{g}</span>
                ))}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ color: '#6c63ff', fontSize: '0.85rem' }}>
                ⭐ {rec.vote_average?.toFixed(1) || 'N/A'}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#888' }}>
                {(rec.similarity_score * 100).toFixed(0)}% match
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default RecommendationPanel
