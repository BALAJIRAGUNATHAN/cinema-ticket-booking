from fastapi import APIRouter, HTTPException
from database import supabase
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from cache_middleware import cache_response, invalidate_cache_pattern, CACHE_TTL

router = APIRouter(
    prefix="/offers",
    tags=["offers"],
)

class OfferBase(BaseModel):
    title: str
    description: Optional[str] = None
    image_url: Optional[str] = None
    coupon_code: str
    discount_type: str  # 'PERCENTAGE' or 'FIXED'
    discount_value: float
    min_booking_amount: float = 0
    max_discount_amount: Optional[float] = None
    valid_from: str
    valid_until: str
    is_active: bool = True
    usage_limit: Optional[int] = None
    terms_conditions: Optional[str] = None

class OfferCreate(OfferBase):
    pass

class OfferUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    discount_type: Optional[str] = None
    discount_value: Optional[float] = None
    min_booking_amount: Optional[float] = None
    max_discount_amount: Optional[float] = None
    valid_from: Optional[str] = None
    valid_until: Optional[str] = None
    is_active: Optional[bool] = None
    usage_limit: Optional[int] = None
    terms_conditions: Optional[str] = None

class CouponValidate(BaseModel):
    coupon_code: str
    booking_amount: float

@router.get("/")
@cache_response(ttl=CACHE_TTL["offers"], key_prefix="offers")
async def get_active_offers():
    try:
        now = datetime.utcnow().isoformat()
        response = supabase.table("offers").select("*").eq("is_active", True).gte("valid_until", now).execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/all")
async def get_all_offers():
    try:
        response = supabase.table("offers").select("*").order("created_at", desc=True).execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/")
async def create_offer(offer: OfferCreate):
    try:
        # Validate discount type
        if offer.discount_type not in ['PERCENTAGE', 'FIXED']:
            raise HTTPException(status_code=400, detail="discount_type must be PERCENTAGE or FIXED")
        
        # For percentage, value should be 0-100
        if offer.discount_type == 'PERCENTAGE' and (offer.discount_value < 0 or offer.discount_value > 100):
            raise HTTPException(status_code=400, detail="Percentage discount must be between 0 and 100")
        
        offer_data = offer.dict()
        offer_data['used_count'] = 0
        
        response = supabase.table("offers").insert(offer_data).execute()
        if not response.data:
            raise HTTPException(status_code=500, detail="Failed to create offer")
        
        # Invalidate offers cache
        invalidate_cache_pattern("offers")
        
        return response.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/{offer_id}")
async def update_offer(offer_id: str, offer: OfferUpdate):
    try:
        update_data = {k: v for k, v in offer.dict().items() if v is not None}
        
        if not update_data:
            raise HTTPException(status_code=400, detail="No fields to update")
        
        response = supabase.table("offers").update(update_data).eq("id", offer_id).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Offer not found")
        return response.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{offer_id}")
async def delete_offer(offer_id: str):
    try:
        response = supabase.table("offers").delete().eq("id", offer_id).execute()
        return {"message": "Offer deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/validate")
async def validate_coupon(data: CouponValidate):
    try:
        # Find coupon by code
        response = supabase.table("offers").select("*").eq("coupon_code", data.coupon_code.upper()).execute()
        
        if not response.data or len(response.data) == 0:
            raise HTTPException(status_code=404, detail="Invalid coupon code")
        
        offer = response.data[0]
        now = datetime.utcnow()
        
        # Check if active
        if not offer['is_active']:
            raise HTTPException(status_code=400, detail="This coupon is no longer active")
        
        # Check validity dates
        valid_from = datetime.fromisoformat(offer['valid_from'].replace('Z', '+00:00'))
        valid_until = datetime.fromisoformat(offer['valid_until'].replace('Z', '+00:00'))
        
        if now < valid_from:
            raise HTTPException(status_code=400, detail="This coupon is not yet valid")
        
        if now > valid_until:
            raise HTTPException(status_code=400, detail="This coupon has expired")
        
        # Check usage limit
        if offer.get('usage_limit') and offer.get('used_count', 0) >= offer['usage_limit']:
            raise HTTPException(status_code=400, detail="This coupon has reached its usage limit")
        
        # Check minimum booking amount
        if data.booking_amount < offer['min_booking_amount']:
            raise HTTPException(
                status_code=400, 
                detail=f"Minimum booking amount of ₹{offer['min_booking_amount']} required"
            )
        
        # Calculate discount
        if offer['discount_type'] == 'PERCENTAGE':
            discount = (data.booking_amount * offer['discount_value']) / 100
        else:  # FIXED
            discount = offer['discount_value']
        
        # Apply max discount cap if set
        if offer.get('max_discount_amount') and discount > offer['max_discount_amount']:
            discount = offer['max_discount_amount']
        
        # Don't allow discount to exceed booking amount
        discount = min(discount, data.booking_amount)
        
        return {
            "valid": True,
            "offer": offer,
            "discount_amount": round(discount, 2),
            "final_amount": round(data.booking_amount - discount, 2)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error validating coupon: {e}")
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/use/{offer_id}")
async def increment_offer_usage(offer_id: str):
    """Increment the used_count for an offer after successful booking"""
    try:
        # Get current count
        response = supabase.table("offers").select("used_count").eq("id", offer_id).execute()
        if not response.data:
            return {"message": "Offer not found"}
        
        current_count = response.data[0].get('used_count', 0)
        
        # Increment
        supabase.table("offers").update({"used_count": current_count + 1}).eq("id", offer_id).execute()
        
        return {"message": "Offer usage incremented"}
    except Exception as e:
        print(f"Error incrementing offer usage: {e}")
        return {"message": "Failed to increment"}
