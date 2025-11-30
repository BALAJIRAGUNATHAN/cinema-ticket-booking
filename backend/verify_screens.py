import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_SERVICE_KEY")

if not url or not key:
    print("Error: SUPABASE_URL or SUPABASE_SERVICE_KEY not found in environment variables.")
    exit(1)

supabase: Client = create_client(url, key)

try:
    response = supabase.table("screens").select("*").execute()
    screens = response.data
    print(f"Found {len(screens)} screens.")
    for screen in screens:
        print(f"- {screen['name']} (Theater ID: {screen['theater_id']})")
except Exception as e:
    print(f"Error fetching screens: {e}")
