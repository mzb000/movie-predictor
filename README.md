# Movies Prediction & Recommendation App

🎬 **Advanced Machine Learning project** — Predict movie ratings, classify hits/flops, and get personalized recommendations.

## Features

| Feature | Details |
|---------|---------|
| **Rating Prediction** | Random Forest Regressor — predicts IMDb rating (1-10) with ~0.52 RMSE |
| **Hit/Flop Classification** | Random Forest Classifier — classifies movies as Hit / Average / Flop |
| **Movie Recommender** | Content-based filtering using TF-IDF + Cosine Similarity |
| **REST API** | FastAPI backend with 10+ endpoints |
| **React Frontend** | Modern SPA with movie search, detail view, prediction dashboard |
| **Docker Support** | Multi-container deployment |

## Tech Stack

- **Backend:** Python, FastAPI, scikit-learn, XGBoost, joblib
- **Frontend:** React 18, React Router, Axios, Vite
- **ML Models:** Random Forest Regressor, Random Forest Classifier, TF-IDF + Cosine Similarity
- **Deployment:** Docker, Docker Compose

## Project Structure

```
movies-prediction-app/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI entry point
│   │   ├── config.py            # Configuration
│   │   ├── api/                 # API endpoints
│   │   │   ├── movies.py        # Movie search/details
│   │   │   ├── predict.py       # Rating & hit/flop prediction
│   │   │   └── recommend.py     # Movie recommendations
│   │   ├── services/
│   │   │   ├── ml_service.py    # ML model inference
│   │   │   └── recommender.py   # Similarity-based recommender
│   │   └── ml/
│   │       ├── generate_dataset.py  # Synthetic dataset generator
│   │       ├── preprocess.py        # Feature engineering
│   │       ├── train.py             # Model training pipeline
│   │       └── models/              # Saved .pkl models
│   ├── data/tmdb_5000_movies.csv
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   ├── pages/               # Page views
│   │   └── services/api.js      # Axios API client
│   └── Dockerfile
├── docker-compose.yml
├── start.bat / start.sh         # Quick start scripts
└── README.md
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/movies/search?q=` | Search movies |
| GET | `/api/movies/popular` | Popular movies |
| GET | `/api/movies/top-rated` | Top rated movies |
| GET | `/api/movies/{id}` | Movie details |
| POST | `/api/predict/rating` | Predict rating from features |
| POST | `/api/predict/hitflop` | Predict hit/flop from features |
| GET | `/api/predict/movie-rating/{id}` | Predict for existing movie |
| GET | `/api/predict/stats` | Model performance metrics |
| GET | `/api/recommend/similar/{id}` | Similar movie recommendations |
| GET | `/api/recommend/by-genre?genre=` | Genre-based recommendations |

## Quick Start

### Windows
```bash
start.bat
```

### Linux/Mac
```bash
./start.sh
```

### Manual
```bash
# 1. Generate dataset & train models
cd backend
pip install -r requirements.txt
python app/ml/train.py

# 2. Start backend
uvicorn app.main:app --host 0.0.0.0 --port 8000

# 3. Start frontend (new terminal)
cd frontend
npm install
npm run dev
```

### Docker
```bash
docker-compose up --build
```

## Model Performance

- **Rating Model:** RMSE = 0.52, R² = 0.38
- **Hit/Flop Model:** Accuracy = 92%
- **Recommender:** Cosine similarity on 3000 TF-IDF features

## Notes

- Uses synthetic TMDB-like dataset (5000 movies) generated with realistic distributions
- No external API key required
- Models are trained on startup via `train.py` or included pre-trained
