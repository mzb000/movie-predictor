from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api import movies, predict, recommend
from .config import APP_TITLE, APP_VERSION, APP_DESCRIPTION

app = FastAPI(
    title=APP_TITLE,
    version=APP_VERSION,
    description=APP_DESCRIPTION,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(movies.router)
app.include_router(predict.router)
app.include_router(recommend.router)


@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "version": APP_VERSION,
        "app": APP_TITLE,
    }


@app.get("/api")
def root():
    return {
        "app": APP_TITLE,
        "version": APP_VERSION,
        "endpoints": {
            "health": "/api/health",
            "search": "/api/movies/search?query=",
            "popular": "/api/movies/popular",
            "top_rated": "/api/movies/top-rated",
            "movie_detail": "/api/movies/{id}",
            "predict_rating": "/api/predict/rating",
            "predict_hitflop": "/api/predict/hitflop",
            "predict_movie": "/api/predict/movie-rating/{id}",
            "model_stats": "/api/predict/stats",
            "similar": "/api/recommend/similar/{id}",
            "by_genre": "/api/recommend/by-genre?genre=",
        }
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
