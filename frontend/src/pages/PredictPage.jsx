import React from 'react'
import RatingPredictor from '../components/RatingPredictor'
import HitFlopPredictor from '../components/HitFlopPredictor'

const CONTAINER_STYLE = {
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '2rem',
}

function PredictPage() {
  return (
    <div style={CONTAINER_STYLE}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{ color: '#fff', fontSize: '1.8rem', marginBottom: '0.5rem' }}>
          🧪 Movie Prediction Dashboard
        </h1>
        <p style={{ color: '#888' }}>
          Enter movie features to predict rating or hit/flop status
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <RatingPredictor />
        <HitFlopPredictor />
      </div>
    </div>
  )
}

export default PredictPage
