import functools
import json
import hashlib
from typing import Callable, Any, Optional
from fastapi import Request, Response
from fastapi.responses import JSONResponse
import redis_client

# Cache TTL configurations (in seconds)
CACHE_TTL = {
    "movies_list": 300,  # 5 minutes
    "movie_detail": 600,  # 10 minutes
    "showtimes": 120,  # 2 minutes
    "offers": 900,  # 15 minutes
    "ads": 1800,  # 30 minutes
    "theaters": 600,  # 10 minutes
    "upcoming_movies": 600,  # 10 minutes
}

def generate_cache_key(prefix: str, *args, **kwargs) -> str:
    """Generate a unique cache key based on function arguments"""
    key_data = f"{prefix}:{str(args)}:{str(sorted(kwargs.items()))}"
    return f"api_cache:{hashlib.md5(key_data.encode()).hexdigest()}"

def cache_response(ttl: int, key_prefix: str):
    """
    Decorator to cache API responses in Redis
    
    Args:
        ttl: Time to live in seconds
        key_prefix: Prefix for the cache key
    """
    def decorator(func: Callable) -> Callable:
        @functools.wraps(func)
        async def wrapper(*args, **kwargs) -> Any:
            # Generate cache key
            cache_key = generate_cache_key(key_prefix, *args, **kwargs)
            
            try:
                # Try to get from cache
                cached_data = redis_client.redis_client.get(cache_key)
                if cached_data:
                    print(f"✅ Cache HIT: {cache_key}")
                    return JSONResponse(content=json.loads(cached_data))
                
                print(f"❌ Cache MISS: {cache_key}")
                
                # Execute function
                result = await func(*args, **kwargs)
                
                # Cache the result
                if isinstance(result, (dict, list)):
                    redis_client.redis_client.setex(
                        cache_key,
                        ttl,
                        json.dumps(result)
                    )
                    print(f"💾 Cached: {cache_key} (TTL: {ttl}s)")
                
                return result
                
            except Exception as e:
                print(f"⚠️ Cache error: {e}. Proceeding without cache.")
                # If cache fails, execute function normally
                return await func(*args, **kwargs)
        
        return wrapper
    return decorator

def invalidate_cache_pattern(pattern: str):
    """
    Invalidate all cache keys matching a pattern
    
    Args:
        pattern: Redis key pattern (e.g., "api_cache:movies:*")
    """
    try:
        keys = redis_client.redis_client.keys(f"api_cache:{pattern}*")
        if keys:
            redis_client.redis_client.delete(*keys)
            print(f"🗑️ Invalidated {len(keys)} cache keys matching: {pattern}")
            return len(keys)
        return 0
    except Exception as e:
        print(f"⚠️ Cache invalidation error: {e}")
        return 0

def get_cache_stats() -> dict:
    """Get Redis cache statistics"""
    try:
        info = redis_client.redis_client.info('stats')
        return {
            "total_commands_processed": info.get('total_commands_processed', 0),
            "keyspace_hits": info.get('keyspace_hits', 0),
            "keyspace_misses": info.get('keyspace_misses', 0),
            "hit_rate": round(
                info.get('keyspace_hits', 0) / 
                max(info.get('keyspace_hits', 0) + info.get('keyspace_misses', 0), 1) * 100,
                2
            )
        }
    except Exception as e:
        print(f"⚠️ Error getting cache stats: {e}")
        return {}
