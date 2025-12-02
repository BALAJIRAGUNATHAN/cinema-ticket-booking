import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(url, key)

def create_offers_table():
    print("Checking if offers table exists...")
    try:
        # Try to select from the table to see if it exists
        supabase.table("offers").select("id").limit(1).execute()
        print("✅ 'offers' table already exists.")
    except Exception:
        print("⚠️ 'offers' table does not exist. Creating it now...")
        
        # Read the SQL file
        with open("create_offers_table.sql", "r") as f:
            sql = f.read()
            
        # Execute SQL (Supabase-py doesn't support raw SQL execution directly on client usually, 
        # but we can try to use the REST API or just print instructions if this fails.
        # Actually, for this environment, printing instructions is safer if we don't have a direct SQL driver)
        
        print("\n❌ AUTOMATIC CREATION NOT SUPPORTED VIA CLIENT LIBRARY")
        print("Please run the following SQL in your Supabase SQL Editor:\n")
        print(sql)

if __name__ == "__main__":
    create_offers_table()
