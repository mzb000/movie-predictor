import React, { useState } from 'react'
import { predictHitFlop } from '../services/api'

const CARD_STYLE = {
  background: 'linear-gradient(145deg, #1e1e3a 0%, #2a2a4a 100%)',
  borderRadius: '12px',
  padding: '1.5rem',
  border: '1px solid rgba(255,255,255,0.05)',
}

const INPUT_STYLE = {
  width: '100%',
  padding: '0.6rem 0.8rem',
  borderRadius: '8px',
  border: '1px solid rgba(108,99,255,0.3)',
  background: 'rgba(255,255,255,0.05)',
  color: '#fff',
  fontSize: '0.9rem',
  outline: 'none',
  boxSizing: 'border-box',
}

const GENRES = [
  ['Action', 'Action'], ['Adventure', 'Adventure'], ['Animation', 'Animation'],
  ['Comedy', 'Comedy'], ['Crime', 'Crime'], ['Documentary', 'Documentary'],
  ['Drama', 'Drama'], ['Family', 'Family'], ['Fantasy', 'Fantasy'],
  ['History', 'History'], ['Horror', 'Horror'], ['Music', 'Music'],
  ['Mystery', 'Mystery'], ['Romance', 'Romance'],
  ['Science Fiction', 'Science_Fiction'], ['Thriller', 'Thriller'],
  ['War', 'War'], ['Western', 'Western'],
]

const LABEL_COLORS = {
  Hit: { bg: 'rgba(76,175,80,0.15)', text: '#4caf50', emoji: '🔥' },
  Average: { bg: 'rgba(255,152,0,0.15)', text: '#ff9800', emoji: '📊' },
  Flop: { bg: 'rgba(244,67,54,0.15)', text: '#f44336', emoji: '💀' },
}

function HitFlopPredictor() {
  const [features, setFeatures] = useState({
    budget_log: 18, popularity_log: 3, vote_count_log: 5, runtime: 120,
    is_english: 1, revenue_to_budget: 2, cast_size: 5, release_year: 2023, release_month: 6,
  })
  const [selectedGenres, setSelectedGenres] = useState([])
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const toggleGenre = (genre) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const body = { ...features }
      GENRES.forEach(([label, val]) => { body[`genre_${val}`] = selectedGenres.includes(label) ? 1 : 0 })
      ;['Spring', 'Summer', 'Fall', 'Winter'].forEach((s) => { body[`season_${s}`] = 0 })
      const month = features.release_month
      if (month >= 3 && month <= 5) body.season_Spring = 1
      else if (month >= 6 && month <= 8) body.season_Summer = 1
      else if (month >= 9 && month <= 11) body.season_Fall = 1
      else body.season_Winter = 1

      const res = await predictHitFlop(body)
      setResult(res.data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Prediction failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={CARD_STYLE}>
      <h3 style={{ color: '#fff', marginTop: 0, marginBottom: '1rem' }}>📈 Hit/Flop Predictor</h3>
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.8rem', marginBottom: '1rem' }}>
          {Object.entries(features).map(([key, val]) => (
            <div key={key}>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#888', marginBottom: '0.3rem' }}>
                {key.replace(/_/g, ' ')}
              </label>
              <input
                type="number"
                step="0.1"
                value={val}
                onChange={(e) => setFeatures({ ...features, [key]: parseFloat(e.target.value) || 0 })}
                style={INPUT_STYLE}
              />
            </div>
          ))}
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontSize: '0.75rem', color: '#888', marginBottom: '0.3rem' }}>
            Genres
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            {GENRES.map(([label, val]) => (
              <span
                key={val}
                onClick={() => toggleGenre(label)}
                style={{
                  padding: '4px 12px',
                  borderRadius: '16px',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  background: selectedGenres.includes(label) ? '#6c63ff' : 'rgba(255,255,255,0.08)',
                  color: selectedGenres.includes(label) ? '#fff' : '#aaa',
                  transition: 'all 0.2s',
                }}
              >
                {label}
              </span>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '0.7rem',
            borderRadius: '8px',
            border: 'none',
            background: loading ? '#555' : 'linear-gradient(135deg, #6c63ff, #4834d4)',
            color: '#fff',
            fontWeight: 600,
            fontSize: '1rem',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'opacity 0.2s',
          }}
        >
          {loading ? 'Predicting...' : 'Predict Hit/Flop'}
        </button>
      </form>

      {error && (
        <div style={{ marginTop: '1rem', padding: '0.8rem', background: 'rgba(244,67,54,0.1)', borderRadius: '8px', color: '#f44336', fontSize: '0.85rem' }}>
          ❌ {error}
        </div>
      )}

      {result && (
        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
          <div style={{
            padding: '1.2rem',
            borderRadius: '8px',
            background: (LABEL_COLORS[result.prediction] || LABEL_COLORS.Average).bg,
          }}>
            <div style={{ fontSize: '0.8rem', color: '#888', marginBottom: '0.3rem' }}>Prediction</div>
            <div style={{
              fontSize: '2rem',
              fontWeight: 700,
              color: (LABEL_COLORS[result.prediction] || LABEL_COLORS.Average).text,
            }}>
              {(LABEL_COLORS[result.prediction] || LABEL_COLORS.Average).emoji}{' '}
              {result.prediction}
            </div>
            <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#aaa' }}>
              Confidence: {(result.confidence * 100).toFixed(1)}%
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '0.8rem' }}>
            {Object.entries(result.probabilities || {}).map(([label, prob]) => {
              const info = LABEL_COLORS[label.charAt(0).toUpperCase() + label.slice(1)] || LABEL_COLORS.Average
              return (
                <div key={label} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.7rem', color: '#888', textTransform: 'capitalize' }}>{label}</div>
                  <div style={{ fontSize: '1rem', fontWeight: 600, color: info.text }}>
                    {(prob * 100).toFixed(1)}%
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default HitFlopPredictor
