-- Create movies table
create table public.movies (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  poster_url text,
  genre text,
  duration integer, -- in minutes
  release_date date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create theaters table
create table public.theaters (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  location text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create screens table
create table public.screens (
  id uuid default gen_random_uuid() primary key,
  theater_id uuid references public.theaters(id) on delete cascade not null,
  name text not null,
  seat_layout jsonb not null, -- { rows: 10, cols: 15, aisles: [] }
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create showtimes table
create table public.showtimes (
  id uuid default gen_random_uuid() primary key,
  movie_id uuid references public.movies(id) on delete cascade not null,
  screen_id uuid references public.screens(id) on delete cascade not null,
  start_time timestamp with time zone not null,
  price integer not null, -- in cents
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create bookings table
create table public.bookings (
  id uuid default gen_random_uuid() primary key,
  showtime_id uuid references public.showtimes(id) on delete cascade not null,
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  seats jsonb not null, -- ["A1", "A2"]
  total_amount integer not null, -- in cents
  payment_status text not null default 'pending', -- pending, paid, failed
  stripe_payment_intent_id text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS (Row Level Security)
alter table public.movies enable row level security;
alter table public.theaters enable row level security;
alter table public.screens enable row level security;
alter table public.showtimes enable row level security;
alter table public.bookings enable row level security;

-- Create policies (Public Read, Admin Write - for now we'll just allow public write for MVP as requested "without authentication" but practically we should limit it. 
-- Since the user asked for "without authentication", we will allow public access for simplicity, but in a real app this is dangerous.)

-- Movies: Public read, Public write (for Admin)
create policy "Allow public read on movies" on public.movies for select using (true);
create policy "Allow public insert on movies" on public.movies for insert with check (true);
create policy "Allow public update on movies" on public.movies for update using (true);
create policy "Allow public delete on movies" on public.movies for delete using (true);

-- Theaters: Public read, Public write
create policy "Allow public read on theaters" on public.theaters for select using (true);
create policy "Allow public insert on theaters" on public.theaters for insert with check (true);
create policy "Allow public update on theaters" on public.theaters for update using (true);
create policy "Allow public delete on theaters" on public.theaters for delete using (true);

-- Screens: Public read, Public write
create policy "Allow public read on screens" on public.screens for select using (true);
create policy "Allow public insert on screens" on public.screens for insert with check (true);
create policy "Allow public update on screens" on public.screens for update using (true);
create policy "Allow public delete on screens" on public.screens for delete using (true);

-- Showtimes: Public read, Public write
create policy "Allow public read on showtimes" on public.showtimes for select using (true);
create policy "Allow public insert on showtimes" on public.showtimes for insert with check (true);
create policy "Allow public update on showtimes" on public.showtimes for update using (true);
create policy "Allow public delete on showtimes" on public.showtimes for delete using (true);

-- Bookings: Public read, Public write
create policy "Allow public read on bookings" on public.bookings for select using (true);
create policy "Allow public insert on bookings" on public.bookings for insert with check (true);
create policy "Allow public update on bookings" on public.bookings for update using (true);
