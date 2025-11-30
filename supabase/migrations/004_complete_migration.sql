-- Comprehensive migration to add all missing columns
-- Run this in Supabase SQL Editor

-- Add trailer_url column (from previous migration)
ALTER TABLE public.movies 
ADD COLUMN IF NOT EXISTS trailer_url TEXT;

-- Add cast column (from previous migration)
ALTER TABLE public.movies 
ADD COLUMN IF NOT EXISTS cast JSONB DEFAULT '[]'::jsonb;

-- Add languages field to movies table
ALTER TABLE public.movies 
ADD COLUMN IF NOT EXISTS languages JSONB DEFAULT '["English"]'::jsonb;

-- Add format field to showtimes table
ALTER TABLE public.showtimes 
ADD COLUMN IF NOT EXISTS format TEXT DEFAULT '2D';

-- Update existing movies to have default values
UPDATE public.movies 
SET trailer_url = '' 
WHERE trailer_url IS NULL;

UPDATE public.movies 
SET cast = '[]'::jsonb 
WHERE cast IS NULL;

UPDATE public.movies 
SET languages = '["English"]'::jsonb 
WHERE languages IS NULL;

-- Update existing showtimes to have default format
UPDATE public.showtimes 
SET format = '2D' 
WHERE format IS NULL;

-- Add comments for documentation
COMMENT ON COLUMN public.movies.trailer_url IS 'YouTube trailer URL';
COMMENT ON COLUMN public.movies.cast IS 'Array of cast members with name, role, and image';
COMMENT ON COLUMN public.movies.languages IS 'Array of available languages for the movie (e.g., ["Hindi", "Tamil", "English"])';
COMMENT ON COLUMN public.showtimes.format IS 'Screening format (e.g., "2D", "3D", "IMAX", "4DX")';
