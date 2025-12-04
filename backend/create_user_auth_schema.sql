-- User Authentication & Profiles - Database Setup
-- Run this in Supabase SQL Editor

-- ============================================
-- 1. USER PROFILES TABLE
-- ============================================

-- Create user_profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);

-- ============================================
-- 2. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

-- Policy: Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

-- ============================================
-- 3. AUTOMATIC PROFILE CREATION TRIGGER
-- ============================================

-- Function to create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call function on user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 4. UPDATE BOOKINGS TABLE
-- ============================================

-- Add user_id column to bookings (if not exists)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE bookings ADD COLUMN user_id UUID REFERENCES auth.users(id);
  END IF;
END $$;

-- Create index for user bookings
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);

-- Enable RLS on bookings
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own bookings (or guest bookings)
CREATE POLICY "Users can view own bookings"
  ON bookings FOR SELECT
  USING (
    auth.uid() = user_id OR 
    user_id IS NULL OR
    auth.role() = 'service_role'
  );

-- Policy: Authenticated users can create bookings
CREATE POLICY "Authenticated users can create bookings"
  ON bookings FOR INSERT
  WITH CHECK (
    auth.uid() = user_id OR 
    user_id IS NULL
  );

-- Policy: Service role can do anything (for backend)
CREATE POLICY "Service role has full access to bookings"
  ON bookings FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================
-- 5. HELPER FUNCTIONS
-- ============================================

-- Function to get user's booking history
CREATE OR REPLACE FUNCTION get_user_bookings(user_uuid UUID)
RETURNS TABLE (
  id UUID,
  showtime_id UUID,
  customer_name TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  seats JSONB,
  total_amount INTEGER,
  payment_status TEXT,
  payment_intent_id TEXT,
  coupon_code TEXT,
  discount_amount INTEGER,
  created_at TIMESTAMPTZ,
  movie_title TEXT,
  theater_name TEXT,
  screen_name TEXT,
  start_time TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    b.id,
    b.showtime_id,
    b.customer_name,
    b.customer_email,
    b.customer_phone,
    b.seats,
    b.total_amount,
    b.payment_status,
    b.payment_intent_id,
    b.coupon_code,
    b.discount_amount,
    b.created_at,
    m.title as movie_title,
    t.name as theater_name,
    s.name as screen_name,
    sh.start_time
  FROM bookings b
  JOIN showtimes sh ON b.showtime_id = sh.id
  JOIN movies m ON sh.movie_id = m.id
  JOIN screens s ON sh.screen_id = s.id
  JOIN theaters t ON s.theater_id = t.id
  WHERE b.user_id = user_uuid
  ORDER BY b.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_user_bookings(UUID) TO authenticated;

-- ============================================
-- 6. UPDATE EXISTING DATA (OPTIONAL)
-- ============================================

-- Migrate existing bookings to users based on email (optional)
-- Uncomment if you want to link existing bookings to users

/*
UPDATE bookings b
SET user_id = (
  SELECT id FROM auth.users u 
  WHERE u.email = b.customer_email
  LIMIT 1
)
WHERE user_id IS NULL 
  AND customer_email IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM auth.users u 
    WHERE u.email = b.customer_email
  );
*/

-- ============================================
-- 7. VERIFY SETUP
-- ============================================

-- Check if tables exist
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
  AND table_name IN ('user_profiles', 'bookings')
ORDER BY table_name;

-- Check RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename IN ('user_profiles', 'bookings')
ORDER BY tablename, policyname;
