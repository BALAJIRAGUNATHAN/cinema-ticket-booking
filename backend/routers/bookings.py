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
        
        # Create a PaymentIntent with the order amount and currency
        print(f"Creating Stripe PaymentIntent for amount: {booking.total_amount}")
        intent = stripe.PaymentIntent.create(
            amount=booking.total_amount,
            currency='usd',
            automatic_payment_methods={
                'enabled': True,
            },
            metadata={
                'customer_name': booking.customer_name,
                'customer_email': booking.customer_email,
                'showtime_id': booking.showtime_id,
                'seats': ",".join(booking.seats)
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
                print(f"✅ Email credentials configured for {gmail_user}")
            
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

