from fastapi import APIRouter, HTTPException
from database import supabase
from models import MovieCreate, Movie

router = APIRouter(
    prefix="/movies",
    tags=["movies"],
)

@router.get("/")
async def get_movies():
    response = supabase.table("movies").select("*").order("created_at", desc=True).execute()
    return response.data

@router.post("/")
async def create_movie(movie: MovieCreate):
    response = supabase.table("movies").insert(movie.dict()).execute()
    if not response.data:
        raise HTTPException(status_code=400, detail="Could not create movie")
    return response.data[0]

@router.get("/{movie_id}")
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
    return {"message": "Movie deleted successfully"}
