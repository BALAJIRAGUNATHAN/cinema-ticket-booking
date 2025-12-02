import Link from 'next/link';
import { Plus, Edit, Trash2, Film as FilmIcon } from 'lucide-react';
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
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                        Movies
                    </h1>
                    <p className="text-purple-300/60 mt-2">Manage your movie catalog</p>
                </div>
                <Link
                    href="/admin/movies/new"
                    className="group flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-105"
                >
                    <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                    <span className="font-semibold">Add Movie</span>
                </Link>
            </div>

            {/* Table */}
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-b border-white/10">
                        <tr>
                            <th className="px-6 py-4 font-bold text-purple-200 uppercase text-sm tracking-wider">Title</th>
                            <th className="px-6 py-4 font-bold text-purple-200 uppercase text-sm tracking-wider">Genre</th>
                            <th className="px-6 py-4 font-bold text-purple-200 uppercase text-sm tracking-wider">Languages</th>
                            <th className="px-6 py-4 font-bold text-purple-200 uppercase text-sm tracking-wider">Duration</th>
                            <th className="px-6 py-4 font-bold text-purple-200 uppercase text-sm tracking-wider">Release Date</th>
                            <th className="px-6 py-4 font-bold text-purple-200 uppercase text-sm tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {movies.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-16 text-center">
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="p-6 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full">
                                            <FilmIcon className="w-12 h-12 text-purple-400" />
                                        </div>
                                        <div>
                                            <p className="text-xl font-semibold text-white mb-2">No movies found</p>
                                            <p className="text-purple-300/60">Add your first movie to get started!</p>
                                        </div>
                                        <Link
                                            href="/admin/movies/new"
                                            className="mt-4 flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg shadow-blue-500/30"
                                        >
                                            <Plus className="w-5 h-5" />
                                            <span className="font-semibold">Add Your First Movie</span>
                                        </Link>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            movies.map((movie: any) => (
                                <tr key={movie.id} className="hover:bg-white/5 transition-colors duration-200 group">
                                    <td className="px-6 py-4 font-semibold text-white group-hover:text-purple-300 transition-colors">
                                        {movie.title}
                                    </td>
                                    <td className="px-6 py-4 text-purple-200/80">
                                        <span className="px-3 py-1 bg-purple-500/20 rounded-full text-sm">
                                            {movie.genre}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-purple-200/80">
                                        {movie.languages && movie.languages.length > 0
                                            ? movie.languages.join(', ')
                                            : <span className="text-purple-400/40 italic">None</span>}
                                    </td>
                                    <td className="px-6 py-4 text-purple-200/80">{movie.duration} min</td>
                                    <td className="px-6 py-4 text-purple-200/80">{movie.release_date}</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button className="p-2.5 text-purple-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all duration-200 hover:scale-110">
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
