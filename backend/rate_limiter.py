# Rate Limiting Middleware for FastAPI
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

# Initialize limiter
limiter = Limiter(key_func=get_remote_address, default_limits=["100/minute"])

# Common rate limit decorators
def rate_limit_strict(limit: str = "10/minute"):
    """Strict rate limit for sensitive endpoints"""
    return limiter.limit(limit)

def rate_limit_moderate(limit: str = "30/minute"):
    """Moderate rate limit for regular endpoints"""
    return limiter.limit(limit)

def rate_limit_relaxed(limit: str = "100/minute"):
    """Relaxed rate limit for public endpoints"""
    return limiter.limit(limit)
