# SendGrid Email Service Setup Guide

This guide will help you set up SendGrid for sending booking confirmation emails.

## Quick Setup Steps

### 1. Create SendGrid Account
1. Go to [SendGrid](https://sendgrid.com) and sign up for a free account
2. Free tier includes 100 emails/day forever

### 2. Create API Key
1. Log in to SendGrid dashboard
2. Go to **Settings** → **API Keys**
3. Click **Create API Key**
4. Name it (e.g., "CineSpot Booking Emails")
5. Select **Restricted Access**
6. Enable **Mail Send** permission (Full Access)
7. Click **Create & View**
8. **IMPORTANT**: Copy the API key immediately (you won't see it again!)

### 3. Verify Sender Email
SendGrid requires you to verify your sender email address:

1. Go to **Settings** → **Sender Authentication**
2. Click **Verify a Single Sender**
3. Fill in your details:
   - From Name: `CineSpot` (or your cinema name)
   - From Email: Your email address (e.g., `noreply@yourdomain.com` or your Gmail)
   - Reply To: Same as From Email
4. Check your email and click the verification link

### 4. Configure Environment Variables

Add these to your `.env` file in the `backend` directory:

```bash
# SendGrid Email Configuration
SENDGRID_API_KEY=SG.your-actual-api-key-here
SENDGRID_FROM_EMAIL=your-verified-email@example.com
SENDGRID_FROM_NAME=CineSpot
```

**Example with Gmail:**
```bash
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=yourname@gmail.com
SENDGRID_FROM_NAME=CineSpot
```

### 5. Test Email Service

Run the test script to verify everything works:

```bash
cd backend
python test_email.py
```

Enter your email address when prompted and check your inbox!

## Troubleshooting

### Email Not Received?

1. **Check Spam Folder**: SendGrid emails sometimes land in spam initially
2. **Verify Sender**: Make sure you verified your sender email in SendGrid dashboard
3. **Check SendGrid Dashboard**: Go to **Activity** to see delivery status
4. **API Key Permissions**: Ensure your API key has "Mail Send" permission

### Common Errors

**"Unauthorized" or "Forbidden"**
- Your API key is invalid or doesn't have Mail Send permissions
- Create a new API key with proper permissions

**"Sender email not verified"**
- You must verify your sender email in SendGrid dashboard
- Check your email for the verification link

**"Daily limit exceeded"**
- Free tier has 100 emails/day limit
- Upgrade to paid plan or wait 24 hours

## Domain Authentication (Optional - For Production)

For better deliverability and to remove "via sendgrid.net" from emails:

1. Go to **Settings** → **Sender Authentication**
2. Click **Authenticate Your Domain**
3. Follow the DNS configuration steps
4. Update `SENDGRID_FROM_EMAIL` to use your domain

## Email Template

The email service sends beautiful HTML emails with:
- Movie and theater details
- Seat numbers
- Booking ID
- Total amount paid
- Professional branding

Both HTML and plain text versions are sent for maximum compatibility.

## Production Checklist

- [ ] SendGrid API key configured
- [ ] Sender email verified
- [ ] Test email sent successfully
- [ ] Email arrives in inbox (not spam)
- [ ] HTML template renders correctly
- [ ] Plain text fallback works
- [ ] Domain authenticated (optional but recommended)

## Support

If you need help:
- SendGrid Documentation: https://docs.sendgrid.com
- SendGrid Support: https://support.sendgrid.com
