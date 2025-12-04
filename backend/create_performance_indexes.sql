-- Performance Optimization: Database Indexes
-- Run this script in Supabase SQL Editor to create performance indexes

-- ============================================
-- CRITICAL INDEXES FOR PERFORMANCE
-- ============================================

-- 1. Showtimes Indexes (Most frequently queried)
CREATE INDEX IF NOT EXISTS idx_showtimes_movie_date 
ON showtimes(movie_id, start_time DESC);

CREATE INDEX IF NOT EXISTS idx_showtimes_screen_date 
ON showtimes(screen_id, start_time DESC);

CREATE INDEX IF NOT EXISTS idx_showtimes_active 
ON showtimes(start_time);

-- 2. Bookings Indexes
CREATE INDEX IF NOT EXISTS idx_bookings_showtime_status 
ON bookings(showtime_id, payment_status);

CREATE INDEX IF NOT EXISTS idx_bookings_email 
ON bookings(customer_email);

CREATE INDEX IF NOT EXISTS idx_bookings_created 
ON bookings(created_at DESC);

-- 3. Movies Indexes
CREATE INDEX IF NOT EXISTS idx_movies_active 
ON movies(created_at DESC);

-- 4. Offers Indexes
CREATE INDEX IF NOT EXISTS idx_offers_code_active 
ON offers(coupon_code) 
WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_offers_valid 
ON offers(valid_until DESC) 
WHERE is_active = true;

-- 5. Screens & Theaters (for JOIN optimization)
CREATE INDEX IF NOT EXISTS idx_screens_theater 
ON screens(theater_id);

-- ============================================
-- JSONB INDEXES (for array fields)
-- ============================================

-- Index for seats array in bookings (for faster seat availability checks)
CREATE INDEX IF NOT EXISTS idx_bookings_seats_gin 
ON bookings USING GIN (seats);

-- Index for languages array in movies
CREATE INDEX IF NOT EXISTS idx_movies_languages_gin 
ON movies USING GIN (languages);

-- ============================================
-- COMPOSITE INDEXES (for complex queries)
-- ============================================

-- For showtime queries with movie and date filters
CREATE INDEX IF NOT EXISTS idx_showtimes_movie_screen_date 
ON showtimes(movie_id, screen_id, start_time DESC);

-- For booking queries with multiple filters
CREATE INDEX IF NOT EXISTS idx_bookings_showtime_email_status 
ON bookings(showtime_id, customer_email, payment_status);

-- ============================================
-- ANALYZE TABLES (Update statistics)
-- ============================================

ANALYZE movies;
ANALYZE showtimes;
ANALYZE bookings;
ANALYZE screens;
ANALYZE theaters;
ANALYZE offers;

-- ============================================
-- VERIFY INDEXES
-- ============================================

-- Run this query to see all indexes created
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- ============================================
-- PERFORMANCE MONITORING QUERIES
-- ============================================

-- Check table sizes
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Check index usage
SELECT 
    schemaname,
    relname as tablename,
    indexrelname as indexname,
    idx_scan as index_scans,
    idx_tup_read as tuples_read,
    idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;
