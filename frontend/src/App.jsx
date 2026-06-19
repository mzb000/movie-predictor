import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import MovieDetail from './pages/MovieDetail'
import PredictPage from './pages/PredictPage'

const NAV_STYLE = {
  background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
  padding: '1rem 2rem',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
}

const LINK_STYLE = {
  color: '#e0e0e0',
  textDecoration: 'none',
  padding: '0.5rem 1rem',
  borderRadius: '8px',
  fontWeight: 500,
  transition: 'all 0.2s',
}

const ACTIVE_LINK_STYLE = {
  ...LINK_STYLE,
  background: 'rgba(255,255,255,0.1)',
  color: '#6c63ff',
}

function Navbar() {
  const location = useLocation()
  const links = [
    { to: '/', label: 'Home' },
    { to: '/predict', label: 'Predict' },
  ]

  return (
    <nav style={NAV_STYLE}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{ fontSize: '1.5rem' }}>🎬</span>
        <Link to="/" style={{ color: '#6c63ff', textDecoration: 'none', fontSize: '1.3rem', fontWeight: 700 }}>
          Movies Prediction
        </Link>
      </div>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        {links.map(({ to, label }) => (
          <Link
            key={to}
            to={to}
            style={location.pathname === to ? ACTIVE_LINK_STYLE : LINK_STYLE}
            onMouseEnter={(e) => { e.target.style.background = 'rgba(255,255,255,0.08)' }}
            onMouseLeave={(e) => { if (location.pathname !== to) e.target.style.background = 'transparent' }}
          >
            {label}
          </Link>
        ))}
      </div>
    </nav>
  )
}

function App() {
  return (
    <Router>
      <div style={{ minHeight: '100vh', background: '#0f0f23', color: '#e0e0e0' }}>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/movie/:id" element={<MovieDetail />} />
          <Route path="/predict" element={<PredictPage />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
