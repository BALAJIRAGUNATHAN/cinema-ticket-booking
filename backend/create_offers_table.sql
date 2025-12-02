-- Run this SQL in your Supabase SQL Editor to create the offers table

create table if not exists offers (
    id uuid default gen_random_uuid() primary key,
    title text not null,
    description text,
    image_url text,
    coupon_code text unique not null,
    discount_type text not null check (discount_type in ('PERCENTAGE', 'FIXED')),
    discount_value numeric not null,
    min_booking_amount numeric default 0,
    max_discount_amount numeric,
    valid_from timestamp with time zone not null,
    valid_until timestamp with time zone not null,
    is_active boolean default true,
    usage_limit integer,
    used_count integer default 0,
    terms_conditions text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create index on coupon_code for fast lookups
create index if not exists idx_offers_coupon_code on offers(coupon_code);

-- Create index on validity dates
create index if not exists idx_offers_validity on offers(valid_until, valid_from);
