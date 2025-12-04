# User Profile and Auth Routes
from fastapi import APIRouter, Depends, HTTPException, status
from database import supabase
from auth_middleware import get_current_user, AuthUser
from auth_models import UserProfile, ProfileUpdate, UserBooking
from typing import List
from rate_limiter import limiter
from fastapi import Request

router = APIRouter(
    prefix="/users",
    tags=["users"],
)

@router.get("/profile", response_model=UserProfile)
@limiter.limit("30/minute")
async def get_profile(request: Request, user: AuthUser = Depends(get_current_user)):
    """Get current user's profile"""
    try:
        response = supabase.table("user_profiles").select("*").eq("id", user.id).single().execute()
        
        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Profile not found"
            )
        
        return response.data
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching profile: {str(e)}"
        )

@router.put("/profile", response_model=UserProfile)
@limiter.limit("10/minute")
async def update_profile(
    request: Request,
    profile_update: ProfileUpdate,
    user: AuthUser = Depends(get_current_user)
):
    """Update current user's profile"""
    try:
        # Prepare update data
        update_data = profile_update.dict(exclude_unset=True)
        
        if not update_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No fields to update"
            )
        
        # Update profile
        response = supabase.table("user_profiles").update(update_data).eq("id", user.id).execute()
        
        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Profile not found"
            )
        
        return response.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating profile: {str(e)}"
        )

@router.get("/bookings", response_model=List[UserBooking])
@limiter.limit("30/minute")
async def get_user_bookings(request: Request, user: AuthUser = Depends(get_current_user)):
    """Get current user's booking history"""
    try:
        # Use the database function we created
        response = supabase.rpc("get_user_bookings", {"user_uuid": user.id}).execute()
        
        if not response.data:
            return []
        
        return response.data
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching bookings: {str(e)}"
        )

@router.delete("/account")
@limiter.limit("5/minute")
async def delete_account(request: Request, user: AuthUser = Depends(get_current_user)):
    """Delete user account (soft delete - marks as inactive)"""
    try:
        # Note: Actual user deletion should be handled carefully
        # This is a placeholder - you may want to implement soft delete
        # or require additional confirmation
        
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail="Account deletion not yet implemented. Please contact support."
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting account: {str(e)}"
        )
