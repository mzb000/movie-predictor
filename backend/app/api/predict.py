import random
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Dict, Any
from ..services.ml_service import ml_service

router = APIRouter(prefix="/api/predict", tags=["Prediction"])


class MovieFeatures(BaseModel):
    budget_log: float = Field(default=18.0, description="Log of budget")
    popularity_log: float = Field(default=3.0, description="Log of popularity")
    vote_count_log: float = Field(default=5.0, description="Log of vote count")
    runtime: float = Field(default=120.0, description="Runtime in minutes")
    is_english: int = Field(default=1, ge=0, le=1)
    revenue_to_budget: float = Field(default=2.0, description="Revenue to budget ratio")
    cast_size: int = Field(default=5, ge=0)
    release_year: int = Field(default=2020)
    release_month: int = Field(default=6, ge=1, le=12)
    genre_Action: int = Field(default=0, ge=0, le=1)
    genre_Adventure: int = Field(default=0, ge=0, le=1)
    genre_Animation: int = Field(default=0, ge=0, le=1)
    genre_Comedy: int = Field(default=0, ge=0, le=1)
    genre_Crime: int = Field(default=0, ge=0, le=1)
    genre_Documentary: int = Field(default=0, ge=0, le=1)
    genre_Drama: int = Field(default=0, ge=0, le=1)
    genre_Family: int = Field(default=0, ge=0, le=1)
    genre_Fantasy: int = Field(default=0, ge=0, le=1)
    genre_History: int = Field(default=0, ge=0, le=1)
    genre_Horror: int = Field(default=0, ge=0, le=1)
    genre_Music: int = Field(default=0, ge=0, le=1)
    genre_Mystery: int = Field(default=0, ge=0, le=1)
    genre_Romance: int = Field(default=0, ge=0, le=1)
    genre_Science_Fiction: int = Field(default=0, ge=0, le=1)
    genre_Thriller: int = Field(default=0, ge=0, le=1)
    genre_War: int = Field(default=0, ge=0, le=1)
    genre_Western: int = Field(default=0, ge=0, le=1)
    season_Spring: int = Field(default=0, ge=0, le=1)
    season_Summer: int = Field(default=0, ge=0, le=1)
    season_Fall: int = Field(default=0, ge=0, le=1)
    season_Winter: int = Field(default=0, ge=0, le=1)


@router.post("/rating")
def predict_rating(features: MovieFeatures):
    try:
        features_dict = features.model_dump()
        rating = ml_service.predict_rating(features_dict)
        if rating is None:
            raise HTTPException(status_code=503, detail="Model not loaded")
        return {"predicted_rating": rating}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/hitflop")
def predict_hitflop(features: MovieFeatures):
    try:
        features_dict = features.model_dump()
        result = ml_service.predict_hitflop(features_dict)
        if result is None:
            raise HTTPException(status_code=503, detail="Model not loaded")
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/movie-rating/{movie_id}")
def predict_movie_rating(movie_id: int):
    movie = ml_service.get_movie_by_id(movie_id)
    if movie is None:
        raise HTTPException(status_code=404, detail="Movie not found")
    features = {}
    for col in ml_service.feature_cols:
        if col in movie:
            val = movie[col]
            features[col] = val if isinstance(val, (int, float)) else 0
        else:
            features[col] = 0
    rating = ml_service.predict_rating(features)
    hitflop = ml_service.predict_hitflop(features)
    return {
        "movie_id": movie_id,
        "title": movie.get("title", ""),
        "actual_rating": float(movie.get("vote_average", 0)),
        "predicted_rating": rating,
        "hitflop_prediction": hitflop,
    }


@router.get("/random")
def predict_random_movie():
    if ml_service.movie_data is None:
        raise HTTPException(status_code=503, detail="Movie data not loaded")
    random_movie = ml_service.movie_data.sample(1).iloc[0].to_dict()
    movie_id = int(random_movie.get("id", 0))
    features = {}
    for col in ml_service.feature_cols:
        if col in random_movie:
            val = random_movie[col]
            features[col] = val if isinstance(val, (int, float)) else 0
        else:
            features[col] = 0
    rating = ml_service.predict_rating(features)
    hitflop = ml_service.predict_hitflop(features)
    return {
        "movie": random_movie,
        "prediction": {
            "movie_id": movie_id,
            "title": random_movie.get("title", ""),
            "actual_rating": float(random_movie.get("vote_average", 0)),
            "predicted_rating": rating,
            "hitflop_prediction": hitflop,
        }
    }


@router.get("/stats")
def model_stats():
    metrics = ml_service.get_model_metrics()
    if metrics is None:
        raise HTTPException(status_code=503, detail="Metrics not available")
    return metrics
