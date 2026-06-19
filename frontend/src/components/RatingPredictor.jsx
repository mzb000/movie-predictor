import React, { useState } from 'react'
import { predictRating } from '../services/api'

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
const GENRE_LABELS = Object.fromEntries(GENRES)
const GENRE_VALUES = Object.fromEntries(GENRES.map(([k, v]) => [v, k]))

function RatingPredictor() {
  const [features, setFeatures] = useState({
    budget_log: 18, popularity_log: 3, vote_count_log: 5, runtime: 120,
    is_english: 1, revenue_to_budget: 2, cast_size: 5, release_year: 2023, release_month: 6,
  })
  const [selectedGenres, setSelectedGenres] = useState([])
  const [prediction, setPrediction] = useState(null)
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
    setPrediction(null)
    try {
      const body = { ...features }
      GENRES.forEach(([label, val]) => { body[`genre_${val}`] = selectedGenres.includes(label) ? 1 : 0 })
      ;['Spring', 'Summer', 'Fall', 'Winter'].forEach((s) => {
        body[`season_${s}`] = 0
      })
      const month = features.release_month
      if (month >= 3 && month <= 5) body.season_Spring = 1
      else if (month >= 6 && month <= 8) body.season_Summer = 1
      else if (month >= 9 && month <= 11) body.season_Fall = 1
      else body.season_Winter = 1

      const res = await predictRating(body)
      setPrediction(res.data.predicted_rating)
    } catch (err) {
      setError(err.response?.data?.detail || 'Prediction failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={CARD_STYLE}>
      <h3 style={{ color: '#fff', marginTop: 0, marginBottom: '1rem' }}>⭐ Rating Predictor</h3>
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
            Genres (click to toggle)
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
          {loading ? 'Predicting...' : 'Predict Rating'}
        </button>
      </form>

      {error && (
        <div style={{ marginTop: '1rem', padding: '0.8rem', background: 'rgba(244,67,54,0.1)', borderRadius: '8px', color: '#f44336', fontSize: '0.85rem' }}>
          ❌ {error}
        </div>
      )}

      {prediction !== null && (
        <div style={{
          marginTop: '1rem',
          padding: '1.2rem',
          background: 'rgba(76,175,80,0.1)',
          borderRadius: '8px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '0.85rem', color: '#888', marginBottom: '0.3rem' }}>Predicted Rating</div>
          <div style={{ fontSize: '2.5rem', color: '#4caf50', fontWeight: 700 }}>
            {prediction.toFixed(1)}
            <span style={{ fontSize: '1rem', color: '#888' }}>/10</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default RatingPredictor
