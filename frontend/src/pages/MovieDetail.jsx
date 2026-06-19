import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { getMovieById, predictMovieRating, getSimilarMovies } from '../services/api'
import RecommendationPanel from '../components/RecommendationPanel'

const CONTAINER_STYLE = {
  maxWidth: '1000px',
  margin: '0 auto',
  padding: '2rem',
}

function MovieDetail() {
  const { id } = useParams()
  const [movie, setMovie] = useState(null)
  const [predictions, setPredictions] = useState(null)
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(true)
  const [recLoading, setRecLoading] = useState(false)

  useEffect(() => {
    async function fetchMovie() {
      setLoading(true)
      try {
        const [movieRes, predRes] = await Promise.all([
          getMovieById(parseInt(id)),
          predictMovieRating(parseInt(id)),
        ])
        setMovie(movieRes.data)
        setPredictions(predRes.data)
      } catch (err) {
        console.error('Error:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchMovie()
  }, [id])

  const handleGetRecommendations = async () => {
    setRecLoading(true)
    try {
      const res = await getSimilarMovies(parseInt(id), 10)
      setRecommendations(res.data.recommendations || [])
    } catch (err) {
      console.error('Rec error:', err)
    } finally {
      setRecLoading(false)
    }
  }

  if (loading) {
    return (
      <div style={{ ...CONTAINER_STYLE, textAlign: 'center', paddingTop: '4rem' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
        <div style={{ color: '#888' }}>Loading movie details...</div>
      </div>
    )
  }

  if (!movie) {
    return (
      <div style={{ ...CONTAINER_STYLE, textAlign: 'center', paddingTop: '4rem', color: '#888' }}>
        Movie not found
      </div>
    )
  }

  const genresList = movie.genres_list || []

  return (
    <div style={CONTAINER_STYLE}>
      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '300px' }}>
          <h1 style={{ color: '#fff', margin: 0, fontSize: '1.8rem' }}>{movie.title}</h1>
          {movie.tagline && (
            <p style={{ color: '#888', fontStyle: 'italic', marginTop: '0.3rem' }}>"{movie.tagline}"</p>
          )}

          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', flexWrap: 'wrap' }}>
            {genresList.map((g) => (
              <span key={g} style={{
                background: 'rgba(108,99,255,0.2)',
                color: '#6c63ff',
                padding: '4px 12px',
                borderRadius: '16px',
                fontSize: '0.8rem',
              }}>
                {g}
              </span>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '2rem', marginTop: '1.5rem' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: '#888' }}>Rating</div>
              <div style={{ fontSize: '1.5rem', color: '#ffc107', fontWeight: 700 }}>
                ⭐ {movie.vote_average?.toFixed(1)}
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: '#888' }}>Popularity</div>
              <div style={{ fontSize: '1.5rem', color: '#6c63ff', fontWeight: 700 }}>
                📊 {movie.popularity?.toFixed(0)}
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: '#888' }}>Runtime</div>
              <div style={{ fontSize: '1.5rem', color: '#4caf50', fontWeight: 700 }}>
                ⏱ {movie.runtime}m
              </div>
            </div>
          </div>

          {movie.overview && (
            <div style={{ marginTop: '1.5rem' }}>
              <h3 style={{ color: '#ccc', marginBottom: '0.5rem' }}>Overview</h3>
              <p style={{ color: '#aaa', lineHeight: 1.6 }}>{movie.overview}</p>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1.5rem', fontSize: '0.85rem' }}>
            {movie.director && (
              <div><span style={{ color: '#888' }}>Director:</span> <span style={{ color: '#ccc' }}>{movie.director}</span></div>
            )}
            <div><span style={{ color: '#888' }}>Budget:</span> <span style={{ color: '#ccc' }}>${(movie.budget || 0).toLocaleString()}</span></div>
            <div><span style={{ color: '#888' }}>Revenue:</span> <span style={{ color: '#ccc' }}>${(movie.revenue || 0).toLocaleString()}</span></div>
            <div><span style={{ color: '#888' }}>Cast:</span> <span style={{ color: '#ccc' }}>{movie.cast_size || 0} actors</span></div>
            <div><span style={{ color: '#888' }}>Release:</span> <span style={{ color: '#ccc' }}>{movie.release_date || 'N/A'}</span></div>
            <div><span style={{ color: '#888' }}>Language:</span> <span style={{ color: '#ccc' }}>{(movie.original_language || '').toUpperCase()}</span></div>
          </div>
        </div>

        <div style={{ flex: 1, minWidth: '300px' }}>
          {predictions && (
            <div style={{
              background: 'linear-gradient(145deg, #1e1e3a 0%, #2a2a4a 100%)',
              borderRadius: '12px',
              padding: '1.5rem',
              border: '1px solid rgba(255,255,255,0.05)',
            }}>
              <h3 style={{ color: '#fff', marginTop: 0 }}>🤖 AI Predictions</h3>

              <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.8rem', color: '#888', marginBottom: '0.3rem' }}>Predicted Rating</div>
                <div style={{ fontSize: '2rem', color: '#ffc107', fontWeight: 700 }}>
                  {predictions.predicted_rating?.toFixed(1) || 'N/A'}
                  <span style={{ fontSize: '0.9rem', color: '#888' }}> /10</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '0.2rem' }}>
                  Actual: {predictions.actual_rating?.toFixed(1) || 'N/A'}
                </div>
              </div>

              <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1rem' }}>
                <div style={{ fontSize: '0.8rem', color: '#888', marginBottom: '0.5rem' }}>Hit/Flop Classification</div>
                {predictions.hitflop_prediction && (
                  <div>
                    <span style={{
                      display: 'inline-block',
                      padding: '4px 16px',
                      borderRadius: '16px',
                      fontSize: '1rem',
                      fontWeight: 700,
                      background: predictions.hitflop_prediction.prediction === 'Hit' ? 'rgba(76,175,80,0.2)' :
                                   predictions.hitflop_prediction.prediction === 'Flop' ? 'rgba(244,67,54,0.2)' :
                                   'rgba(255,152,0,0.2)',
                      color: predictions.hitflop_prediction.prediction === 'Hit' ? '#4caf50' :
                             predictions.hitflop_prediction.prediction === 'Flop' ? '#f44336' :
                             '#ff9800',
                    }}>
                      {predictions.hitflop_prediction.prediction}
                    </span>
                    <span style={{ marginLeft: '0.5rem', fontSize: '0.8rem', color: '#888' }}>
                      ({(predictions.hitflop_prediction.confidence * 100).toFixed(0)}% confidence)
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          <button
            onClick={handleGetRecommendations}
            disabled={recLoading}
            style={{
              width: '100%',
              padding: '0.8rem',
              marginTop: '1rem',
              borderRadius: '8px',
              border: 'none',
              background: recLoading ? '#555' : 'linear-gradient(135deg, #6c63ff, #4834d4)',
              color: '#fff',
              fontWeight: 600,
              fontSize: '1rem',
              cursor: recLoading ? 'not-allowed' : 'pointer',
              transition: 'opacity 0.2s',
            }}
          >
            {recLoading ? 'Loading...' : '🎯 Get Similar Movie Recommendations'}
          </button>

          {recommendations.length > 0 && (
            <div style={{ marginTop: '1.5rem' }}>
              <RecommendationPanel
                recommendations={recommendations}
                sourceMovie={movie}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default MovieDetail
