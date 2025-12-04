from supabase import create_client, Client
import os
from dotenv import load_dotenv

load_dotenv()

url: str = os.environ.get("SUPABASE_URL") or os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY") or os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")

if not url or not key:
    raise ValueError("Supabase URL and Key must be set in environment variables (SUPABASE_URL/NEXT_PUBLIC_SUPABASE_URL and SUPABASE_KEY/NEXT_PUBLIC_SUPABASE_ANON_KEY)")

supabase: Client = create_client(url, key)
