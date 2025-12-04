
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
    rating: Optional[float] = None # Rating out of 10
    backdrop_url: Optional[str] = None
    trailer_url: Optional[str] = None
    languages: Optional[List[str]] = None

class MovieCreate(MovieBase):
    pass

class ShowtimeBase(BaseModel):
    movie_id: str
    screen_id: str
    start_time: str
    end_time: str
    price: int

class ShowtimeCreate(ShowtimeBase):
    pass

class BookingCreate(BaseModel):
    showtime_id: str
    customer_name: str
    customer_email: str
    customer_phone: str
    seats: List[str]
    total_amount: int
    coupon_code: Optional[str] = None
    discount_amount: Optional[int] = 0

class BookingConfirmation(BookingCreate):
    """Model for confirming a booking after payment"""
    payment_intent_id: str
