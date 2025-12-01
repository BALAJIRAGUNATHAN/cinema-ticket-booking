"""
Apply database migration for languages and format fields.
This script uses raw SQL execution through Supabase.
"""

import os
from dotenv import load_dotenv
from supabase import create_client, Client
import psycopg2
import sys

load_dotenv()

# Get Supabase credentials
SUPABASE_URL = os.getenv("SUPABASE_URL") or os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY") or os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("Error: Supabase credentials not found.")
    print("Please ensure .env.local exists and contains NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY")
    sys.exit(1)

print("=" * 60)
print("MANUAL MIGRATION REQUIRED")
print("=" * 60)
print("\nSupabase doesn't allow direct SQL execution via the API.")
print("Please apply the migration manually:\n")
print("1. Go to: https://supabase.com/dashboard")
print("2. Select your project")
print("3. Navigate to: SQL Editor")
print("4. Copy and paste the following SQL:\n")
print("-" * 60)

with open('../supabase/migrations/003_add_languages_and_format.sql', 'r') as f:
    sql_content = f.read()
    print(sql_content)

print("-" * 60)
print("\n5. Click 'Run' to execute the migration")
print("\nAfter running the migration, restart your backend server.")
print("=" * 60)
