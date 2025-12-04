from fastapi import APIRouter, HTTPException
from database import supabase
from models import MovieCreate
from cache_middleware import cache_response, invalidate_cache_pattern, CACHE_TTL
from datetime import datetime

router = APIRouter(
    prefix="/movies",
    tags=["movies"],
)

@router.get("/")
@cache_response(ttl=CACHE_TTL["movies_list"], key_prefix="movies_list")
async def get_movies():
    response = supabase.table("movies").select("*").order("created_at", desc=True).execute()
    return response.data

@router.get("/with-showtimes")
@cache_response(ttl=CACHE_TTL["movies_list"], key_prefix="movies_with_showtimes")
async def get_movies_with_showtimes():
    """Get only movies that have active (future) showtimes"""
    try:
        # Use RPC to get movies with active showtimes
        now = datetime.utcnow().isoformat()
        
        # This gets distinct movies that have at least one future showtime
        response = supabase.rpc(
            'get_movies_with_active_showtimes',
            {'query_time': now}
        ).execute()
        
        # If RPC doesn't exist, fall back to manual filtering
        if not response.data:
            # Get all movies
            movies_response = supabase.table("movies").select("*").execute()
            movies = movies_response.data or []
            
            # Get all future showtimes
            showtimes_response = supabase.table("showtimes").select("movie_id").gte("start_time", now).execute()
            showtime_movie_ids = set(st['movie_id'] for st in (showtimes_response.data or []))
            
            # Filter movies to only those with showtimes
            filtered_movies = [m for m in movies if m['id'] in showtime_movie_ids]
            return filtered_movies
        
        return response.data
    except Exception as e:
        print(f"Error in get_movies_with_showtimes (RPC failed, using fallback): {e}")
        try:
            # Fallback: Manual filtering in Python
            # 1. Get all movies
            movies_response = supabase.table("movies").select("*").order("created_at", desc=True).execute()
            movies = movies_response.data or []
            
            # 2. Get all future showtimes
            # Note: We fetch only movie_ids for active showtimes
            showtimes_response = supabase.table("showtimes").select("movie_id").gte("start_time", now).execute()
            active_movie_ids = set(st['movie_id'] for st in (showtimes_response.data or []))
            
            # 3. Filter movies
            filtered_movies = [m for m in movies if m['id'] in active_movie_ids]
            return filtered_movies
        except Exception as e2:
            print(f"Critical error in fallback filtering: {e2}")
            # If even fallback fails, return empty list to avoid showing invalid data
            return []

@router.post("/")
async def create_movie(movie: MovieCreate):
    response = supabase.table("movies").insert(movie.dict()).execute()
    if not response.data:
        raise HTTPException(status_code=400, detail="Could not create movie")
    
    # Invalidate movies list cache
    invalidate_cache_pattern("movies_list")
    invalidate_cache_pattern("movies_with_showtimes")
    
    return response.data[0]

@router.get("/{movie_id}")
@cache_response(ttl=CACHE_TTL["movie_detail"], key_prefix="movie_detail")
async def get_movie(movie_id: str):
    response = supabase.table("movies").select("*").eq("id", movie_id).single().execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Movie not found")
    return response.data

@router.delete("/{movie_id}")
async def delete_movie(movie_id: str):
    # First check if movie exists
    check = supabase.table("movies").select("id").eq("id", movie_id).execute()
    if not check.data:
        raise HTTPException(status_code=404, detail="Movie not found")
        
    # Delete the movie
    response = supabase.table("movies").delete().eq("id", movie_id).execute()
    
    # Invalidate caches
    invalidate_cache_pattern("movies_list")
    invalidate_cache_pattern("movies_with_showtimes")
    invalidate_cache_pattern(f"movie_detail:{movie_id}")
    
    return {"message": "Movie deleted successfully"}
