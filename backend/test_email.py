from email_service import send_booking_confirmation
import os
from dotenv import load_dotenv

load_dotenv()

def test_email():
    print("🚀 Testing SendGrid Email Service...")
    print("=" * 60)
    
    # Check if SendGrid API key is configured
    api_key = os.environ.get("SENDGRID_API_KEY", "").strip()
    from_email = os.environ.get("SENDGRID_FROM_EMAIL", "").strip()
    
    if not api_key:
        print("❌ ERROR: SENDGRID_API_KEY not found in environment variables")
        print("\nPlease add the following to your .env file:")
        print("SENDGRID_API_KEY=your-sendgrid-api-key")
        print("SENDGRID_FROM_EMAIL=your-verified-sender-email@example.com")
        print("SENDGRID_FROM_NAME=CineSpot")
        return
    
    if not from_email or from_email == "noreply@yourdomain.com":
        print("⚠️ WARNING: SENDGRID_FROM_EMAIL not configured or using default")
        print("Please set a verified sender email in your .env file")
    
    print(f"✅ SendGrid API Key: {'*' * 20}{api_key[-4:]}")
    print(f"✅ From Email: {from_email}")
    print()
    
    # Test email address - replace with your email
    test_recipient = input("Enter your email address to receive test booking confirmation: ").strip()
    
    if not test_recipient:
        print("❌ No email address provided. Exiting.")
        return
    
    print(f"\n📧 Sending test booking confirmation to: {test_recipient}")
    print("-" * 60)
    
    # Send test booking confirmation
    success = send_booking_confirmation(
        customer_email=test_recipient,
        customer_name="Test User",
        movie_title="The Matrix Resurrections",
        theater_name="Grand Cinema Complex",
        screen_name="Screen 1 - IMAX",
        showtime="December 25, 2024 at 07:30 PM",
        seats=["A1", "A2", "A3"],
        total_amount=150000,  # ₹1500.00 in paise
        booking_id="test-booking-abc123"
    )
    
    print("-" * 60)
    if success:
        print("\n✅ Email sent successfully via SendGrid!")
        print(f"📬 Check your inbox at: {test_recipient}")
        print("\nIf you don't see the email:")
        print("  1. Check your spam/junk folder")
        print("  2. Verify your sender email is verified in SendGrid")
        print("  3. Check SendGrid dashboard for delivery status")
    else:
        print("\n❌ Failed to send email.")
        print("\nTroubleshooting:")
        print("  1. Verify your SendGrid API key is correct")
        print("  2. Ensure your API key has 'Mail Send' permissions")
        print("  3. Verify your sender email address in SendGrid")
        print("  4. Check the error messages above for details")

if __name__ == "__main__":
    test_email()
