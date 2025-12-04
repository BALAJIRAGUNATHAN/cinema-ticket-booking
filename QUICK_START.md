# Quick Start - Local Testing

## 🚀 Start Services

### Terminal 1 - Backend
```bash
cd backend
source venv/bin/activate  # or .venv/bin/activate
uvicorn main:app --reload
```

### Terminal 2 - Frontend
```bash
npm run dev
```

### Terminal 3 - Run Tests (Optional)
```bash
./test-performance.sh
```

## ✅ What to Check

### 1. Homepage (http://localhost:3000)
- ✅ Only movies WITH showtimes appear
- ✅ Images load as WebP format
- ✅ Page loads fast (< 2 seconds)

### 2. Backend Logs
Look for cache messages:
```
✅ Cache HIT: api_cache:...
❌ Cache MISS: api_cache:...
💾 Cached: api_cache:... (TTL: 300s)
```

### 3. Browser DevTools → Network Tab
- ✅ `content-encoding: gzip` in response headers
- ✅ WebP images (check image requests)
- ✅ Fast response times (< 200ms for API)

### 4. Test Endpoints

```bash
# Movies with showtimes
curl http://localhost:8000/movies/with-showtimes

# Health check
curl http://localhost:8000/health

# Cache stats (if Redis configured)
curl http://localhost:8000/cache-stats
```

## 🐛 Troubleshooting

### Movies still showing without showtimes?
- Check backend logs for the endpoint being called
- Should be `/movies/with-showtimes` not `/movies`

### Cache not working?
- Redis might not be running
- Check: `redis-cli ping` (should return PONG)
- Or use Upstash/Redis Cloud

### Build errors?
```bash
npm run build
# Check for any TypeScript errors
```

## ✅ Ready to Deploy?

Once local testing passes:
1. Run database scripts in Supabase (see deployment_guide.md)
2. Commit and push changes
3. Render will auto-deploy

---

**All optimizations are complete and ready for testing!** 🎉
