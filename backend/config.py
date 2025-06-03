import os

SECRET_KEY = os.environ.get('SECRET_KEY', 'dev')  # Change 'dev' to a secure key in production
JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'dev')  # Change 'dev' to a secure key in production
DEBUG = False
TESTING = False
SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URI', 'postgresql+psycopg2://postgres:postgres@localhost:5432/postgres')