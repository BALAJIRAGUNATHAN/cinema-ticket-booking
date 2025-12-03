import resend
import os
from dotenv import load_dotenv

load_dotenv()

resend.api_key = os.environ.get("RESEND_API_KEY", "").strip()

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
    """Send booking confirmation email to customer using Resend"""
    
    print(f"📧 Starting Resend email send process for {customer_email}")
    print(f"Resend API Key configured: {bool(resend.api_key)}")
    
    if not resend.api_key:
        print("❌ Resend API key not configured")
        return False
    
    try:
        # Premium HTML email template
        html = f"""
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
                        <table role="presentation" style="width: 600px; border-collapse: separate; border-spacing: 0; background-color: #1e293b; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1); border: 1px solid #334155;">
                            
                            <tr>
                                <td style="padding: 40px 40px 30px 40px; text-align: center; background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);">
                                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">Booking Confirmed!</h1>
                                    <p style="margin: 10px 0 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">Get ready for the show! 🍿</p>
                                </td>
                            </tr>

                            <tr>
                                <td style="padding: 40px;">
                                    <div style="text-align: center; margin-bottom: 30px;">
                                        <h2 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">{movie_title}</h2>
                                        <div style="height: 4px; width: 60px; background: linear-gradient(90deg, #3b82f6, #8b5cf6); margin: 15px auto; border-radius: 2px;"></div>
                                    </div>

                                    <table role="presentation" style="width: 100%; background-color: #0f172a; border-radius: 12px; border: 1px solid #334155; margin-bottom: 30px;">
                                        <tr>
                                            <td style="padding: 24px;">
                                                <table role="presentation" style="width: 100%;">
                                                    <tr>
                                                        <td style="padding-bottom: 16px; border-bottom: 1px solid #334155;">
                                                            <p style="margin: 0; color: #94a3b8; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Theater</p>
                                                            <p style="margin: 4px 0 0 0; color: #ffffff; font-size: 16px; font-weight: 500;">{theater_name}</p>
                                                            <p style="margin: 2px 0 0 0; color: #64748b; font-size: 14px;">{screen_name}</p>
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td style="padding: 16px 0; border-bottom: 1px solid #334155;">
                                                            <p style="margin: 0; color: #94a3b8; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Date & Time</p>
                                                            <p style="margin: 4px 0 0 0; color: #ffffff; font-size: 16px; font-weight: 500;">{showtime}</p>
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td style="padding: 16px 0; border-bottom: 1px solid #334155;">
                                                            <p style="margin: 0; color: #94a3b8; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Seats</p>
                                                            <p style="margin: 4px 0 0 0; color: #eab308; font-size: 16px; font-weight: 700;">{', '.join(seats)}</p>
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td style="padding-top: 16px;">
                                                            <table role="presentation" style="width: 100%;">
                                                                <tr>
                                                                    <td style="text-align: left;">
                                                                        <p style="margin: 0; color: #94a3b8; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Booking ID</p>
                                                                        <p style="margin: 4px 0 0 0; color: #ffffff; font-family: monospace; font-size: 14px;">{booking_id.split('-')[0].upper()}</p>
                                                                    </td>
                                                                    <td style="text-align: right;">
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

                                    <div style="text-align: center; border-top: 1px solid #334155; padding-top: 30px;">
                                        <p style="margin: 0 0 8px 0; color: #e2e8f0; font-size: 14px;">Need help? Contact support</p>
                                        <p style="margin: 0; color: #64748b; font-size: 12px;">© 2024 Cinema Booking System</p>
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
        
        print(f"📤 Sending email via Resend API...")
        
        # NOTE: For Resend free tier, you can only send to the email address you signed up with.
        # Once you verify a domain, you can send to any email.
        # We are now using the actual customer email.
        
        params = {
            "from": "CineSpot <onboarding@resend.dev>",
            "to": [customer_email],
            "subject": f"🎬 Booking Confirmed: {movie_title}",
            "html": html,
        }
        
        response = resend.Emails.send(params)
        
        print(f"✅ Email sent successfully via Resend! ID: {response.get('id', 'N/A')}")
        return True
        
    except Exception as e:
        print(f"❌ Failed to send email via Resend: {e}")
        import traceback
        traceback.print_exc()
        return False
