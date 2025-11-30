'use client';

import { Trash2, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DeleteMovieButton({ movieId }: { movieId: string }) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this movie? This action cannot be undone.')) return;

        setLoading(true);
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            const res = await fetch(`${API_URL}/movies/${movieId}`, {
                method: 'DELETE',
            });

            if (!res.ok) throw new Error('Failed to delete movie');

            router.refresh();
        } catch (error) {
            console.error('Error deleting movie:', error);
            alert('Failed to delete movie');
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleDelete}
            disabled={loading}
            className="p-2 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
            title="Delete Movie"
        >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
        </button>
    );
}
