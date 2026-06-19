import React, { useState } from 'react'
import { predictRandomMovie } from '../services/api'

const CONTAINER_STYLE = {
  maxWidth: '800px',
  margin: '0 auto',
  padding: '2rem',
}

const BUTTON_STYLE = {
  padding: '1rem 3rem',
  fontSize: '1.2rem',
  fontWeight: 700,
  border: 'none',
  borderRadius: '12px',
  background: 'linear-gradient(135deg, #6c63ff, #4834d4)',
  color: '#fff',
  cursor: 'pointer',
  transition: 'transform 0.2s, box-shadow 0.2s',
  boxShadow: '0 4px 15px rgba(108,99,255,0.4)',
}

const CARD_STYLE = {
  background: 'linear-gradient(145deg, #1e1e3a 0%, #2a2a4a 100%)',
  borderRadius: '16px',
  padding: '2rem',
  marginTop: '2rem',
  border: '1px solid rgba(255,255,255,0.08)',
  animation: 'fadeIn 0.4s ease',
}

function Home() {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const handlePredict = async () => {
    setLoading(true)
    try {
      const res = await predictRandomMovie()
      setResult(res.data)
    } catch (err) {
      console.error('Prediction error:', err)
    } finally {
      setLoading(false)
    }
  }

  const movie = result?.movie
  const prediction = result?.prediction

  const hitflopColor = prediction?.hitflop_prediction?.prediction === 'Hit' ? '#4caf50'
    : prediction?.hitflop_prediction?.prediction === 'Flop' ? '#f44336' : '#ff9800'

  return (
    <div style={CONTAINER_STYLE}>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div style={{ textAlign: 'center', marginTop: '3rem' }}>
        <h1 style={{ fontSize: '2.2rem', color: '#fff', marginBottom: '0.5rem' }}>
          🎬 Movie Prediction
        </h1>
        <p style={{ color: '#888', fontSize: '1rem', marginBottom: '2.5rem' }}>
          Click the button to predict a random movie's rating & hit/flop status
        </p>

        <button
          style={{
            ...BUTTON_STYLE,
            opacity: loading ? 0.7 : 1,
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
          onClick={handlePredict}
          disabled={loading}
          onMouseEnter={(e) => { if (!loading) { e.target.style.transform = 'scale(1.05)' } }}
          onMouseLeave={(e) => { e.target.style.transform = 'scale(1)' }}
        >
          {loading ? '⏳ Predicting...' : '🎲 Predict Random Movie'}
        </button>
      </div>

      {result && (
        <div style={CARD_STYLE} key={movie?.id}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ flex: 1, minWidth: '250px' }}>
              <h2 style={{ color: '#fff', margin: 0, fontSize: '1.6rem' }}>{movie?.title}</h2>
              {movie?.tagline && (
                <p style={{ color: '#888', fontStyle: 'italic', marginTop: '0.3rem', fontSize: '0.9rem' }}>
                  "{movie.tagline}"
                </p>
              )}

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.8rem', flexWrap: 'wrap' }}>
                {(movie?.genres_list || []).map((g) => (
                  <span key={g} style={{
                    background: 'rgba(108,99,255,0.2)',
                    color: '#6c63ff',
                    padding: '4px 12px',
                    borderRadius: '16px',
                    fontSize: '0.75rem',
                  }}>
                    {g}
                  </span>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '2rem', marginTop: '1.2rem', fontSize: '0.85rem', color: '#aaa' }}>
                {movie?.director && <span>🎬 {movie.director}</span>}
                {movie?.runtime > 0 && <span>⏱ {movie.runtime}m</span>}
                {movie?.release_year > 0 && <span>📅 {movie.release_year}</span>}
              </div>

              {movie?.overview && (
                <p style={{ color: '#999', marginTop: '1rem', lineHeight: 1.6, fontSize: '0.9rem' }}>
                  {movie.overview}
                </p>
              )}
            </div>

            <div style={{
              minWidth: '240px',
              background: 'rgba(0,0,0,0.2)',
              borderRadius: '12px',
              padding: '1.5rem',
              textAlign: 'center',
            }}>
              <h3 style={{ color: '#fff', marginTop: 0, marginBottom: '1rem' }}>🤖 AI Prediction</h3>

              <div style={{ marginBottom: '1.2rem' }}>
                <div style={{ fontSize: '0.8rem', color: '#888' }}>Predicted Rating</div>
                <div style={{ fontSize: '2.5rem', color: '#ffc107', fontWeight: 700 }}>
                  {prediction?.predicted_rating?.toFixed(1)}
                  <span style={{ fontSize: '0.9rem', color: '#888' }}>/10</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#666' }}>
                  Actual: {prediction?.actual_rating?.toFixed(1)}
                </div>
              </div>

              <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1rem' }}>
                <div style={{ fontSize: '0.8rem', color: '#888', marginBottom: '0.5rem' }}>Classification</div>
                <span style={{
                  display: 'inline-block',
                  padding: '6px 20px',
                  borderRadius: '20px',
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  background: hitflopColor + '33',
                  color: hitflopColor,
                }}>
                  {prediction?.hitflop_prediction?.prediction}
                </span>
                <div style={{ fontSize: '0.75rem', color: '#888', marginTop: '0.4rem' }}>
                  {(prediction?.hitflop_prediction?.confidence * 100)?.toFixed(0)}% confidence
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Home
