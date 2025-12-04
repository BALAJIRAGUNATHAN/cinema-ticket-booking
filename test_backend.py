#!/usr/bin/env python3
"""
Backend Deployment Test Script
Run this to verify all imports work correctly
"""

import sys
sys.path.insert(0, 'backend')

print("Testing backend imports...")
print("-" * 50)

try:
    print("1. Testing models...")
    from models import BookingCreate, BookingConfirmation, MovieCreate, ShowtimeCreate
    print("   ✅ All models import successfully")
except Exception as e:
    print(f"   ❌ Models import failed: {e}")
    sys.exit(1)

try:
    print("2. Testing database...")
    from database import supabase
    print("   ✅ Database module loads")
except Exception as e:
    print(f"   ❌ Database import failed: {e}")
    sys.exit(1)

try:
    print("3. Testing auth middleware...")
    from auth_middleware import get_current_user_optional
    print("   ✅ Auth middleware loads")
except Exception as e:
    print(f"   ❌ Auth middleware failed: {e}")
    sys.exit(1)

try:
    print("4. Testing routers...")
    from routers import movies, showtimes, bookings
    print("   ✅ All routers load successfully")
except Exception as e:
    print(f"   ❌ Router import failed: {e}")
    print(f"   Error details: {type(e).__name__}: {str(e)}")
    sys.exit(1)

try:
    print("5. Testing main app...")
    from main import app
    print("   ✅ FastAPI app loads successfully")
except Exception as e:
    print(f"   ❌ Main app failed: {e}")
    sys.exit(1)

print("-" * 50)
print("✅ ALL TESTS PASSED - Backend is ready to deploy!")
print("\nNext step: Manual deploy in Render Dashboard")
