-- Database Function: Get Movies with Active Showtimes
-- This function efficiently returns only movies that have future showtimes
-- Run this in Supabase SQL Editor for optimal performance

CREATE OR REPLACE FUNCTION get_movies_with_active_showtimes(query_time timestamp with time zone)
RETURNS TABLE (
    id uuid,
    title text,
    poster_url text,
    genre text,
    duration integer,
    release_date date,
    description text,
    trailer_url text,
    languages jsonb,
    movie_cast jsonb,
    created_at timestamp with time zone
) 
LANGUAGE sql
STABLE
AS $$
    SELECT DISTINCT ON (m.id)
        m.id,
        m.title,
        m.poster_url,
        m.genre,
        m.duration,
        m.release_date,
        m.description,
        m.trailer_url,
        m.languages,
        m.cast as movie_cast,
        m.created_at
    FROM movies m
    INNER JOIN showtimes s ON m.id = s.movie_id
    WHERE s.start_time >= query_time
    ORDER BY m.id, m.created_at DESC;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_movies_with_active_showtimes(timestamp with time zone) TO anon, authenticated;

-- Test the function
SELECT * FROM get_movies_with_active_showtimes(NOW());
