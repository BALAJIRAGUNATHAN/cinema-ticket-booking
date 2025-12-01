
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class MovieBase(BaseModel):
    title: str
    description: Optional[str] = None
    poster_url: Optional[str] = None
    genre: Optional[str] = None
    duration: Optional[int] = None
    release_date: Optional[str] = None
    trailer_url: Optional[str] = None
    languages: List[str] = ["English"]  # Available languages for the movie
    cast: List[Dict[str, Any]] = [] # Max 4 cast members: [{"name": "...", "role": "...", "image": "..."}]

class MovieCreate(MovieBase):
    pass
class Movie(MovieBase):
    id: str
    created_at: datetime

class ShowtimeBase(BaseModel):
    movie_id: str
    screen_id: str
    start_time: str
    price: int  # in cents
    language: str = "English"  # Language of the screening
    format: str = "2D"  # Screening format: 2D, 3D, IMAX, 4DX, etc.
class ShowtimeCreate(ShowtimeBase):
    pass

class BookingCreate(BaseModel):
    showtime_id: str
    customer_name: str
    customer_email: str
    customer_phone: str
    seats: List[str]
    total_amount: int
