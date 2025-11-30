"""
Apply database migration for languages and format fields.
This script uses raw SQL execution through Supabase.
"""

import os
from dotenv import load_dotenv
from supabase import create_client, Client
import psycopg2

load_dotenv()

# Get Supabase connection details
supabase_url = os.environ.get("SUPABASE_URL")
supabase_key = os.environ.get("SUPABASE_SERVICE_KEY")

if not supabase_url or not supabase_key:
    print("Error: SUPABASE_URL or SUPABASE_SERVICE_KEY not found.")
    print("\nPlease apply the migration manually:")
    print("1. Go to your Supabase Dashboard")
    print("2. Navigate to SQL Editor")
    print("3. Run the following SQL:\n")
    
    with open('../supabase/migrations/003_add_languages_and_format.sql', 'r') as f:
        print(f.read())
    
    exit(1)

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
