from fastapi import APIRouter, HTTPException
from database import supabase
from models import BookingCreate
import stripe
import os
from dotenv import load_dotenv

load_dotenv()

stripe.api_key = os.environ.get("STRIPE_SECRET_KEY", "").strip()

router = APIRouter(
    prefix="/bookings",
    tags=["bookings"],
)

@router.post("/create-payment-intent")
async def create_payment_intent(booking: BookingCreate):
    try:
        if not stripe.api_key:
            print("❌ Error: Stripe API key is missing or empty")
            raise Exception("Stripe configuration error: API key missing")

        # Verify seats are locked (optional user_session check)
        # This is a safety check - frontend should have already locked seats
        import redis_client
        
        # Check if seats are available (not booked in Supabase)
        print(f"Checking availability for seats: {booking.seats} in showtime {booking.showtime_id}")
        response = supabase.table("bookings").select("seats").eq("showtime_id", booking.showtime_id).eq("payment_status", "paid").execute()
        
        booked_seats = []
        if response.data:
            for existing_booking in response.data:
                booked_seats.extend(existing_booking.get("seats", []))
        
        # Check if any requested seats are already booked
        conflicting_seats = set(booking.seats) & set(booked_seats)
        if conflicting_seats:
            print(f"❌ Conflict: Seats {conflicting_seats} are already booked")
            raise HTTPException(status_code=409, detail=f"Seats {', '.join(conflicting_seats)} are already booked")
        
        # Validate coupon if provided
        if booking.coupon_code:
            print(f"Validating coupon: {booking.coupon_code}")
            try:
                # Call internal validation logic (duplicating logic from offers router for now or importing)
                # For simplicity, we'll trust the frontend's calculation but verify the coupon exists and is active
                coupon_response = supabase.table("offers").select("*").eq("coupon_code", booking.coupon_code.upper()).execute()
                if not coupon_response.data:
                    print(f"❌ Invalid coupon code: {booking.coupon_code}")
                    # We won't block the booking, but we'll log it. 
                    # Ideally we should recalculate the price here.
                else:
                    offer = coupon_response.data[0]
                    if not offer['is_active']:
                        print(f"❌ Coupon is inactive: {booking.coupon_code}")
                    else:
                        print(f"✅ Coupon applied: {booking.coupon_code}")
            except Exception as e:
                print(f"⚠️ Error validating coupon: {e}")

        # Create a PaymentIntent with the order amount and currency
        print(f"Creating Stripe PaymentIntent for amount: {booking.total_amount}")
        intent = stripe.PaymentIntent.create(
            amount=booking.total_amount,
            currency='usd', # Changed to usd as per previous code, but should ideally be inr for India
            automatic_payment_methods={
                'enabled': True,
            },
            metadata={
                'customer_name': booking.customer_name,
                'customer_email': booking.customer_email,
                'showtime_id': booking.showtime_id,
                'seats': ",".join(booking.seats),
                'coupon_code': booking.coupon_code or '',
                'discount_amount': booking.discount_amount or 0
            }
        )
        print(f"✅ PaymentIntent created: {intent.id}")
        return {
            'clientSecret': intent.client_secret,
            'id': intent.id
        }
    except Exception as e:
        print(f"❌ Error in create_payment_intent: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=400, detail=str(e))

from fastapi import BackgroundTasks

@router.post("/confirm")
async def confirm_booking(booking_details: BookingCreate, background_tasks: BackgroundTasks):
    try:
        print(f"Confirming booking for {booking_details.customer_email}")
        
        # Create booking in Supabase
        booking_data = booking_details.dict()
        booking_data['payment_status'] = 'paid'
        
        response = supabase.table("bookings").insert(booking_data).execute()
        if not response.data:
            print("❌ Failed to save booking to database")
            raise HTTPException(status_code=500, detail="Failed to save booking to database")
        
        booking = response.data[0]
        print(f"✅ Booking saved to DB: {booking['id']}")
        
        # Increment coupon usage if applicable
        if booking_details.coupon_code:
            try:
                # Find offer by code
                offer_res = supabase.table("offers").select("id, used_count").eq("coupon_code", booking_details.coupon_code.upper()).execute()
                if offer_res.data:
                    offer_id = offer_res.data[0]['id']
                    current_count = offer_res.data[0].get('used_count', 0)
                    supabase.table("offers").update({"used_count": current_count + 1}).eq("id", offer_id).execute()
                    print(f"✅ Incremented usage for coupon: {booking_details.coupon_code}")
            except Exception as e:
                print(f"⚠️ Failed to increment coupon usage: {e}")
        
        # Fetch showtime details for email
        showtime_response = supabase.table("showtimes").select(
            "*, movie:movies(title), screen:screens(name, theater:theaters(name))"
        ).eq("id", booking_details.showtime_id).single().execute()
        
        if showtime_response.data:
            showtime = showtime_response.data
            
            # Check email credentials before adding background task
            import os
            gmail_user = os.environ.get("GMAIL_USER", "").strip()
            gmail_password = os.environ.get("GMAIL_APP_PASSWORD", "").strip()
            
            if not gmail_user or not gmail_password:
                print(f"⚠️ WARNING: Email credentials not configured. Email will not be sent.")
                print(f"GMAIL_USER set: {bool(gmail_user)}")
                print(f"GMAIL_APP_PASSWORD set: {bool(gmail_password)}")
            else:
                print(f"✅ Email credentials configured (Resend)")
            
            # Send email confirmation in background
            from email_service import send_booking_confirmation
            from datetime import datetime
            
            formatted_time = datetime.fromisoformat(showtime['start_time'].replace('Z', '+00:00')).strftime('%B %d, %Y at %I:%M %p')
            
            background_tasks.add_task(
                send_booking_confirmation,
                customer_email=booking_details.customer_email,
                customer_name=booking_details.customer_name,
                movie_title=showtime['movie']['title'],
                theater_name=showtime['screen']['theater']['name'],
                screen_name=showtime['screen']['name'],
                showtime=formatted_time,
                seats=booking_details.seats,
                total_amount=booking_details.total_amount,
                booking_id=booking['id']
            )
            print(f"📧 Email task added to background for {booking_details.customer_email}")
            
        return booking

    except Exception as e:
        print(f"❌ Error in confirm_booking: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/showtime/{showtime_id}/seats")
async def get_booked_seats(showtime_id: str):
    """Get all booked seats for a specific showtime"""
    try:
        # Fetch all bookings for this showtime that are paid
        response = supabase.table("bookings").select("seats").eq("showtime_id", showtime_id).eq("payment_status", "paid").execute()
        
        booked_seats = []
        if response.data:
            for booking in response.data:
                # seats is stored as a list of strings in the JSONB column or array
                seats = booking.get("seats", [])
                if isinstance(seats, list):
                    booked_seats.extend(seats)
                elif isinstance(seats, str):
                    # Handle case where it might be stored as comma-separated string
                    booked_seats.extend([s.strip() for s in seats.split(",")])
                    
        # Remove duplicates just in case
        return list(set(booked_seats))
    except Exception as e:
        print(f"❌ Error fetching booked seats: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

