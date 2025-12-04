# Pydantic models for authentication and user profiles
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class UserProfile(BaseModel):
    """User profile model"""
    id: str
    email: EmailStr
    full_name: Optional[str] = None
    phone: Optional[str] = None
    avatar_url: Optional[str] = None
    created_at: datetime
    updated_at: datetime

class ProfileUpdate(BaseModel):
    """Model for updating user profile"""
    full_name: Optional[str] = None
    phone: Optional[str] = None
    avatar_url: Optional[str] = None

class UserBooking(BaseModel):
    """User booking with movie details"""
    id: str
    showtime_id: str
    customer_name: str
    customer_email: str
    customer_phone: str
    seats: list
    total_amount: int
    payment_status: str
    payment_intent_id: Optional[str] = None
    coupon_code: Optional[str] = None
    discount_amount: Optional[int] = 0
    created_at: datetime
    movie_title: str
    theater_name: str
    screen_name: str
    start_time: datetime
