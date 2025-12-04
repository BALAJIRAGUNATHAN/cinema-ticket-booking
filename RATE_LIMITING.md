# Rate Limiting Configuration

## Overview

Rate limiting protects your API from abuse and ensures fair usage across all users.

## Implementation

### Backend (FastAPI + SlowAPI)

Rate limiting is implemented using `slowapi` with the following limits:

#### Global Limits
- **Default**: 100 requests/minute per IP

#### Endpoint-Specific Limits
- **Root (`/`)**: 100/minute
- **Health (`/health`)**: 60/minute  
- **Cache Stats (`/cache-stats`)**: 30/minute
- **Public Endpoints**: 100/minute (relaxed)
- **Auth Endpoints**: 10/minute (strict)
- **Regular Endpoints**: 30/minute (moderate)

### How It Works

```python
from rate_limiter import limiter

@app.get("/endpoint")
@limiter.limit("30/minute")
def my_endpoint(request: Request):
    return {"data": "..."}
```

## Rate Limit Headers

Responses include these headers:
- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Requests remaining
- `X-RateLimit-Reset`: Time when limit resets

## When Rate Limited

**Status Code**: 429 Too Many Requests

**Response**:
```json
{
  "error": "Rate limit exceeded",
  "detail": "100 per 1 minute"
}
```

## Customizing Limits

### For Development
Set higher limits in `.env`:
```bash
RATE_LIMIT_ENABLED=false
```

### For Production
Adjust limits in `rate_limiter.py`:
```python
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["200/minute"]  # Increase if needed
)
```

## Monitoring

Check rate limit usage:
```bash
curl -I http://localhost:8000/health
```

Look for `X-RateLimit-*` headers in the response.

## Best Practices

1. **Set appropriate limits** based on expected usage
2. **Monitor 429 errors** to adjust limits
3. **Use stricter limits** for expensive operations
4. **Whitelist** trusted IPs if needed
5. **Cache responses** to reduce API calls

## Current Configuration

| Endpoint Type | Limit | Use Case |
|--------------|-------|----------|
| Strict | 10/min | Login, signup |
| Moderate | 30/min | CRUD operations |
| Relaxed | 100/min | Public data |

**All limits are per IP address.**
