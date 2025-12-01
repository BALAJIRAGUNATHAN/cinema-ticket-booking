from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

load_dotenv()

app = FastAPI(title="Movie Booking System API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For development, allow all. In production, specify frontend URL.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to Movie Booking System API"}

from routers import movies, showtimes, bookings, seats, upcoming_movies, screens

app.include_router(movies.router)
app.include_router(showtimes.router)
app.include_router(bookings.router)
app.include_router(seats.router)
app.include_router(upcoming_movies.router)
app.include_router(screens.router)

