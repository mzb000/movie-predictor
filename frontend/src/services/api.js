import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
})

export const healthCheck = () => api.get('/health')

export const searchMovies = (query, limit = 20) =>
  api.get('/movies/search', { params: { query, limit } })

export const getPopularMovies = (limit = 20) =>
  api.get('/movies/popular', { params: { limit } })

export const getTopRatedMovies = (limit = 20) =>
  api.get('/movies/top-rated', { params: { limit } })

export const getMovieById = (id) =>
  api.get(`/movies/${id}`)

export const predictRating = (features) =>
  api.post('/predict/rating', features)

export const predictHitFlop = (features) =>
  api.post('/predict/hitflop', features)

export const predictMovieRating = (movieId) =>
  api.get(`/predict/movie-rating/${movieId}`)

export const predictRandomMovie = () =>
  api.get('/predict/random')

export const getModelStats = () =>
  api.get('/predict/stats')

export const getSimilarMovies = (movieId, n = 10) =>
  api.get(`/recommend/similar/${movieId}`, { params: { n } })

export const recommendByGenre = (genre, n = 10, minRating = 0) =>
  api.get('/recommend/by-genre', { params: { genre, n, min_rating: minRating } })

export default api
