import pandas as pd
import numpy as np
import os
import joblib
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import LabelEncoder, MinMaxScaler
from sklearn.metrics import mean_squared_error, r2_score, accuracy_score, classification_report, confusion_matrix
import json

from preprocess import load_data, engineer_features, prepare_for_training, build_tfidf_matrix

MODELS_DIR = os.path.join(os.path.dirname(__file__), "models")
os.makedirs(MODELS_DIR, exist_ok=True)

def train_rating_model(X_train, y_train, X_test, y_test):
    print("\n=== Training Rating Prediction Model ===")
    model = RandomForestRegressor(n_estimators=200, max_depth=20, random_state=42, n_jobs=-1)
    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)
    mse = mean_squared_error(y_test, y_pred)
    r2 = r2_score(y_test, y_pred)
    print(f"RMSE: {np.sqrt(mse):.4f}")
    print(f"R2 Score: {r2:.4f}")
    return model, {"rmse": round(float(np.sqrt(mse)), 4), "r2": round(float(r2), 4)}

def train_hitflop_model(X_train, y_train, X_test, y_test):
    print("\n=== Training Hit/Flop Classification Model ===")
    model = RandomForestClassifier(
        n_estimators=200, max_depth=15, random_state=42, n_jobs=-1, class_weight="balanced"
    )
    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    print(f"Accuracy: {acc:.4f}")
    print(classification_report(y_test, y_pred, target_names=["Flop", "Average", "Hit"]))
    return model, {"accuracy": round(float(acc), 4)}

def train_recommender(df):
    print("\n=== Building Recommendation Engine ===")
    tfidf, tfidf_matrix = build_tfidf_matrix(df)
    from sklearn.metrics.pairwise import cosine_similarity
    similarity_matrix = cosine_similarity(tfidf_matrix)
    joblib.dump(tfidf, os.path.join(MODELS_DIR, "tfidf_vectorizer.pkl"))
    np.save(os.path.join(MODELS_DIR, "similarity_matrix.npy"), similarity_matrix)
    print(f"Similarity matrix shape: {similarity_matrix.shape}")
    return tfidf, similarity_matrix

def save_preprocessors(scaler, feature_cols, label_encoders=None):
    preprocessors = {
        "scaler": scaler,
        "feature_columns": feature_cols,
    }
    joblib.dump(preprocessors, os.path.join(MODELS_DIR, "preprocessors.pkl"))
    print(f"Preprocessors saved. Feature count: {len(feature_cols)}")

def main():
    print("=" * 60)
    print("MOVIE PREDICTION MODEL TRAINING PIPELINE")
    print("=" * 60)

    df = load_data()
    print(f"\nLoaded {len(df)} movies")
    df = engineer_features(df)
    print(f"After feature engineering: {df.shape}")

    df["vote_average"] = df["vote_average"].clip(1, 10)
    df["hit"] = df["hit"].astype(int)

    feature_cols = [c for c in prepare_for_training(df).columns if c in df.columns]
    print(f"Feature columns ({len(feature_cols)}): {feature_cols}")

    X = df[feature_cols].fillna(0)
    y_rating = df["vote_average"]
    y_hit = df["hit"]

    scaler = MinMaxScaler()
    X_scaled = scaler.fit_transform(X)

    X_train_r, X_test_r, y_train_r, y_test_r = train_test_split(
        X_scaled, y_rating, test_size=0.2, random_state=42
    )
    X_train_h, X_test_h, y_train_h, y_test_h = train_test_split(
        X_scaled, y_hit, test_size=0.2, random_state=42, stratify=y_hit
    )

    rating_model, rating_metrics = train_rating_model(X_train_r, y_train_r, X_test_r, y_test_r)
    hitflop_model, hitflop_metrics = train_hitflop_model(X_train_h, y_train_h, X_test_h, y_test_h)
    tfidf, sim_matrix = train_recommender(df)

    save_preprocessors(scaler, feature_cols)

    joblib.dump(rating_model, os.path.join(MODELS_DIR, "rating_model.pkl"))
    joblib.dump(hitflop_model, os.path.join(MODELS_DIR, "hitflop_model.pkl"))

    metrics = {
        "rating": rating_metrics,
        "hitflop": hitflop_metrics,
        "total_samples": len(df),
        "feature_count": len(feature_cols),
    }
    joblib.dump(metrics, os.path.join(MODELS_DIR, "model_metrics.pkl"))

    df.to_pickle(os.path.join(MODELS_DIR, "movie_data.pkl"))

    print("\n" + "=" * 60)
    print("TRAINING COMPLETE!")
    print("=" * 60)
    print(f"Models saved to: {MODELS_DIR}")
    print(f"Files created:")
    for f in os.listdir(MODELS_DIR):
        fpath = os.path.join(MODELS_DIR, f)
        print(f"  {f} ({os.path.getsize(fpath) / 1024:.1f} KB)")
    print(f"\nRating Model: {json.dumps(rating_metrics, indent=2)}")
    print(f"Hit/Flop Model: {json.dumps(hitflop_metrics, indent=2)}")

    return metrics

if __name__ == "__main__":
    main()
