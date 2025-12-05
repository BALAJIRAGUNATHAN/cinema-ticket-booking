import os
from dotenv import load_dotenv
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail, Email, To, Content

load_dotenv()

# SendGrid configuration
SENDGRID_API_KEY = os.environ.get("SENDGRID_API_KEY", "").strip()
SENDGRID_FROM_EMAIL = os.environ.get("SENDGRID_FROM_EMAIL", "noreply@yourdomain.com").strip()
SENDGRID_FROM_NAME = os.environ.get("SENDGRID_FROM_NAME", "CineSpot").strip()

def send_booking_confirmation(
    customer_email: str,
    customer_name: str,
    movie_title: str,
    theater_name: str,
    screen_name: str,
    showtime: str,
    seats: list,
    total_amount: int,
    booking_id: str
):
    """Send booking confirmation email to customer using SendGrid"""
    
    print(f"📧 Starting SendGrid email send process for {customer_email}")
    print(f"SendGrid API Key configured: {bool(SENDGRID_API_KEY)}")
    
    if not SENDGRID_API_KEY:
        print("❌ SendGrid API key not configured")
        return False
    
    try:
        # Premium HTML email template
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Booking Confirmed</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #0f172a; color: #e2e8f0;">
            <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                    <td align="center" style="padding: 40px 0;">
                        <table role="presentation" style="width: 600px; max-width: 100%; border-collapse: separate; border-spacing: 0; background-color: #1e293b; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1); border: 1px solid #334155;">
                            
                            <!-- Header -->
                            <tr>
                                <td style="padding: 40px 40px 30px 40px; text-align: center; background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);">
                                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">🎬 Booking Confirmed!</h1>
                                    <p style="margin: 10px 0 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">Get ready for the show! 🍿</p>
                                </td>
                            </tr>

                            <!-- Content -->
                            <tr>
                                <td style="padding: 40px;">
                                    <div style="text-align: center; margin-bottom: 30px;">
                                        <h2 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">{movie_title}</h2>
                                        <div style="height: 4px; width: 60px; background: linear-gradient(90deg, #3b82f6, #8b5cf6); margin: 15px auto; border-radius: 2px;"></div>
                                    </div>

                                    <!-- Booking Details Card -->
                                    <table role="presentation" style="width: 100%; background-color: #0f172a; border-radius: 12px; border: 1px solid #334155; margin-bottom: 30px;">
                                        <tr>
                                            <td style="padding: 24px;">
                                                <table role="presentation" style="width: 100%;">
                                                    <!-- Theater -->
                                                    <tr>
                                                        <td style="padding-bottom: 16px; border-bottom: 1px solid #334155;">
                                                            <p style="margin: 0; color: #94a3b8; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Theater</p>
                                                            <p style="margin: 4px 0 0 0; color: #ffffff; font-size: 16px; font-weight: 500;">{theater_name}</p>
                                                            <p style="margin: 2px 0 0 0; color: #64748b; font-size: 14px;">{screen_name}</p>
                                                        </td>
                                                    </tr>
                                                    <!-- Date & Time -->
                                                    <tr>
                                                        <td style="padding: 16px 0; border-bottom: 1px solid #334155;">
                                                            <p style="margin: 0; color: #94a3b8; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Date & Time</p>
                                                            <p style="margin: 4px 0 0 0; color: #ffffff; font-size: 16px; font-weight: 500;">{showtime}</p>
                                                        </td>
                                                    </tr>
                                                    <!-- Seats -->
                                                    <tr>
                                                        <td style="padding: 16px 0; border-bottom: 1px solid #334155;">
                                                            <p style="margin: 0; color: #94a3b8; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Seats</p>
                                                            <p style="margin: 4px 0 0 0; color: #eab308; font-size: 16px; font-weight: 700;">{', '.join(seats)}</p>
                                                        </td>
                                                    </tr>
                                                    <!-- Booking ID & Total -->
                                                    <tr>
                                                        <td style="padding-top: 16px;">
                                                            <table role="presentation" style="width: 100%;">
                                                                <tr>
                                                                    <td style="text-align: left; width: 50%;">
                                                                        <p style="margin: 0; color: #94a3b8; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Booking ID</p>
                                                                        <p style="margin: 4px 0 0 0; color: #ffffff; font-family: monospace; font-size: 14px;">{booking_id.split('-')[0].upper()}</p>
                                                                    </td>
                                                                    <td style="text-align: right; width: 50%;">
                                                                        <p style="margin: 0; color: #94a3b8; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Total Paid</p>
                                                                        <p style="margin: 4px 0 0 0; color: #22c55e; font-size: 20px; font-weight: 700;">₹{(total_amount / 100):.2f}</p>
                                                                    </td>
                                                                </tr>
                                                            </table>
                                                        </td>
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>
                                    </table>

                                    <!-- Important Notice -->
                                    <div style="background-color: rgba(59, 130, 246, 0.1); border-left: 4px solid #3b82f6; padding: 16px; border-radius: 8px; margin-bottom: 30px;">
                                        <p style="margin: 0; color: #e2e8f0; font-size: 14px; line-height: 1.6;">
                                            <strong style="color: #ffffff;">📱 Important:</strong> Please show this email or your booking ID at the theater entrance. Arrive 15 minutes before showtime.
                                        </p>
                                    </div>

                                    <!-- Footer -->
                                    <div style="text-align: center; border-top: 1px solid #334155; padding-top: 30px;">
                                        <p style="margin: 0 0 8px 0; color: #e2e8f0; font-size: 14px;">Need help? Contact our support team</p>
                                        <p style="margin: 0; color: #64748b; font-size: 12px;">© 2024 CineSpot - Cinema Booking System</p>
                                    </div>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
        """
        
        # Plain text version for email clients that don't support HTML
        plain_text_content = f"""
        🎬 BOOKING CONFIRMED!
        
        Hi {customer_name},
        
        Your movie ticket booking has been confirmed!
        
        BOOKING DETAILS:
        ================
        Movie: {movie_title}
        Theater: {theater_name}
        Screen: {screen_name}
        Date & Time: {showtime}
        Seats: {', '.join(seats)}
        
        Booking ID: {booking_id.split('-')[0].upper()}
        Total Paid: ₹{(total_amount / 100):.2f}
        
        IMPORTANT:
        Please show this email or your booking ID at the theater entrance.
        Arrive 15 minutes before showtime.
        
        Need help? Contact our support team.
        
        © 2024 CineSpot - Cinema Booking System
        """
        
        print(f"📤 Sending email via SendGrid API...")
        
        # Create the email message
        message = Mail(
            from_email=Email(SENDGRID_FROM_EMAIL, SENDGRID_FROM_NAME),
            to_emails=To(customer_email, customer_name),
            subject=f"🎬 Booking Confirmed: {movie_title}",
            plain_text_content=Content("text/plain", plain_text_content),
            html_content=Content("text/html", html_content)
        )
        
        # Send the email
        sg = SendGridAPIClient(SENDGRID_API_KEY)
        response = sg.send(message)
        
        print(f"✅ Email sent successfully via SendGrid!")
        print(f"   Status Code: {response.status_code}")
        print(f"   Response Headers: {response.headers}")
        
        return True
        
    except Exception as e:
        error_msg = str(e)
        print(f"❌ Failed to send email via SendGrid: {error_msg}")
        
        # Log detailed error information
        import traceback
        traceback.print_exc()
        
        # Check for common SendGrid errors
        if "authorization" in error_msg.lower() or "api key" in error_msg.lower():
            print("⚠️ SendGrid API Key Error: Please verify your API key is correct")
        elif "forbidden" in error_msg.lower():
            print("⚠️ SendGrid Permission Error: Check if your API key has 'Mail Send' permissions")
        elif "sender" in error_msg.lower():
            print("⚠️ SendGrid Sender Error: You may need to verify your sender email address")
        
        return False


def send_test_email(test_email: str):
    """Send a test email to verify SendGrid configuration"""
    print(f"🧪 Sending test email to {test_email}")
    
    return send_booking_confirmation(
        customer_email=test_email,
        customer_name="Test User",
        movie_title="The Matrix Resurrections",
        theater_name="Grand Cinema Complex",
        screen_name="Screen 1 - IMAX",
        showtime="December 25, 2024 at 07:30 PM",
        seats=["A1", "A2", "A3"],
        total_amount=150000,  # ₹1500.00
        booking_id="test-booking-12345"
    )
