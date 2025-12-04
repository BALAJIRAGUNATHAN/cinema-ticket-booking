# Authentication Middleware for FastAPI
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional
from database import supabase
import jwt
import os

security = HTTPBearer(auto_error=False)

class AuthUser:
    """Authenticated user model"""
    def __init__(self, id: str, email: str, user_metadata: dict = None):
        self.id = id
        self.email = email
        self.user_metadata = user_metadata or {}

async def verify_token(token: str) -> Optional[AuthUser]:
    """Verify JWT token and return user"""
    try:
        # Verify token with Supabase
        response = supabase.auth.get_user(token)
        
        if response and response.user:
            return AuthUser(
                id=response.user.id,
                email=response.user.email,
                user_metadata=response.user.user_metadata
            )
        return None
    except Exception as e:
        print(f"Token verification error: {e}")
        return None

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> AuthUser:
    """
    Dependency to get current authenticated user (required)
    Raises 401 if not authenticated
    """
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user = await verify_token(credentials.credentials)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return user

async def get_current_user_optional(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> Optional[AuthUser]:
    """
    Dependency to get current user (optional)
    Returns None if not authenticated
    """
    if not credentials:
        return None
    
    return await verify_token(credentials.credentials)

async def get_user_from_request(request: Request) -> Optional[AuthUser]:
    """
    Extract user from request headers
    Used for endpoints that need user context but don't require auth
    """
    auth_header = request.headers.get("Authorization")
    
    if not auth_header or not auth_header.startswith("Bearer "):
        return None
    
    token = auth_header.replace("Bearer ", "")
    return await verify_token(token)
