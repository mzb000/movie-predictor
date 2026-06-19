import os
import joblib
import numpy as np
import pandas as pd
from sklearn.preprocessing import MinMaxScaler

MODELS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "ml", "models")


class MLService:
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
        self.rating_model = None
        self.hitflop_model = None
        self.preprocessors = None
        self.movie_data = None
        self.similarity_matrix = None
        self.scaler = None
        self.feature_cols = None
        self.metrics = None
        self._load_models()

    def _load_models(self):
        try:
            self.rating_model = joblib.load(os.path.join(MODELS_DIR, "rating_model.pkl"))
            self.hitflop_model = joblib.load(os.path.join(MODELS_DIR, "hitflop_model.pkl"))
            preprocessors = joblib.load(os.path.join(MODELS_DIR, "preprocessors.pkl"))
            self.scaler = preprocessors["scaler"]
            self.feature_cols = preprocessors["feature_columns"]
            self.movie_data = joblib.load(os.path.join(MODELS_DIR, "movie_data.pkl"))
            self.metrics = joblib.load(os.path.join(MODELS_DIR, "model_metrics.pkl"))
            self.similarity_matrix = np.load(os.path.join(MODELS_DIR, "similarity_matrix.npy"))
            print(f"Models loaded. {len(self.feature_cols)} features, {self.movie_data.shape[0]} movies")
        except Exception as e:
            print(f"Error loading models: {e}")
            raise

    def predict_rating(self, movie_features):
        features = self._prepare_features(movie_features)
        if features is None:
            return None
        prediction = self.rating_model.predict(features)[0]
        prediction = float(np.clip(prediction, 1, 10))
        return round(prediction, 1)

    def predict_hitflop(self, movie_features):
        features = self._prepare_features(movie_features)
        if features is None:
            return None
        prediction = self.hitflop_model.predict(features)[0]
        proba = self.hitflop_model.predict_proba(features)[0]
        labels = {0: "Flop", 1: "Average", 2: "Hit"}
        confidence = float(np.max(proba))
        return {
            "prediction": labels[int(prediction)],
            "label_id": int(prediction),
            "confidence": round(confidence, 3),
            "probabilities": {
                "flop": round(float(proba[0]), 3),
                "average": round(float(proba[1]), 3) if len(proba) > 2 else 0,
                "hit": round(float(proba[2]), 3) if len(proba) > 2 else round(float(proba[1]), 3),
            }
        }

    def _prepare_features(self, movie_features):
        try:
            row = {col: 0 for col in self.feature_cols}
            for k, v in movie_features.items():
                if k in row:
                    row[k] = v
            df = pd.DataFrame([row])
            df = df[self.feature_cols].fillna(0)
            scaled = self.scaler.transform(df)
            return scaled
        except Exception as e:
            print(f"Feature preparation error: {e}")
            return None

    def get_model_metrics(self):
        return self.metrics

    def search_movies(self, query, limit=20):
        if self.movie_data is None:
            return []
        query_lower = query.lower()
        mask = self.movie_data["title"].str.lower().str.contains(query_lower, na=False)
        results = self.movie_data[mask].head(limit)
        return results.to_dict("records")

    def get_movie_by_id(self, movie_id):
        if self.movie_data is None:
            return None
        match = self.movie_data[self.movie_data["id"] == movie_id]
        if len(match) == 0:
            return None
        return match.iloc[0].to_dict()


ml_service = MLService()
