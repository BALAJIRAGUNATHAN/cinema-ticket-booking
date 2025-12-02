# Render Quick Start Guide

## You've Just Installed the Render GitHub App! 🎉

Now complete these steps to deploy your movie booking system:

## Step 1: Grant Repository Access ✅

On the GitHub installation page you're viewing:

1. Choose **"Only select repositories"**
2. Select your **movie-booking-system** repository
3. Click **"Save"** or **"Install"**

## Step 2: Create Blueprint in Render

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New"** → **"Blueprint"**
3. You should see your repository listed - click **"Connect"**
4. Render will detect your `render.yaml` file automatically

## Step 3: Configure Environment Variables

Render will show you all the environment variables that need to be set. Here's what you need:

### Backend Environment Variables

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-service-role-key
STRIPE_SECRET_KEY=sk_test_xxxxx
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-16-char-app-password
```

### Frontend Environment Variables

```
NEXT_PUBLIC_API_URL=https://movie-booking-backend.onrender.com
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
```

> **Note**: The backend URL will be available after the backend service deploys. You can update it later.

## Step 4: Where to Get These Values

### Supabase Credentials
1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Select your project → **Settings** → **API**
3. Copy the values

### Stripe Keys
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. **Developers** → **API keys**
3. Use **test keys** for now

### Gmail App Password
1. [Google Account](https://myaccount.google.com/) → **Security**
2. Enable **2-Step Verification** (if not enabled)
3. **App passwords** → Generate new password for "Mail"

## Step 5: Deploy!

1. After entering all environment variables, click **"Apply"**
2. Render will deploy all three services:
   - ⚡ Redis (~1-2 min)
   - 🐍 Backend (~3-5 min)
   - ⚛️ Frontend (~5-8 min)

## Step 6: Update Frontend API URL

After backend deploys:
1. Copy the backend URL (e.g., `https://movie-booking-backend.onrender.com`)
2. Go to **movie-booking-frontend** service → **Environment**
3. Update `NEXT_PUBLIC_API_URL` with the backend URL
4. Service will auto-redeploy

## Step 7: Test Your Application

Once all services show **"Live"**:

1. **Backend API**: Visit `https://movie-booking-backend.onrender.com/docs`
2. **Frontend**: Visit `https://movie-booking-frontend.onrender.com`
3. **Test booking flow**: Browse → Select movie → Book seats → Pay

Use Stripe test card: `4242 4242 4242 4242`

## Troubleshooting

**Can't find repository?**
- Make sure you granted Render access to the correct repository
- Try refreshing the Render dashboard

**Build fails?**
- Check the logs in Render dashboard
- Verify all environment variables are set correctly

**Services won't start?**
- Ensure Supabase database is accessible
- Check that all required environment variables are configured

## Need More Help?

See the complete guide: [DEPLOYMENT.md](file:///home/cartrabbit/.gemini/antigravity/scratch/movie-booking-system/DEPLOYMENT.md)

---

**Ready to deploy?** Head to [Render Dashboard](https://dashboard.render.com/) and create your Blueprint! 🚀
