import pandas as pd
import numpy as np
import json
from sklearn.preprocessing import LabelEncoder, MinMaxScaler, MultiLabelBinarizer
from sklearn.feature_extraction.text import TfidfVectorizer
import os
import joblib

MODELS_DIR = os.path.join(os.path.dirname(__file__), "models")
DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "data")

def load_data():
    path = os.path.join(DATA_DIR, "tmdb_5000_movies.csv")
    df = pd.read_csv(path)
    return df

def parse_json_column(df, col):
    def safe_parse(x):
        if isinstance(x, str):
            try:
                items = json.loads(x.replace("'", '"'))
                if isinstance(items, list):
                    return [item["name"] if isinstance(item, dict) else item for item in items if isinstance(item, dict) and "name" in item]
            except:
                return []
        return []
    return df[col].apply(safe_parse)

def extract_director(crew_str):
    if isinstance(crew_str, str):
        try:
            crew = json.loads(crew_str.replace("'", '"'))
            for member in crew:
                if isinstance(member, dict) and member.get("job") == "Director":
                    return member.get("name", "Unknown")
        except:
            pass
    return "Unknown"

def extract_cast_sizes(cast_str):
    if isinstance(cast_str, str):
        try:
            cast = json.loads(cast_str.replace("'", '"'))
            return len(cast) if isinstance(cast, list) else 0
        except:
            pass
    return 0

def engineer_features(df):
    data = df.copy()

    data["genres_list"] = parse_json_column(data, "genres")
    data["keywords_list"] = parse_json_column(data, "keywords")
    data["production_companies_list"] = parse_json_column(data, "production_companies")
    data["director"] = data["crew"].apply(extract_director)
    data["cast_size"] = data["cast"].apply(extract_cast_sizes)

    data["release_date"] = pd.to_datetime(data["release_date"], errors="coerce")
    data["release_year"] = data["release_date"].dt.year.fillna(2000).astype(int)
    data["release_month"] = data["release_date"].dt.month.fillna(1).astype(int)

    season_map = {1: "Winter", 2: "Winter", 3: "Spring", 4: "Spring", 5: "Spring",
                  6: "Summer", 7: "Summer", 8: "Summer", 9: "Fall", 10: "Fall", 11: "Fall", 12: "Winter"}
    data["release_season"] = data["release_month"].map(season_map)

    data["is_english"] = (data["original_language"] == "en").astype(int)
    data["budget_log"] = np.log1p(data["budget"])
    data["revenue_log"] = np.log1p(data["revenue"])
    data["popularity_log"] = np.log1p(data["popularity"])
    data["vote_count_log"] = np.log1p(data["vote_count"])
    data["runtime"] = data["runtime"].fillna(data["runtime"].median())

    data["revenue_to_budget"] = data.apply(
        lambda r: r["revenue"] / r["budget"] if r["budget"] > 0 else 0, axis=1
    )

    data["overview"] = data["overview"].fillna("")

    def clean_name(n):
        return n.replace(" ", "_")
    genre_mlb = MultiLabelBinarizer()
    genre_encoded = genre_mlb.fit_transform(data["genres_list"].apply(lambda gl: [clean_name(g) for g in gl]))
    genre_cols = [f"genre_{g}" for g in genre_mlb.classes_]
    genre_df = pd.DataFrame(genre_encoded, columns=genre_cols, index=data.index)
    data = pd.concat([data, genre_df], axis=1)

    season_encoded = pd.get_dummies(data["release_season"], prefix="season")
    data = pd.concat([data, season_encoded], axis=1)

    data["hit"] = data.apply(
        lambda r: 2 if (r["revenue"] > 3 * r["budget"] and r["budget"] > 0) else (1 if r["revenue"] > r["budget"] and r["budget"] > 0 else 0),
        axis=1
    )

    return data

def get_feature_columns():
    return [
        "budget_log", "popularity_log", "vote_count_log", "runtime",
        "is_english", "revenue_to_budget", "cast_size", "release_year", "release_month"
    ] + [f"genre_{g}" for g in GENRES] + [
        "season_Spring", "season_Summer", "season_Fall", "season_Winter"
    ]

GENRES = ["Action", "Adventure", "Animation", "Comedy", "Crime", "Documentary", "Drama",
          "Family", "Fantasy", "History", "Horror", "Music", "Mystery", "Romance",
          "Science_Fiction", "Thriller", "War", "Western"]

def prepare_for_training(df):
    features = get_feature_columns()
    present_features = [f for f in features if f in df.columns]
    return df[present_features]

def build_tfidf_matrix(df):
    df["text_features"] = df.apply(lambda r:
        " ".join(r.get("genres_list", [])) + " " +
        " ".join(r.get("keywords_list", [])) + " " +
        r.get("overview", ""), axis=1
    )
    tfidf = TfidfVectorizer(max_features=3000, stop_words="english")
    matrix = tfidf.fit_transform(df["text_features"])
    return tfidf, matrix

if __name__ == "__main__":
    df = load_data()
    df = engineer_features(df)
    print(f"Engineered features shape: {df.shape}")
    print(f"Columns: {list(df.columns)}")
    print(f"Hit distribution:\n{df['hit'].value_counts()}")
    print(f"Rating stats: mean={df['vote_average'].mean():.2f}, std={df['vote_average'].std():.2f}")
