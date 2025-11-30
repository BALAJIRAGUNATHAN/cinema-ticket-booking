import Link from 'next/link';
import MovieDetailsClient from '@/components/MovieDetailsClient';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

async function getMovie(id: string) {
    try {
        const res = await fetch(`${API_URL}/movies/${id}`, { cache: 'no-store' });
        if (!res.ok) return null;
        return res.json();
    } catch (error) {
        console.error('Error fetching movie:', error);
        return null;
    }
}

async function getShowtimes(movieId: string) {
    try {
        // Fetch all showtimes and filter by movie ID
        // In a real app, you'd likely have an endpoint like /movies/{id}/showtimes
        const res = await fetch(`${API_URL}/showtimes`, { cache: 'no-store' });
        if (!res.ok) return [];
        const allShowtimes = await res.json();
        return allShowtimes.filter((s: any) => s.movie_id === movieId);
    } catch (error) {
        console.error('Error fetching showtimes:', error);
        return [];
    }
}

export default async function MovieDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const movie = await getMovie(id);
    const showtimes = await getShowtimes(id);

    if (!movie) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0F172A] text-white">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-2">Movie Not Found</h1>
                    <Link href="/" className="text-yellow-500 hover:underline">Return Home</Link>
                </div>
            </div>
        );
    }

    return <MovieDetailsClient movie={movie} showtimes={showtimes} />;
}
