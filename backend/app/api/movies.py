from fastapi import APIRouter, HTTPException, Query
from ..services.ml_service import ml_service
from typing import Optional

router = APIRouter(prefix="/api/movies", tags=["Movies"])


@router.get("/search")
def search_movies(query: str = Query(..., min_length=1), limit: int = Query(20, ge=1, le=100)):
    results = ml_service.search_movies(query, limit)
    return {
        "query": query,
        "count": len(results),
        "results": results,
    }


@router.get("/popular")
def get_popular_movies(limit: int = Query(20, ge=1, le=100)):
    if ml_service.movie_data is None:
        raise HTTPException(status_code=503, detail="Movie data not loaded")
    popular = ml_service.movie_data.nlargest(limit, "popularity")
    return {
        "count": limit,
        "results": popular.to_dict("records"),
    }


@router.get("/top-rated")
def get_top_rated(limit: int = Query(20, ge=1, le=100)):
    if ml_service.movie_data is None:
        raise HTTPException(status_code=503, detail="Movie data not loaded")
    top = ml_service.movie_data.nlargest(limit, "vote_average")
    return {
        "count": limit,
        "results": top.to_dict("records"),
    }


@router.get("/{movie_id}")
def get_movie(movie_id: int):
    movie = ml_service.get_movie_by_id(movie_id)
    if movie is None:
        raise HTTPException(status_code=404, detail="Movie not found")
    return movie
