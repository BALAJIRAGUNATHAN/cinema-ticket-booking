# 🎬 CineSpot - Modern Movie Booking System

CineSpot is a full-featured, production-ready movie ticket booking application built with **Next.js** and **FastAPI**. It offers a seamless booking experience with real-time seat selection, secure payments, and QR code ticketing.

![CineSpot Banner](https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=2070&auto=format&fit=crop)

## ✨ Key Features

### 👤 User Experience
- **Interactive Seat Selection**: Visual seat map with real-time availability.
- **Advance Booking**: Book tickets 30 minutes to 30 days in advance.
- **Secure Payments**: Integrated with **Stripe** for safe and easy transactions.
- **Instant Confirmation**: Automated emails via **SendGrid** with booking details.
- **QR Code Tickets**: Scannable QR codes embedded in emails for easy theater entry.
- **My Bookings**: Dashboard for users to view their booking history.
- **Mobile Responsive**: Fully optimized for all devices.

### 👨‍💼 Administration
- **Admin Dashboard**: Manage movies, showtimes, and view statistics.
- **Direct Access**: Simplified admin access at `/admin`.
- **Ticket Verification**: Dedicated endpoint for staff to verify QR codes.

### 🛡️ Security & Performance
- **Rate Limiting**: Protected against abuse.
- **Secure Authentication**: Robust handling of user sessions.
- **Optimized Performance**: Fast load times with Next.js server components.

## 🛠️ Technology Stack

### Frontend
- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Payments**: [Stripe Elements](https://stripe.com/docs/elements)

### Backend
- **Framework**: [FastAPI](https://fastapi.tiangolo.com/) (Python)
- **Database**: [Supabase](https://supabase.com/) (PostgreSQL)
- **Email Service**: [SendGrid](https://sendgrid.com/)
- **QR Generation**: Python `qrcode` library

### Infrastructure
- **Deployment**: [Render](https://render.com/)
- **Version Control**: Git

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Python 3.11+
- Supabase Account
- Stripe Account
- SendGrid Account

### 1. Clone the Repository
```bash
git clone https://github.com/BALAJIRAGUNATHAN/cinema-ticket-booking.git
cd cinema-ticket-booking
```

### 2. Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
```
Update `backend/.env` with your credentials:
```env
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
STRIPE_SECRET_KEY=your_stripe_secret_key
SENDGRID_API_KEY=your_sendgrid_key
SENDGRID_FROM_EMAIL=your_verified_sender_email
FRONTEND_URL=http://localhost:3000
```

### 3. Frontend Setup
```bash
# Return to root directory
cd ..

# Install dependencies
npm install

# Create .env.local file
cp .env.local.example .env.local
```
Update `.env.local` with your credentials:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

### 4. Database Setup
Run the SQL scripts located in `supabase/schema.sql` in your Supabase SQL Editor to set up the tables and policies.

### 5. Run the Application

**Start Backend:**
```bash
cd backend
source venv/bin/activate
uvicorn main:app --reload --port 8000
```

**Start Frontend:**
```bash
# In a new terminal, from root
npm run dev
```

Visit `http://localhost:3000` to browse movies! 🍿

## 📱 Application Flow

1. **Browse**: Users view "Now Showing" movies on the homepage.
2. **Select**: Choose a movie and a showtime.
3. **Seat**: Pick seats from the interactive layout.
4. **Pay**: Enter customer details and pay via Stripe.
5. **Confirm**: Receive an email with a QR code ticket.
6. **Verify**: Theater staff scans the QR code to validate entry.

## 📂 Project Structure

```
├── app/                  # Next.js App Router pages
│   ├── admin/            # Admin dashboard
│   ├── booking/          # Booking flow
│   └── verify-ticket/    # Ticket verification page
├── backend/              # FastAPI backend
│   ├── routers/          # API endpoints
│   └── email_service.py  # SendGrid integration
├── components/           # Reusable React components
└── supabase/             # Database schema
```

## 🚢 Deployment

This project is configured for easy deployment on **Render**.

1. **Connect Repository**: Link your GitHub repo to Render.
2. **Backend Service**:
   - Environment: Python 3
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn main:app --host 0.0.0.0 --port 10000`
3. **Frontend Service**:
   - Environment: Node
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
4. **Environment Variables**: Add all variables from your `.env` files to Render.

See `RENDER_QUICK_START.md` for detailed instructions.

## 📄 License

This project is licensed under the MIT License.

---
Built with ❤️ by the CineSpot Team
