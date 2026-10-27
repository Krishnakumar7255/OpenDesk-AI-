import os
from pathlib import Path

APP_NAME = 'OpenDesk AI'
MAX_FILE_BYTES = 12 * 1024 * 1024
ALLOWED_EXTENSIONS = {'.pdf', '.txt', '.md'}
DEFAULT_CORS_ORIGINS = 'http://localhost:5173,http://127.0.0.1:5173'
CORS_ORIGINS = [value.strip().rstrip('/') for value in os.getenv('CORS_ORIGINS', DEFAULT_CORS_ORIGINS).split(',') if value.strip()]
BASE_DIR = Path(__file__).resolve().parents[2]
