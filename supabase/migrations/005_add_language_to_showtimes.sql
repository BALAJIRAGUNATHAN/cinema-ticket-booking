-- Migration: Add language field to showtimes table
-- This was missed in the previous migration

ALTER TABLE public.showtimes 
ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'English';

-- Update existing showtimes to have default language
UPDATE public.showtimes 
SET language = 'English' 
WHERE language IS NULL;

COMMENT ON COLUMN public.showtimes.language IS 'Language of the screening (e.g., "English", "Hindi")';
