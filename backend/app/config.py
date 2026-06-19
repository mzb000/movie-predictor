import os
from dotenv import load_dotenv

load_dotenv()

MODELS_DIR = os.path.join(os.path.dirname(__file__), "ml", "models")
DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")

APP_TITLE = "Movies Prediction App"
APP_VERSION = "2.0.0"
APP_DESCRIPTION = "Advanced Movie Rating, Hit/Flop Prediction & Recommendation System"
