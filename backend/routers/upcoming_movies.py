from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from database import supabase
from datetime import date

router = APIRouter(
    prefix="/upcoming-movies",
    tags=["upcoming-movies"],
)

class UpcomingMovieCreate(BaseModel):
    title: str
    banner_image: str
    release_date: str
    description: Optional[str] = None
    display_order: int = 0
    is_active: bool = True

class UpcomingMovieUpdate(BaseModel):
    title: Optional[str] = None
    banner_image: Optional[str] = None
    release_date: Optional[str] = None
    description: Optional[str] = None
    display_order: Optional[int] = None
    is_active: Optional[bool] = None

@router.get("/")
async def get_upcoming_movies(active_only: bool = True):
    """Get all upcoming movies, optionally filter by active status"""
    try:
        query = supabase.table("upcoming_movies").select("*").order("display_order")
        
        if active_only:
            query = query.eq("is_active", True)
        
        response = query.execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/")
async def create_upcoming_movie(movie: UpcomingMovieCreate):
    """Create a new upcoming movie advertisement"""
    try:
        response = supabase.table("upcoming_movies").insert(movie.dict()).execute()
        if not response.data:
            raise HTTPException(status_code=400, detail="Could not create upcoming movie")
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{movie_id}")
async def get_upcoming_movie(movie_id: str):
    """Get a specific upcoming movie by ID"""
    try:
        response = supabase.table("upcoming_movies").select("*").eq("id", movie_id).single().execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Upcoming movie not found")
        return response.data
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.put("/{movie_id}")
async def update_upcoming_movie(movie_id: str, movie: UpcomingMovieUpdate):
    """Update an upcoming movie"""
    try:
        # Filter out None values
        update_data = {k: v for k, v in movie.dict().items() if v is not None}
        
        response = supabase.table("upcoming_movies").update(update_data).eq("id", movie_id).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Upcoming movie not found")
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{movie_id}")
async def delete_upcoming_movie(movie_id: str):
    """Delete an upcoming movie"""
    try:
        response = supabase.table("upcoming_movies").delete().eq("id", movie_id).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Upcoming movie not found")
        return {"message": "Upcoming movie deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
