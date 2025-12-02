from email_service import send_booking_confirmation
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_email():
    print("🚀 Testing Resend Email Service...")
    
    # Check credentials
    api_key = os.environ.get("RESEND_API_KEY")
    
    if not api_key:
        print("❌ Error: RESEND_API_KEY not set in .env")
        print("Please add it to backend/.env file")
        return

    print(f"📧 Resend API key configured...")
    
    # Test data
    success = send_booking_confirmation(
        customer_email="balajiragunathan5911@gmail.com",  # Using your Gmail
        customer_name="Test User",
        movie_title="Inception (IMAX)",
        theater_name="Grand Cinema",
        screen_name="Screen 1 - Dolby Atmos",
        showtime="December 25, 2024 at 07:00 PM",
        seats=["F12", "F13"],
        total_amount=3000,  # ₹30.00
        booking_id="TEST-BOOKING-123"
    )
    
    if success:
        print("\n✅ Email sent successfully via Resend!")
        print(f"Check your inbox (balajiragunathan5911@gmail.com) for the ticket confirmation.")
    else:
        print("\n❌ Failed to send email.")

if __name__ == "__main__":
    test_email()
