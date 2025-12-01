from fastapi import APIRouter, HTTPException
from database import supabase

router = APIRouter(
    prefix="/screens",
    tags=["screens"],
)

@router.get("/")
async def get_screens():
    """Get all screens with their theater information"""
    response = supabase.table("screens").select("*, theater:theaters(*)").execute()
    return response.data
