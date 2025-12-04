from fastapi import APIRouter, HTTPException
from database import supabase
from models import ShowtimeCreate
from datetime import datetime
from cache_middleware import cache_response, invalidate_cache_pattern, CACHE_TTL

router = APIRouter(
    prefix="/showtimes",
    tags=["showtimes"],
)

@router.get("/")
@cache_response(ttl=CACHE_TTL["showtimes"], key_prefix="showtimes")
async def get_showtimes(include_expired: bool = False):
    """Get all showtimes, optionally filter out expired ones"""
    query = supabase.table("showtimes").select("*, movie:movies(*), screen:screens(name, theater:theaters(name))").order("start_time", desc=False)
    
    if not include_expired:
        # Only show future showtimes
        now = datetime.utcnow().isoformat()
        query = query.gte("start_time", now)
    
    response = query.execute()
    return response.data

@router.post("/")
async def create_showtime(showtime: ShowtimeCreate):
    response = supabase.table("showtimes").insert(showtime.dict()).execute()
    if not response.data:
        raise HTTPException(status_code=400, detail="Could not create showtime")
    
    # Invalidate showtimes cache
    invalidate_cache_pattern("showtimes")
    
    return response.data[0]

@router.delete("/{showtime_id}")
async def delete_showtime(showtime_id: str):
    """Delete a specific showtime"""
    try:
        response = supabase.table("showtimes").delete().eq("id", showtime_id).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Showtime not found")
        return {"message": "Showtime deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{showtime_id}")
async def get_showtime(showtime_id: str):
    """Get a specific showtime by ID with full details"""
    try:
        response = supabase.table("showtimes") \
            .select("*, movie:movies(*), screen:screens(name, theater:theaters(name))") \
            .eq("id", showtime_id) \
            .execute()
            
        if not response.data:
            raise HTTPException(status_code=404, detail="Showtime not found")
            
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/cleanup-expired")
async def cleanup_expired_showtimes():
    """Delete all showtimes that have already passed"""
    try:
        now = datetime.utcnow().isoformat()
        response = supabase.table("showtimes").delete().lt("start_time", now).execute()
        
        deleted_count = len(response.data) if response.data else 0
        return {
            "message": f"Cleaned up {deleted_count} expired showtimes",
            "deleted_count": deleted_count
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
