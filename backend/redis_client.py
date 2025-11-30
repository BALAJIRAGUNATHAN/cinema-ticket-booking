import redis
import os
import json
from dotenv import load_dotenv
from typing import List, Optional

load_dotenv()

# Initialize Redis client
REDIS_URL = os.environ.get("REDIS_URL", "redis://localhost:6379")
redis_client = redis.from_url(REDIS_URL, decode_responses=True)

SEAT_LOCK_TTL = 300  # 5 minutes in seconds

def lock_seats(showtime_id: str, seats: List[str], user_session: str, customer_email: str) -> dict:
    """
    Attempt to lock seats for a showtime.
    Returns: {"success": bool, "locked_seats": [], "failed_seats": []}
    """
    locked_seats = []
    failed_seats = []
    
    for seat in seats:
        key = f"seat_lock:{showtime_id}:{seat}"
        
        # Try to set the key only if it doesn't exist (NX flag)
        lock_data = json.dumps({
            "user_session": user_session,
            "customer_email": customer_email,
            "locked_at": None  # Will be set by Redis
        })
        
        # SET with NX (only if not exists) and EX (expiry time)
        success = redis_client.set(key, lock_data, nx=True, ex=SEAT_LOCK_TTL)
        
        if success:
            locked_seats.append(seat)
        else:
            failed_seats.append(seat)
    
    # If any seat failed to lock, release all locked seats
    if failed_seats:
        for seat in locked_seats:
            unlock_seat(showtime_id, seat, user_session)
        return {
            "success": False,
            "locked_seats": [],
            "failed_seats": seats,
            "message": f"Seats {', '.join(failed_seats)} are already locked by another user"
        }
    
    return {
        "success": True,
        "locked_seats": locked_seats,
        "failed_seats": [],
        "message": "All seats locked successfully"
    }

def unlock_seat(showtime_id: str, seat: str, user_session: str) -> bool:
    """
    Unlock a specific seat if it's locked by the given user session.
    Returns True if unlocked, False otherwise.
    """
    key = f"seat_lock:{showtime_id}:{seat}"
    
    # Get current lock data
    lock_data = redis_client.get(key)
    if not lock_data:
        return True  # Already unlocked
    
    # Verify it's locked by this user
    try:
        data = json.loads(lock_data)
        if data.get("user_session") == user_session:
            redis_client.delete(key)
            return True
    except json.JSONDecodeError:
        pass
    
    return False

def unlock_seats(showtime_id: str, seats: List[str], user_session: str) -> dict:
    """
    Unlock multiple seats for a user session.
    """
    unlocked = []
    failed = []
    
    for seat in seats:
        if unlock_seat(showtime_id, seat, user_session):
            unlocked.append(seat)
        else:
            failed.append(seat)
    
    return {
        "success": len(failed) == 0,
        "unlocked_seats": unlocked,
        "failed_seats": failed
    }

def check_seat_availability(showtime_id: str, seat: str) -> bool:
    """
    Check if a seat is available (not locked in Redis).
    """
    key = f"seat_lock:{showtime_id}:{seat}"
    return not redis_client.exists(key)

def get_locked_seats(showtime_id: str) -> List[str]:
    """
    Get all currently locked seats for a showtime.
    """
    pattern = f"seat_lock:{showtime_id}:*"
    keys = redis_client.keys(pattern)
    
    # Extract seat IDs from keys
    locked_seats = []
    for key in keys:
        # key format: seat_lock:{showtime_id}:{seat_id}
        seat_id = key.split(":")[-1]
        locked_seats.append(seat_id)
    
    return locked_seats

def verify_seats_locked(showtime_id: str, seats: List[str], user_session: str) -> bool:
    """
    Verify that all seats are locked by the given user session.
    """
    for seat in seats:
        key = f"seat_lock:{showtime_id}:{seat}"
        lock_data = redis_client.get(key)
        
        if not lock_data:
            return False
        
        try:
            data = json.loads(lock_data)
            if data.get("user_session") != user_session:
                return False
        except json.JSONDecodeError:
            return False
    
    return True

def refresh_seat_locks(showtime_id: str, seats: List[str], user_session: str) -> bool:
    """
    Refresh the TTL on seat locks (extend the 5-minute timer).
    """
    for seat in seats:
        key = f"seat_lock:{showtime_id}:{seat}"
        lock_data = redis_client.get(key)
        
        if not lock_data:
            return False
        
        try:
            data = json.loads(lock_data)
            if data.get("user_session") == user_session:
                redis_client.expire(key, SEAT_LOCK_TTL)
            else:
                return False
        except json.JSONDecodeError:
            return False
    
    return True
