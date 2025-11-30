import asyncio
from database import supabase

async def seed_data():
    print("Seeding data...")

    # 1. Check if theater exists
    print("Checking for existing theaters...")
    theaters = supabase.table("theaters").select("*").execute()
    
    theater_id = None
    if not theaters.data:
        print("Creating default theater...")
        theater_res = supabase.table("theaters").insert({
            "name": "Lumière Cinema",
            "location": "Downtown"
        }).execute()
        theater_id = theater_res.data[0]["id"]
        print(f"Created theater: {theater_id}")
    else:
        theater_id = theaters.data[0]["id"]
        print(f"Using existing theater: {theater_id}")

    # 2. Check if screens exist
    print("Checking for existing screens...")
    screens = supabase.table("screens").select("*").eq("theater_id", theater_id).execute()

    if not screens.data:
        print("Creating default screens...")
        screens_data = [
            {
                "theater_id": theater_id,
                "name": "Screen 1 (IMAX)",
                "seat_layout": {
                    "rows": 8,
                    "cols": 10,
                    "aisles": [3, 7],
                    "premium_rows": [6, 7]
                }
            },
            {
                "theater_id": theater_id,
                "name": "Screen 2 (Standard)",
                "seat_layout": {
                    "rows": 6,
                    "cols": 8,
                    "aisles": [4],
                    "premium_rows": [5]
                }
            },
             {
                "theater_id": theater_id,
                "name": "Screen 3 (Gold Class)",
                "seat_layout": {
                    "rows": 4,
                    "cols": 6,
                    "aisles": [],
                    "premium_rows": [0, 1, 2, 3]
                }
            }
        ]
        
        for screen in screens_data:
            supabase.table("screens").insert(screen).execute()
            print(f"Created screen: {screen['name']}")
    else:
        print("Screens already exist.")

    print("Seeding complete!")

if __name__ == "__main__":
    asyncio.run(seed_data())
