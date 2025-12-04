from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from dotenv import load_dotenv
import os

load_dotenv()

app = FastAPI(title="Movie Booking System API")

# Add Gzip Compression Middleware (must be added before CORS)
app.add_middleware(GZipMiddleware, minimum_size=1000)

# Optimize CORS - In production, replace "*" with your frontend URL
FRONTEND_URL = os.environ.get("FRONTEND_URL", "*")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL] if FRONTEND_URL != "*" else ["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    max_age=3600,  # Cache preflight requests for 1 hour
)

@app.get("/")
def read_root():
    return {"message": "Welcome to Movie Booking System API", "status": "running"}

@app.get("/health")
def health_check():
    """Health check endpoint for monitoring"""
    return {
        "status": "healthy",
        "api": "running",
        "version": "1.0.0"
    }

@app.get("/cache-stats")
def get_cache_statistics():
    """Get Redis cache statistics"""
    from cache_middleware import get_cache_stats
    return get_cache_stats()

from routers import movies, showtimes, bookings, seats, upcoming_movies, screens, ads, offers

app.include_router(movies.router)
app.include_router(showtimes.router)
app.include_router(bookings.router)
app.include_router(ads.router)
app.include_router(seats.router)
app.include_router(upcoming_movies.router)
app.include_router(screens.router)
app.include_router(offers.router)

