-- Add cast column to movies table
ALTER TABLE movies 
ADD COLUMN IF NOT EXISTS cast JSONB DEFAULT '[]';

COMMENT ON COLUMN movies.cast IS 'Array of cast members: [{"name": "Actor Name", "role": "Character", "image": "url"}]';

-- Create upcoming_movies table
CREATE TABLE IF NOT EXISTS upcoming_movies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    banner_image TEXT NOT NULL,
    release_date DATE NOT NULL,
    description TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index for active upcoming movies
CREATE INDEX IF NOT EXISTS idx_upcoming_movies_active 
ON upcoming_movies(is_active, display_order);

-- Enable RLS
ALTER TABLE upcoming_movies ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Public can view active upcoming movies"
ON upcoming_movies FOR SELECT
USING (is_active = true);

-- Create policy for authenticated insert/update/delete (for admin)
CREATE POLICY "Authenticated users can manage upcoming movies"
ON upcoming_movies FOR ALL
USING (true);

COMMENT ON TABLE upcoming_movies IS 'Upcoming movie advertisements shown on customer home page';
