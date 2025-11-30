-- Migration: Add languages and format fields for BookMyShow-style booking flow

-- Add languages field to movies table (JSONB array of available languages)
ALTER TABLE public.movies 
ADD COLUMN IF NOT EXISTS languages JSONB DEFAULT '["English"]'::jsonb;

-- Add format field to showtimes table (2D, 3D, IMAX, etc.)
ALTER TABLE public.showtimes 
ADD COLUMN IF NOT EXISTS format TEXT DEFAULT '2D';

-- Update existing movies to have default language
UPDATE public.movies 
SET languages = '["English"]'::jsonb 
WHERE languages IS NULL;

-- Update existing showtimes to have default format
UPDATE public.showtimes 
SET format = '2D' 
WHERE format IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.movies.languages IS 'Array of available languages for the movie (e.g., ["Hindi", "Tamil", "English"])';
COMMENT ON COLUMN public.showtimes.format IS 'Screening format (e.g., "2D", "3D", "IMAX", "4DX")';
