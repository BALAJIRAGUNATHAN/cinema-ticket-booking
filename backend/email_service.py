import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
from dotenv import load_dotenv

load_dotenv()

GMAIL_USER = os.environ.get("GMAIL_USER")
GMAIL_APP_PASSWORD = os.environ.get("GMAIL_APP_PASSWORD")

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
    """Send booking confirmation email to customer"""
    
    if not GMAIL_USER or not GMAIL_APP_PASSWORD:
        print("Email credentials not configured")
        return False
    
    try:
        # Create message
        msg = MIMEMultipart('alternative')
        msg['Subject'] = f'🎬 Booking Confirmed - {movie_title}'
        msg['From'] = GMAIL_USER
        msg['To'] = customer_email
        
        # HTML email template
        html = f"""
        <html>
          <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Booking Confirmed!</h1>
              </div>
              
              <div style="padding: 30px;">
                <p style="font-size: 18px; color: #333;">Hi {customer_name},</p>
                <p style="color: #666;">Your movie tickets have been booked successfully!</p>
                
                <div style="background-color: #f8f9fa; border-left: 4px solid #667eea; padding: 20px; margin: 20px 0; border-radius: 5px;">
                  <h2 style="margin-top: 0; color: #667eea; font-size: 22px;">{movie_title}</h2>
                  
                  <table style="width: 100%; margin-top: 15px;">
                    <tr>
                      <td style="padding: 8px 0; color: #666; font-weight: bold;">Theater:</td>
                      <td style="padding: 8px 0; color: #333;">{theater_name}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; color: #666; font-weight: bold;">Screen:</td>
                      <td style="padding: 8px 0; color: #333;">{screen_name}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; color: #666; font-weight: bold;">Date & Time:</td>
                      <td style="padding: 8px 0; color: #333;">{showtime}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; color: #666; font-weight: bold;">Seats:</td>
                      <td style="padding: 8px 0; color: #333; font-weight: bold;">{', '.join(seats)}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; color: #666; font-weight: bold;">Total Amount:</td>
                      <td style="padding: 8px 0; color: #28a745; font-size: 20px; font-weight: bold;">₹{(total_amount / 100):.2f}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; color: #666; font-weight: bold;">Booking ID:</td>
                      <td style="padding: 8px 0; color: #333; font-family: monospace;">{booking_id}</td>
                    </tr>
                  </table>
                </div>
                
                <div style="background-color: #fff3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 5px; margin: 20px 0;">
                  <p style="margin: 0; color: #856404;"><strong>📱 Show this email at the theater entrance</strong></p>
                </div>
                
                <p style="color: #666; margin-top: 20px;">Enjoy your movie! 🍿</p>
              </div>
              
              <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #dee2e6;">
                <p style="color: #999; font-size: 12px; margin: 0;">This is an automated email. Please do not reply.</p>
              </div>
            </div>
          </body>
        </html>
        """
        
        part = MIMEText(html, 'html')
        msg.attach(part)
        
        # Send email
        print(f"📤 Connecting to Gmail SMTP server...")
        with smtplib.SMTP_SSL('smtp.gmail.com', 465) as server:
            print(f"🔐 Authenticating with Gmail...")
            server.login(GMAIL_USER, GMAIL_APP_PASSWORD)
            print(f"📨 Sending message...")
            server.send_message(msg)
        
        print(f"✅ Email sent successfully to {customer_email}")
        return True
        
    except Exception as e:
        print(f"Failed to send email: {e}")
        return False
