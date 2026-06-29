import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'super_secret_session_encryption_key_matrix')
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL', 'sqlite:///bookshelf_hub.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Lax'