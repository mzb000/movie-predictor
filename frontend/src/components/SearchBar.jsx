import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { searchMovies } from '../services/api'

const INPUT_STYLE = {
  width: '100%',
  padding: '0.8rem 1.2rem',
  borderRadius: '12px',
  border: '2px solid rgba(108,99,255,0.3)',
  background: 'rgba(255,255,255,0.05)',
  color: '#fff',
  fontSize: '1rem',
  outline: 'none',
  transition: 'border-color 0.2s',
  boxSizing: 'border-box',
}

function SearchBar({ onSelect }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const debounceRef = useRef(null)
  const wrapperRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!query.trim()) { setResults([]); setShowDropdown(false); return }
    setLoading(true)
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await searchMovies(query, 10)
        setResults(res.data.results || [])
        setShowDropdown(true)
      } catch (err) {
        console.error('Search error:', err)
      } finally {
        setLoading(false)
      }
    }, 300)
  }, [query])

  const handleSelect = (movie) => {
    setShowDropdown(false)
    setQuery('')
    if (onSelect) onSelect(movie)
    navigate(`/movie/${movie.id}`)
  }

  return (
    <div ref={wrapperRef} style={{ position: 'relative', width: '100%', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ position: 'relative' }}>
        <input
          type="text"
          placeholder="Search movies..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => { if (results.length > 0) setShowDropdown(true) }}
          style={INPUT_STYLE}
          onMouseEnter={(e) => { e.target.style.borderColor = '#6c63ff' }}
          onMouseLeave={(e) => { e.target.style.borderColor = 'rgba(108,99,255,0.3)' }}
        />
        <span style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#888' }}>
          {loading ? '⏳' : '🔍'}
        </span>
      </div>

      {showDropdown && results.length > 0 && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          background: '#1e1e3a',
          border: '1px solid rgba(108,99,255,0.2)',
          borderRadius: '0 0 12px 12px',
          maxHeight: '400px',
          overflowY: 'auto',
          zIndex: 100,
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
        }}>
          {results.map((movie) => (
            <div
              key={movie.id}
              onClick={() => handleSelect(movie)}
              style={{
                padding: '0.8rem 1rem',
                cursor: 'pointer',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(108,99,255,0.1)' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
            >
              <span>{movie.title}</span>
              <span style={{ color: '#6c63ff', fontSize: '0.8rem' }}>
                ⭐ {movie.vote_average?.toFixed(1)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default SearchBar
