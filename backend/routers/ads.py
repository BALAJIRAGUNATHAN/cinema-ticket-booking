from fastapi import APIRouter, HTTPException
from database import supabase
from pydantic import BaseModel
from typing import Optional
from cache_middleware import cache_response, invalidate_cache_pattern, CACHE_TTL

router = APIRouter(
    prefix="/ads",
    tags=["ads"],
)

class AdBase(BaseModel):
    title: str
    image_url: str
    link_url: Optional[str] = None
    is_active: bool = True
    display_order: int = 0

class AdCreate(AdBase):
    pass

class AdUpdate(BaseModel):
    title: Optional[str] = None
    image_url: Optional[str] = None
    link_url: Optional[str] = None
    is_active: Optional[bool] = None
    display_order: Optional[int] = None

@router.get("/")
@cache_response(ttl=CACHE_TTL["ads"], key_prefix="ads")
async def get_ads():
    try:
        # Fetch active ads ordered by display_order
        response = supabase.table("advertisements").select("*").eq("is_active", True).order("display_order").execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/all")
async def get_all_ads():
    try:
        # Fetch all ads (for admin)
        response = supabase.table("advertisements").select("*").order("display_order").execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/")
async def create_ad(ad: AdCreate):
    try:
        response = supabase.table("advertisements").insert(ad.dict()).execute()
        if not response.data:
            raise HTTPException(status_code=500, detail="Failed to create advertisement")
        
        # Invalidate ads cache
        invalidate_cache_pattern("ads")
        
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{ad_id}")
async def delete_ad(ad_id: str):
    try:
        response = supabase.table("advertisements").delete().eq("id", ad_id).execute()
        return {"message": "Advertisement deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/{ad_id}")
async def update_ad(ad_id: str, ad: AdUpdate):
    try:
        # Filter out None values
        update_data = {k: v for k, v in ad.dict().items() if v is not None}
        response = supabase.table("advertisements").update(update_data).eq("id", ad_id).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Advertisement not found")
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
