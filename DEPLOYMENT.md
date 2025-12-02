# Deploying Movie Booking System to Render

This guide walks you through deploying your movie booking system to Render using the Blueprint (render.yaml) configuration.

## Prerequisites

Before deploying, ensure you have:

1. A [Render account](https://render.com) (free tier works)
2. Your GitHub repository connected to Render
3. Supabase project set up with the database schema
4. Stripe account for payment processing
5. Gmail account with App Password for email notifications

## Architecture Overview

Your application consists of three services:

- **Backend** (Python/FastAPI) - API server running on port $PORT
- **Frontend** (Next.js) - React application with SSR
- **Redis** - Caching layer for session management

## Deployment Steps

### 1. Push Your Code to GitHub

Ensure your latest code is pushed to GitHub:

```bash
git add .
git commit -m "Prepare for Render deployment"
git push origin main
```

### 2. Create New Blueprint in Render

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New"** → **"Blueprint"**
3. Connect your GitHub repository
4. Render will automatically detect the `render.yaml` file

### 3. Configure Environment Variables

Render will prompt you to set the following environment variables:

#### Backend Service Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `SUPABASE_URL` | Your Supabase project URL | `https://xxxxx.supabase.co` |
| `SUPABASE_KEY` | Supabase service role key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `STRIPE_SECRET_KEY` | Stripe secret key | `sk_test_xxxxx` or `sk_live_xxxxx` |
| `GMAIL_USER` | Gmail address for sending emails | `your-email@gmail.com` |
| `GMAIL_APP_PASSWORD` | Gmail app-specific password | `xxxx xxxx xxxx xxxx` |

> [!IMPORTANT]
> The `REDIS_URL` is automatically configured from the Redis service connection string.

#### Frontend Service Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `https://movie-booking-backend.onrender.com` |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | `https://xxxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | `pk_test_xxxxx` or `pk_live_xxxxx` |

### 4. Getting Required Credentials

#### Supabase Credentials

1. Go to your [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** → `SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_KEY`

#### Stripe Credentials

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Click **Developers** → **API keys**
3. Copy:
   - **Publishable key** → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - **Secret key** → `STRIPE_SECRET_KEY`

> [!WARNING]
> Use test keys for development. Switch to live keys only when ready for production.

#### Gmail App Password

1. Go to your [Google Account](https://myaccount.google.com/)
2. Navigate to **Security** → **2-Step Verification** (enable if not already)
3. Scroll to **App passwords**
4. Generate a new app password for "Mail"
5. Copy the 16-character password → `GMAIL_APP_PASSWORD`

### 5. Deploy the Services

1. After configuring all environment variables, click **"Apply"**
2. Render will start deploying all three services simultaneously
3. Monitor the build logs for each service

### 6. Deployment Timeline

- **Redis**: ~1-2 minutes (fastest)
- **Backend**: ~3-5 minutes (pip install + startup)
- **Frontend**: ~5-8 minutes (npm install + build + startup)

### 7. Verify Deployment

Once all services show "Live" status:

1. **Test Backend API**:
   - Visit `https://movie-booking-backend.onrender.com/docs`
   - You should see the FastAPI Swagger documentation

2. **Test Frontend**:
   - Visit `https://movie-booking-frontend.onrender.com`
   - You should see your movie booking homepage

3. **Test Full Flow**:
   - Browse movies
   - Select a showtime
   - Book seats
   - Complete payment (use Stripe test card: `4242 4242 4242 4242`)

## Post-Deployment Configuration

### Update Frontend API URL

After the backend is deployed, you'll get its URL. Update the frontend environment variable:

1. Go to **movie-booking-frontend** service
2. Navigate to **Environment**
3. Update `NEXT_PUBLIC_API_URL` to your backend URL
4. The service will automatically redeploy

### Database Seeding

If you need to seed your database with initial data:

1. Go to your backend service
2. Open the **Shell** tab
3. Run:
   ```bash
   python seed_data.py
   ```

## Troubleshooting

### Backend Service Issues

**Build fails with "No module named 'X'"**
- Check that all dependencies are listed in `backend/requirements.txt`
- Verify Python version is set to 3.11.0

**Service crashes on startup**
- Check environment variables are correctly set
- Review logs for specific error messages
- Ensure Supabase database is accessible

### Frontend Service Issues

**Build fails during `npm run build`**
- Ensure all environment variables starting with `NEXT_PUBLIC_` are set
- Check that the backend URL is correct and accessible

**API calls fail**
- Verify `NEXT_PUBLIC_API_URL` points to the correct backend URL
- Check CORS settings in the backend

### Redis Connection Issues

- Redis is automatically configured via `REDIS_URL`
- Ensure the backend service has the correct Redis connection string
- Check that Redis service is "Live"

## Free Tier Limitations

> [!CAUTION]
> Render free tier services spin down after 15 minutes of inactivity. First request after inactivity may take 30-60 seconds.

**Free Tier Includes**:
- 750 hours/month per service
- Services spin down after inactivity
- Slower build times
- 512 MB RAM per service

**To avoid spin-down**:
- Upgrade to paid plan ($7/month per service)
- Use a service like UptimeRobot to ping your app every 10 minutes

## Monitoring and Logs

### View Logs

1. Go to your service in Render Dashboard
2. Click **Logs** tab
3. Monitor real-time logs or filter by time range

### Set Up Alerts

1. Go to service **Settings**
2. Navigate to **Notifications**
3. Add email or Slack webhook for deployment alerts

## Updating Your Deployment

### Automatic Deployments

Render automatically deploys when you push to your main branch:

```bash
git add .
git commit -m "Update feature"
git push origin main
```

### Manual Deployments

1. Go to your service in Render Dashboard
2. Click **Manual Deploy** → **Deploy latest commit**

### Environment Variable Updates

1. Go to service **Environment** tab
2. Update variables
3. Service will automatically redeploy

## Custom Domain (Optional)

To use your own domain:

1. Go to service **Settings**
2. Scroll to **Custom Domain**
3. Add your domain (e.g., `moviebooking.com`)
4. Update DNS records as instructed
5. Render provides free SSL certificates

## Cost Optimization

For production use:

- **Backend**: $7/month (always-on, better performance)
- **Frontend**: $7/month (always-on, better performance)
- **Redis**: Free tier sufficient for small-medium traffic

**Total**: ~$14/month for production-ready deployment

## Security Best Practices

> [!CAUTION]
> Never commit sensitive credentials to your repository!

1. **Use Environment Variables**: All secrets should be in Render environment settings
2. **Rotate Keys Regularly**: Change API keys and passwords periodically
3. **Use Stripe Test Mode**: Until ready for production
4. **Enable 2FA**: On all service accounts (Render, Supabase, Stripe)
5. **Review Logs**: Regularly check for suspicious activity

## Support Resources

- [Render Documentation](https://render.com/docs)
- [Render Community](https://community.render.com/)
- [Supabase Documentation](https://supabase.com/docs)
- [Stripe Documentation](https://stripe.com/docs)

## Next Steps

After successful deployment:

1. ✅ Test all features thoroughly
2. ✅ Set up monitoring and alerts
3. ✅ Configure custom domain (optional)
4. ✅ Switch to Stripe live mode when ready
5. ✅ Set up regular database backups in Supabase
6. ✅ Consider upgrading to paid tier for production

---

**Need Help?** Check the troubleshooting section or review service logs in the Render Dashboard.
