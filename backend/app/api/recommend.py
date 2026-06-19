from fastapi import APIRouter, HTTPException, Query
from ..services.recommender import recommender_service
from ..services.ml_service import ml_service

router = APIRouter(prefix="/api/recommend", tags=["Recommendations"])


@router.get("/similar/{movie_id}")
def get_similar_movies(movie_id: int, n: int = Query(10, ge=1, le=50)):
    movie = ml_service.get_movie_by_id(movie_id)
    if movie is None:
        raise HTTPException(status_code=404, detail="Movie not found")

    recommendations = recommender_service.recommend(movie_id, n)
    return {
        "source_movie": {
            "id": movie["id"],
            "title": movie["title"],
            "genres": movie.get("genres_list", []),
        },
        "count": len(recommendations),
        "recommendations": recommendations,
    }


@router.get("/by-genre")
def recommend_by_genre(
    genre: str = Query(..., description="Genre name"),
    n: int = Query(10, ge=1, le=50),
    min_rating: float = Query(0, ge=0, le=10),
):
    if ml_service.movie_data is None:
        raise HTTPException(status_code=503, detail="Movie data not loaded")

    genre = genre.replace(" ", "_")
    genre_col = f"genre_{genre}"
    if genre_col not in ml_service.movie_data.columns:
        genres_available = [c.replace("genre_", "") for c in ml_service.movie_data.columns if c.startswith("genre_")]
        raise HTTPException(
            status_code=400,
            detail=f"Genre '{genre}' not found. Available: {genres_available}"
        )

    filtered = ml_service.movie_data[
        (ml_service.movie_data[genre_col] == 1) &
        (ml_service.movie_data["vote_average"] >= min_rating)
    ]
    top = filtered.nlargest(n, "vote_average")

    return {
        "genre": genre.replace("_", " "),
        "min_rating": min_rating,
        "count": len(top),
        "results": top.to_dict("records"),
    }
