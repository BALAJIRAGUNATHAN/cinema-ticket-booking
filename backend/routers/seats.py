from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
import redis_client
from database import supabase

router = APIRouter(
    prefix="/seats",
    tags=["seats"],
)

class SeatLockRequest(BaseModel):
    showtime_id: str
    seats: List[str]
    user_session: str
    customer_email: str

class SeatUnlockRequest(BaseModel):
    showtime_id: str
    seats: List[str]
    user_session: str

class SeatCheckRequest(BaseModel):
    showtime_id: str
    seats: List[str]

@router.post("/lock")
async def lock_seats(request: SeatLockRequest):
    """
    Lock seats for a user session with 5-minute TTL.
    """
    try:
        result = redis_client.lock_seats(
            showtime_id=request.showtime_id,
            seats=request.seats,
            user_session=request.user_session,
            customer_email=request.customer_email
        )
        
        if not result["success"]:
            raise HTTPException(status_code=409, detail=result["message"])
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/unlock")
async def unlock_seats(request: SeatUnlockRequest):
    """
    Unlock seats for a user session.
    """
    try:
        result = redis_client.unlock_seats(
            showtime_id=request.showtime_id,
            seats=request.seats,
            user_session=request.user_session
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/available/{showtime_id}")
async def get_available_seats(showtime_id: str):
    """
    Get all available seats for a showtime.
    Returns locked seats (Redis) and booked seats (Supabase).
    """
    try:
        # Get locked seats from Redis
        locked_seats = redis_client.get_locked_seats(showtime_id)
        
        # Get booked seats from Supabase
        response = supabase.table("bookings").select("seats").eq("showtime_id", showtime_id).eq("payment_status", "paid").execute()
        
        booked_seats = []
        if response.data:
            for booking in response.data:
                booked_seats.extend(booking.get("seats", []))
        
        return {
            "showtime_id": showtime_id,
            "locked_seats": locked_seats,
            "booked_seats": list(set(booked_seats)),  # Remove duplicates
            "unavailable_seats": list(set(locked_seats + booked_seats))
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/check")
async def check_seats(request: SeatCheckRequest):
    """
    Check if specific seats are available.
    """
    try:
        unavailable = []
        
        for seat in request.seats:
            if not redis_client.check_seat_availability(request.showtime_id, seat):
                unavailable.append(seat)
        
        # Also check Supabase for confirmed bookings
        response = supabase.table("bookings").select("seats").eq("showtime_id", request.showtime_id).eq("payment_status", "paid").execute()
        
        if response.data:
            for booking in response.data:
                booked_seats = booking.get("seats", [])
                for seat in request.seats:
                    if seat in booked_seats and seat not in unavailable:
                        unavailable.append(seat)
        
        return {
            "available": len(unavailable) == 0,
            "unavailable_seats": unavailable
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/refresh")
async def refresh_locks(request: SeatUnlockRequest):
    """
    Refresh the TTL on seat locks (extend 5-minute timer).
    """
    try:
        success = redis_client.refresh_seat_locks(
            showtime_id=request.showtime_id,
            seats=request.seats,
            user_session=request.user_session
        )
        
        if not success:
            raise HTTPException(status_code=400, detail="Failed to refresh locks. Seats may have expired or are locked by another user.")
        
        return {"success": True, "message": "Locks refreshed successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
