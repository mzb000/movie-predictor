import os
import numpy as np
import joblib
import pandas as pd

MODELS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "ml", "models")


class RecommenderService:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self):
        if self._initialized:
            return
        self._initialized = True
        self.similarity_matrix = None
        self.tfidf_vectorizer = None
        self.movie_data = None
        self._load()

    def _load(self):
        try:
            self.similarity_matrix = np.load(os.path.join(MODELS_DIR, "similarity_matrix.npy"))
            self.tfidf_vectorizer = joblib.load(os.path.join(MODELS_DIR, "tfidf_vectorizer.pkl"))
            self.movie_data = joblib.load(os.path.join(MODELS_DIR, "movie_data.pkl"))
            print(f"Recommender loaded: {self.similarity_matrix.shape[0]} movies")
        except Exception as e:
            print(f"Error loading recommender: {e}")

    def recommend(self, movie_id, n=10):
        if self.movie_data is None or self.similarity_matrix is None:
            return []

        movie_idx = self.movie_data[self.movie_data["id"] == movie_id].index
        if len(movie_idx) == 0:
            return []
        movie_idx = movie_idx[0]

        sim_scores = list(enumerate(self.similarity_matrix[movie_idx]))
        sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
        sim_scores = sim_scores[1:n+1]

        results = []
        for idx, score in sim_scores:
            movie = self.movie_data.iloc[idx]
            results.append({
                "id": int(movie["id"]),
                "title": movie["title"],
                "similarity_score": round(float(score), 4),
                "vote_average": float(movie["vote_average"]),
                "genres": movie.get("genres_list", []),
                "director": movie.get("director", "Unknown"),
            })

        return results

    def recommend_by_features(self, features_dict, n=10):
        return []


recommender_service = RecommenderService()
