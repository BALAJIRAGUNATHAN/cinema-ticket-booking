-- Add coupon_code and discount_amount columns to the bookings table
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS coupon_code text,
ADD COLUMN IF NOT EXISTS discount_amount integer DEFAULT 0;

-- Optional: Add an index for coupon_code if you plan to query bookings by coupon often
CREATE INDEX IF NOT EXISTS idx_bookings_coupon_code ON bookings(coupon_code);
