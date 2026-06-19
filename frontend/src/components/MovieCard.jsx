import React from 'react'
import { useNavigate } from 'react-router-dom'

const CARD_STYLE = {
  background: 'linear-gradient(145deg, #1e1e3a 0%, #2a2a4a 100%)',
  borderRadius: '12px',
  overflow: 'hidden',
  cursor: 'pointer',
  transition: 'transform 0.2s, box-shadow 0.2s',
  border: '1px solid rgba(255,255,255,0.05)',
}

function getHitFlopBadge(avgRating) {
  if (avgRating >= 7) return { label: 'Hit', color: '#4caf50' }
  if (avgRating >= 5) return { label: 'Average', color: '#ff9800' }
  return { label: 'Flop', color: '#f44336' }
}

function MovieCard({ movie, onPredict }) {
  const navigate = useNavigate()
  const badge = getHitFlopBadge(movie.vote_average || 0)
  const genresList = movie.genres_list || []

  const handleClick = () => navigate(`/movie/${movie.id}`)

  return (
    <div
      style={CARD_STYLE}
      onClick={handleClick}
      onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 25px rgba(108,99,255,0.2)' }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }}
    >
      <div style={{ padding: '1.2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: '#fff', flex: 1 }}>
            {movie.title}
          </h3>
          <span style={{
            background: badge.color,
            color: '#fff',
            padding: '2px 10px',
            borderRadius: '12px',
            fontSize: '0.7rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            marginLeft: '8px',
            whiteSpace: 'nowrap',
          }}>
            {badge.label}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
          {genresList.slice(0, 3).map((g) => (
            <span key={g} style={{
              background: 'rgba(108,99,255,0.2)',
              color: '#6c63ff',
              padding: '2px 8px',
              borderRadius: '6px',
              fontSize: '0.7rem',
            }}>
              {g}
            </span>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.8rem', fontSize: '0.85rem', color: '#aaa' }}>
          <span>⭐ {movie.vote_average?.toFixed(1) || 'N/A'}</span>
          <span>📊 {movie.popularity?.toFixed(0) || 'N/A'}</span>
        </div>

        {movie.director && (
          <div style={{ marginTop: '0.3rem', fontSize: '0.75rem', color: '#888' }}>
            🎬 {movie.director}
          </div>
        )}
      </div>
    </div>
  )
}

export default MovieCard
