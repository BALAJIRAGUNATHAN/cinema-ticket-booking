#!/bin/bash

# Performance Optimization Test Script
# Run this to verify all optimizations are working

echo "🚀 Testing Performance Optimizations..."
echo "========================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
BACKEND_URL="http://localhost:8000"
FRONTEND_URL="http://localhost:3000"

echo "📡 Testing Backend..."
echo "--------------------"

# Test 1: Health Check
echo -n "1. Health Check: "
HEALTH=$(curl -s ${BACKEND_URL}/health)
if echo $HEALTH | grep -q "healthy"; then
    echo -e "${GREEN}✓ PASS${NC}"
else
    echo -e "${RED}✗ FAIL${NC}"
fi

# Test 2: Gzip Compression
echo -n "2. Gzip Compression: "
GZIP=$(curl -s -L -H "Accept-Encoding: gzip" -D - -o /dev/null ${BACKEND_URL}/movies/ | grep -i "content-encoding: gzip")
if [ ! -z "$GZIP" ]; then
    echo -e "${GREEN}✓ PASS${NC}"
else
    echo -e "${RED}✗ FAIL${NC}"
fi

# Test 3: Movies with Showtimes Endpoint
echo -n "3. Movies with Showtimes: "
MOVIES=$(curl -s -L ${BACKEND_URL}/movies/with-showtimes)
if echo $MOVIES | grep -q "id"; then
    echo -e "${GREEN}✓ PASS${NC}"
else
    echo -e "${RED}✗ FAIL${NC}"
fi

# Test 4: Cache Stats
echo -n "4. Cache Statistics: "
CACHE=$(curl -s -L ${BACKEND_URL}/cache-stats)
if echo $CACHE | grep -q "hit_rate"; then
    echo -e "${GREEN}✓ PASS${NC}"
    echo "   Cache Hit Rate: $(echo $CACHE | grep -o '"hit_rate":[0-9.]*' | cut -d':' -f2)%"
else
    echo -e "${YELLOW}⚠ SKIP (Redis not configured)${NC}"
fi

echo ""
echo "🎨 Testing Frontend..."
echo "--------------------"

# Test 5: Frontend Running
echo -n "5. Frontend Server: "
FRONTEND=$(curl -s -o /dev/null -w "%{http_code}" ${FRONTEND_URL})
if [ "$FRONTEND" = "200" ]; then
    echo -e "${GREEN}✓ PASS${NC}"
else
    echo -e "${RED}✗ FAIL (Is npm run dev running?)${NC}"
fi

echo ""
echo "📊 Performance Metrics"
echo "--------------------"

# Test API Response Time
echo "6. API Response Times:"
for endpoint in "/movies/with-showtimes" "/showtimes" "/offers" "/ads"; do
    TIME=$(curl -o /dev/null -s -L -w "%{time_total}" ${BACKEND_URL}${endpoint})
    echo "   ${endpoint}: ${TIME}s"
done

echo ""
echo "✅ Test Complete!"
echo ""
echo "Next Steps:"
echo "1. Check that all tests passed"
echo "2. Visit ${FRONTEND_URL} and verify movies with showtimes appear"
echo "3. Check browser DevTools → Network tab for:"
echo "   - WebP images"
echo "   - Gzip compression"
echo "   - Fast load times"
echo ""
