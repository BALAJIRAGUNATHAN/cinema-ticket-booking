from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from dotenv import load_dotenv
import os
from rate_limiter import limiter
from slowapi.errors import RateLimitExceeded
from slowapi import _rate_limit_exceeded_handler
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from rate_limiter import limiter, rate_limit_strict

load_dotenv()

app = FastAPI(title="Movie Booking API")

# Add rate limiter to app
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Add Gzip compression middleware (must be before CORS)
app.add_middleware(GZipMiddleware, minimum_size=1000)

# Get frontend URL from environment
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

# CORS configuration - Allow production frontend
allowed_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://movie-booking-frontend-fe15.onrender.com",
]

# In production, allow all origins temporarily for debugging
if os.getenv("ENVIRONMENT") == "production":
    allowed_origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    max_age=3600,
) # Cache preflight requests for 1 hour

@app.get("/")
@limiter.limit("100/minute")
def read_root(request: Request):
    return {"message": "Welcome to Movie Booking System API", "status": "running"}

@app.get("/health")
@limiter.limit("60/minute")
def health_check(request: Request):
    """Health check endpoint for monitoring"""
    return {
        "status": "healthy",
        "api": "running",
        "version": "1.0.0"
    }

@app.get("/cache-stats")
@limiter.limit("30/minute")
def get_cache_statistics(request: Request):
    """Get Redis cache statistics"""
    from cache_middleware import get_cache_stats
    return get_cache_stats()

from routers import movies, showtimes, bookings, seats, upcoming_movies, screens, ads, offers, users, tickets

app.include_router(movies.router)
app.include_router(showtimes.router)
app.include_router(bookings.router)
app.include_router(ads.router)
app.include_router(seats.router)
app.include_router(upcoming_movies.router)
app.include_router(screens.router)
app.include_router(offers.router)
app.include_router(users.router)
app.include_router(tickets.router)

