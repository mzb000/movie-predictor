import pandas as pd
import numpy as np
import json
import os

np.random.seed(42)

GENRES = ["Action", "Adventure", "Animation", "Comedy", "Crime", "Documentary", "Drama",
          "Family", "Fantasy", "History", "Horror", "Music", "Mystery", "Romance",
          "Science Fiction", "Thriller", "War", "Western"]

LANGUAGES = ["en", "fr", "es", "de", "it", "ja", "ko", "zh", "hi", "pt"]

COMPANIES = ["Universal Pictures", "Paramount Pictures", "Warner Bros.", "Walt Disney Pictures",
             "20th Century Fox", "Columbia Pictures", "New Line Cinema", "Lionsgate",
             "Metro-Goldwyn-Mayer", "DreamWorks Pictures", "Miramax", "Focus Features"]

COUNTRIES = ["United States of America", "United Kingdom", "France", "Germany", "Italy",
             "Japan", "South Korea", "China", "India", "Australia"]

DIRECTORS = ["Christopher Nolan", "Steven Spielberg", "Martin Scorsese", "Quentin Tarantino",
             "James Cameron", "David Fincher", "Ridley Scott", "Peter Jackson",
             "Denis Villeneuve", "Greta Gerwig", "Jordan Peele", "Bong Joon-ho",
             "Taika Waititi", "Wes Anderson", "Guillermo del Toro"]

ACTORS = ["Robert Downey Jr.", "Scarlett Johansson", "Leonardo DiCaprio", "Tom Hanks",
          "Brad Pitt", "Morgan Freeman", "Cate Blanchett", "Meryl Streep",
          "Denzel Washington", "Jennifer Lawrence", "Christian Bale", "Natalie Portman",
          "Tom Hardy", "Viola Davis", "Keanu Reeves", "Amy Adams", "Jake Gyllenhaal"]

def generate_movie_data(n=5000):
    movies = []
    for i in range(n):
        n_genres = np.random.randint(1, 4)
        genres_list = list(np.random.choice(GENRES, n_genres, replace=False))
        genres = [{"id": GENRES.index(g)+1, "name": g} for g in genres_list]

        n_companies = np.random.randint(1, 4)
        companies = [{"name": c, "id": COMPANIES.index(c)+1}
                     for c in np.random.choice(COMPANIES, n_companies, replace=False)]

        n_countries = np.random.randint(1, 3)
        countries = [{"iso_3166_1": "US", "name": c}
                     for c in np.random.choice(COUNTRIES, n_countries, replace=False)]

        n_keywords = np.random.randint(0, 8)
        keyword_pool = ["based on novel", "sequel", "action hero", "space", "war",
                        "love story", "revenge", "superhero", "dystopia", "time travel",
                        "murder mystery", "coming of age", "biography", "heist", "haunted"]
        selected_kw = list(np.random.choice(keyword_pool, min(n_keywords, len(keyword_pool)), replace=False))
        keywords = [{"id": keyword_pool.index(k)+1, "name": k} for k in selected_kw]

        n_cast = np.random.randint(3, 8)
        cast = [{"name": a, "character": f"Character {j+1}"}
                for j, a in enumerate(np.random.choice(ACTORS, n_cast, replace=False))]

        director = np.random.choice(DIRECTORS)

        is_action = "Action" in genres_list
        is_drama = "Drama" in genres_list
        is_comedy = "Comedy" in genres_list
        is_horror = "Horror" in genres_list
        is_sci_fi = "Science Fiction" in genres_list

        if is_action or is_sci_fi:
            base_budget = np.random.randint(100_000_000, 350_000_000)
            base_revenue = int(base_budget * np.random.uniform(0.8, 5.0))
        elif is_drama:
            base_budget = np.random.randint(5_000_000, 60_000_000)
            base_revenue = int(base_budget * np.random.uniform(0.5, 8.0))
        elif is_comedy:
            base_budget = np.random.randint(10_000_000, 80_000_000)
            base_revenue = int(base_budget * np.random.uniform(0.5, 6.0))
        elif is_horror:
            base_budget = np.random.randint(1_000_000, 20_000_000)
            base_revenue = int(base_budget * np.random.uniform(2.0, 15.0))
        else:
            base_budget = np.random.randint(5_000_000, 150_000_000)
            base_revenue = int(base_budget * np.random.uniform(0.5, 6.0))

        budget = max(1000, base_budget)
        revenue = max(0, base_revenue)

        vote_noise = np.random.normal(0, 0.5)
        rating = 6.0
        if is_drama: rating += 0.8
        if is_comedy: rating += 0.1
        if "Crime" in genres_list: rating += 0.5
        if is_horror: rating -= 0.5
        if "Animation" in genres_list: rating += 0.6
        if revenue > 3 * budget: rating += 0.5
        rating = max(1.0, min(10.0, rating + vote_noise))

        popularity = np.random.exponential(20) + (budget / 10_000_000)
        vote_count = max(10, int(np.random.exponential(500) + (popularity * 10)))

        runtime = 0
        if is_drama: runtime = np.random.randint(90, 200)
        elif is_comedy: runtime = np.random.randint(80, 130)
        elif is_horror: runtime = np.random.randint(70, 120)
        elif is_action: runtime = np.random.randint(90, 160)
        else: runtime = np.random.randint(75, 180)

        year = np.random.randint(1960, 2024)
        month = np.random.randint(1, 13)
        day = np.random.randint(1, 29)
        release_date = f"{year}-{month:02d}-{day:02d}"

        title_parts = []
        adj_pool = ["The Last", "Dark", "Eternal", "Silent", "Lost", "Final", "Hidden",
                    "Broken", "Rising", "Fallen", "Secret", "Endless"]
        noun_pool = ["Kingdom", "Shadow", "Horizon", "Legacy", "Empire", "Destiny",
                     "Nightmare", "Journey", "Reckoning", "Awakening", "Dominion"]
        title = f"{np.random.choice(adj_pool)} {np.random.choice(noun_pool)}"

        overview = f"A {', '.join(genres_list).lower()} film about {np.random.choice(selected_kw) if selected_kw else 'a journey'}."

        movie = {
            "budget": budget,
            "genres": json.dumps(genres),
            "homepage": f"https://example.com/movie/{i+1}",
            "id": i + 1,
            "keywords": json.dumps(keywords),
            "original_language": np.random.choice(LANGUAGES),
            "original_title": title,
            "overview": overview,
            "popularity": round(popularity, 2),
            "production_companies": json.dumps(companies),
            "production_countries": json.dumps(countries),
            "release_date": release_date,
            "revenue": revenue,
            "runtime": runtime,
            "spoken_languages": json.dumps([{"iso_639_1": "en", "name": "English"}]),
            "status": "Released",
            "tagline": f"Every {np.random.choice(['hero', 'story', 'journey', 'battle', 'secret'])} has a beginning.",
            "title": title,
            "vote_average": round(rating, 1),
            "vote_count": vote_count,
            "cast": json.dumps(cast),
            "crew": json.dumps([{"name": director, "job": "Director"}, {"name": np.random.choice(ACTORS), "job": "Producer"}]),
            "director": director
        }
        movies.append(movie)

    return pd.DataFrame(movies)

if __name__ == "__main__":
    output_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "data")
    os.makedirs(output_dir, exist_ok=True)
    df = generate_movie_data(5000)
    csv_path = os.path.join(output_dir, "tmdb_5000_movies.csv")
    df.to_csv(csv_path, index=False)
    print(f"Dataset created with {len(df)} movies at: {csv_path}")
    print(f"Columns: {list(df.columns)}")
