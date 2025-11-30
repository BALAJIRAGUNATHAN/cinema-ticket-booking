import Link from 'next/link';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import DeleteMovieButton from '@/components/DeleteMovieButton';

export const revalidate = 0;

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

async function getMovies() {
    try {
        const res = await fetch(`${API_URL}/movies`, { cache: 'no-store' });
        if (!res.ok) throw new Error('Failed to fetch movies');
        return res.json();
    } catch (error) {
        console.error('Error fetching movies:', error);
        return [];
    }
}

export default async function MoviesPage() {
    const movies = await getMovies();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-900">Movies</h1>
                <Link
                    href="/admin/movies/new"
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Add Movie
                </Link>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="px-6 py-4 font-semibold text-gray-700">Title</th>
                            <th className="px-6 py-4 font-semibold text-gray-700">Genre</th>
                            <th className="px-6 py-4 font-semibold text-gray-700">Languages</th>
                            <th className="px-6 py-4 font-semibold text-gray-700">Duration</th>
                            <th className="px-6 py-4 font-semibold text-gray-700">Release Date</th>
                            <th className="px-6 py-4 font-semibold text-gray-700 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {movies.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                    No movies found. Add your first movie!
                                </td>
                            </tr>
                        ) : (
                            movies.map((movie: any) => (
                                <tr key={movie.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900">{movie.title}</td>
                                    <td className="px-6 py-4 text-gray-600">{movie.genre}</td>
                                    <td className="px-6 py-4 text-gray-600">
                                        {movie.languages && movie.languages.length > 0
                                            ? movie.languages.join(', ')
                                            : <span className="text-gray-400 italic">None</span>}
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">{movie.duration} min</td>
                                    <td className="px-6 py-4 text-gray-600">{movie.release_date}</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <DeleteMovieButton movieId={movie.id} />
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
