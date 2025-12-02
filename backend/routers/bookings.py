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

@router.post("/confirm")
async def confirm_booking(booking_details: BookingCreate):
    try:
        # Create booking in Supabase
        booking_data = booking_details.dict()
        booking_data['payment_status'] = 'paid'
        
        response = supabase.table("bookings").insert(booking_data).execute()
        if not response.data:
            raise HTTPException(status_code=500, detail="Failed to save booking to database")
        
        booking = response.data[0]
        
        # Release Redis seat locks (seats are now permanently booked)
        # Note: user_session not available here, but locks will expire anyway
        # This is just a cleanup optimization
        
        # Fetch showtime details for email
        showtime_response = supabase.table("showtimes").select(
            "*, movie:movies(title), screen:screens(name, theater:theaters(name))"
        ).eq("id", booking_details.showtime_id).single().execute()
        
        if showtime_response.data:
            showtime = showtime_response.data
            
            # Send email confirmation
            try:
                from email_service import send_booking_confirmation
                from datetime import datetime
                
                email_sent = send_booking_confirmation(
                    customer_email=booking_details.customer_email,
                    customer_name=booking_details.customer_name,
                    movie_title=showtime['movie']['title'],
                    theater_name=showtime['screen']['theater']['name'],
                    screen_name=showtime['screen']['name'],
                    showtime=datetime.fromisoformat(showtime['start_time'].replace('Z', '+00:00')).strftime('%B %d, %Y at %I:%M %p'),
                    seats=booking_details.seats,
                    total_amount=booking_details.total_amount,
                    booking_id=booking['id']
                )
                
                if email_sent:
                    print(f"✅ Email sent successfully to {booking_details.customer_email}")
                else:
                    print(f"⚠️ Email failed to send to {booking_details.customer_email}")
            except Exception as email_error:
                print(f"❌ Email error: {email_error}")
                # Don't fail the booking if email fails
            
        return booking

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

