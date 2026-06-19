import React from 'react'
import MovieCard from './MovieCard'

const GRID_STYLE = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
  gap: '1rem',
  padding: '1rem 0',
}

function MovieList({ movies, title, loading, emptyMessage = 'No movies found' }) {
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', color: '#888' }}>
        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
        Loading movies...
      </div>
    )
  }

  if (!movies || movies.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', color: '#888' }}>
        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📭</div>
        {emptyMessage}
      </div>
    )
  }

  return (
    <div>
      {title && (
        <h2 style={{ color: '#fff', marginBottom: '1rem', fontSize: '1.3rem' }}>
          {title}
          <span style={{ color: '#888', fontSize: '0.9rem', marginLeft: '0.5rem' }}>
            ({movies.length})
          </span>
        </h2>
      )}
      <div style={GRID_STYLE}>
        {movies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>
    </div>
  )
}

export default MovieList
