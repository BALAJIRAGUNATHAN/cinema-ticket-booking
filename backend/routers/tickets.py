from fastapi import APIRouter, HTTPException
from database import supabase
from fastapi.responses import HTMLResponse

router = APIRouter(
    prefix="/verify-ticket",
    tags=["tickets"],
)

@router.get("/{booking_id}", response_class=HTMLResponse)
async def verify_ticket(booking_id: str):
    """Verify and display ticket details for theater staff"""
    try:
        # Fetch booking details with related data
        response = supabase.table("bookings").select(
            "*, showtime:showtimes(*, movie:movies(title, poster_url), screen:screens(name, theater:theaters(name)))"
        ).eq("id", booking_id).single().execute()
        
        if not response.data:
            return generate_error_html("Ticket Not Found", "This booking ID does not exist.")
        
        booking = response.data
        
        # Check if booking is paid
        if booking.get('payment_status') != 'paid':
            return generate_error_html("Invalid Ticket", "This booking has not been confirmed.")
        
        # Extract details
        showtime = booking.get('showtime', {})
        movie = showtime.get('movie', {})
        screen = showtime.get('screen', {})
        theater = screen.get('theater', {})
        
        movie_title = movie.get('title', 'Unknown Movie')
        theater_name = theater.get('name', 'Unknown Theater')
        screen_name = screen.get('name', 'Unknown Screen')
        customer_name = booking.get('customer_name', 'Unknown')
        seats = booking.get('seats', [])
        total_amount = booking.get('total_amount', 0)
        showtime_str = showtime.get('start_time', 'Unknown Time')
        
        # Format showtime
        from datetime import datetime
        try:
            formatted_time = datetime.fromisoformat(showtime_str.replace('Z', '+00:00')).strftime('%B %d, %Y at %I:%M %p')
        except:
            formatted_time = showtime_str
        
        # Generate HTML response
        html_content = f"""
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Ticket Verification - {booking_id[:8].upper()}</title>
            <style>
                * {{
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }}
                
                body {{
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                    background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 20px;
                    color: #e2e8f0;
                }}
                
                .container {{
                    max-width: 600px;
                    width: 100%;
                    background: #1e293b;
                    border-radius: 24px;
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
                    border: 1px solid #334155;
                    overflow: hidden;
                }}
                
                .header {{
                    background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
                    padding: 40px 30px;
                    text-align: center;
                }}
                
                .header h1 {{
                    font-size: 32px;
                    font-weight: 800;
                    color: white;
                    margin-bottom: 8px;
                }}
                
                .header p {{
                    color: rgba(255, 255, 255, 0.9);
                    font-size: 18px;
                }}
                
                .content {{
                    padding: 40px 30px;
                }}
                
                .movie-title {{
                    font-size: 28px;
                    font-weight: 700;
                    color: #ffffff;
                    text-align: center;
                    margin-bottom: 10px;
                }}
                
                .divider {{
                    height: 4px;
                    width: 60px;
                    background: linear-gradient(90deg, #22c55e, #16a34a);
                    margin: 0 auto 30px;
                    border-radius: 2px;
                }}
                
                .details-card {{
                    background: #0f172a;
                    border-radius: 16px;
                    border: 1px solid #334155;
                    padding: 30px;
                    margin-bottom: 30px;
                }}
                
                .detail-row {{
                    padding: 16px 0;
                    border-bottom: 1px solid #334155;
                }}
                
                .detail-row:last-child {{
                    border-bottom: none;
                }}
                
                .detail-label {{
                    color: #94a3b8;
                    font-size: 12px;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    font-weight: 600;
                    margin-bottom: 6px;
                }}
                
                .detail-value {{
                    color: #ffffff;
                    font-size: 18px;
                    font-weight: 500;
                }}
                
                .detail-value.large {{
                    font-size: 24px;
                    font-weight: 700;
                }}
                
                .detail-value.seats {{
                    color: #eab308;
                    font-weight: 700;
                }}
                
                .detail-value.amount {{
                    color: #22c55e;
                    font-size: 28px;
                    font-weight: 700;
                }}
                
                .status-badge {{
                    display: inline-block;
                    background: #22c55e;
                    color: white;
                    padding: 8px 20px;
                    border-radius: 999px;
                    font-size: 14px;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }}
                
                .footer {{
                    text-align: center;
                    padding: 20px;
                    border-top: 1px solid #334155;
                    color: #64748b;
                    font-size: 14px;
                }}
                
                .booking-id {{
                    font-family: 'Courier New', monospace;
                    background: #334155;
                    padding: 4px 12px;
                    border-radius: 6px;
                    font-size: 16px;
                }}
                
                @media (max-width: 640px) {{
                    .header h1 {{
                        font-size: 24px;
                    }}
                    
                    .movie-title {{
                        font-size: 22px;
                    }}
                    
                    .content {{
                        padding: 30px 20px;
                    }}
                }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>✅ Valid Ticket</h1>
                    <p>Booking Verified</p>
                </div>
                
                <div class="content">
                    <h2 class="movie-title">{movie_title}</h2>
                    <div class="divider"></div>
                    
                    <div class="details-card">
                        <div class="detail-row">
                            <div class="detail-label">Customer Name</div>
                            <div class="detail-value large">{customer_name}</div>
                        </div>
                        
                        <div class="detail-row">
                            <div class="detail-label">Theater</div>
                            <div class="detail-value">{theater_name}</div>
                            <div style="color: #64748b; font-size: 14px; margin-top: 4px;">{screen_name}</div>
                        </div>
                        
                        <div class="detail-row">
                            <div class="detail-label">Date & Time</div>
                            <div class="detail-value">{formatted_time}</div>
                        </div>
                        
                        <div class="detail-row">
                            <div class="detail-label">Seats</div>
                            <div class="detail-value seats">{', '.join(seats)}</div>
                        </div>
                        
                        <div class="detail-row">
                            <div class="detail-label">Booking ID</div>
                            <div class="detail-value">
                                <span class="booking-id">{booking_id[:8].upper()}</span>
                            </div>
                        </div>
                        
                        <div class="detail-row">
                            <div class="detail-label">Total Amount Paid</div>
                            <div class="detail-value amount">₹{(total_amount / 100):.2f}</div>
                        </div>
                        
                        <div class="detail-row">
                            <div class="detail-label">Status</div>
                            <div>
                                <span class="status-badge">✓ Confirmed</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="footer">
                    <p>© 2024 CineSpot - Cinema Booking System</p>
                    <p style="margin-top: 8px; font-size: 12px;">Scanned at {datetime.now().strftime('%I:%M %p')}</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        return html_content
        
    except Exception as e:
        print(f"❌ Error verifying ticket: {str(e)}")
        import traceback
        traceback.print_exc()
        return generate_error_html("Error", "An error occurred while verifying the ticket.")


def generate_error_html(title: str, message: str) -> str:
    """Generate error HTML page"""
    return f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>{title}</title>
        <style>
            * {{
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }}
            
            body {{
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
                color: #e2e8f0;
            }}
            
            .container {{
                max-width: 500px;
                width: 100%;
                background: #1e293b;
                border-radius: 24px;
                box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
                border: 1px solid #334155;
                overflow: hidden;
                text-align: center;
            }}
            
            .header {{
                background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
                padding: 40px 30px;
            }}
            
            .header h1 {{
                font-size: 32px;
                font-weight: 800;
                color: white;
                margin-bottom: 8px;
            }}
            
            .content {{
                padding: 40px 30px;
            }}
            
            .message {{
                font-size: 18px;
                color: #94a3b8;
                line-height: 1.6;
            }}
            
            .footer {{
                padding: 20px;
                border-top: 1px solid #334155;
                color: #64748b;
                font-size: 14px;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>❌ {title}</h1>
            </div>
            
            <div class="content">
                <p class="message">{message}</p>
            </div>
            
            <div class="footer">
                <p>© 2024 CineSpot - Cinema Booking System</p>
            </div>
        </div>
    </body>
    </html>
    """
