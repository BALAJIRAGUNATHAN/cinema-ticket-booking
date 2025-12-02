'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Plus, Trash2, Eye, EyeOff, ArrowUp, ArrowDown, Film, Calendar, X } from 'lucide-react';

interface UpcomingMovie {
    id: string;
    title: string;
    banner_image: string;
    release_date: string;
    description: string;
    display_order: number;
    is_active: boolean;
}

export default function UpcomingMoviesPage() {
    const router = useRouter();
    const [movies, setMovies] = useState<UpcomingMovie[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        title: '',
        banner_image: '',
        release_date: '',
        description: '',
        display_order: 0,
        is_active: true
    });

    useEffect(() => {
        fetchMovies();
    }, []);

    const fetchMovies = async () => {
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            const res = await fetch(`${API_URL}/upcoming-movies?active_only=false`);
            if (res.ok) {
                const data = await res.json();
                setMovies(data);
            }
        } catch (error) {
            console.error('Error fetching upcoming movies:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            const res = await fetch(`${API_URL}/upcoming-movies`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                setIsCreating(false);
                setFormData({
                    title: '',
                    banner_image: '',
                    release_date: '',
                    description: '',
                    display_order: 0,
                    is_active: true
                });
                fetchMovies();
            }
        } catch (error) {
            console.error('Error creating upcoming movie:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this upcoming movie?')) return;

        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            const res = await fetch(`${API_URL}/upcoming-movies/${id}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                fetchMovies();
            }
        } catch (error) {
            console.error('Error deleting upcoming movie:', error);
        }
    };

    const toggleActive = async (movie: UpcomingMovie) => {
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            const res = await fetch(`${API_URL}/upcoming-movies/${movie.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_active: !movie.is_active })
            });

            if (res.ok) {
                fetchMovies();
            }
        } catch (error) {
            console.error('Error updating upcoming movie:', error);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
                        Upcoming Movies
                    </h1>
                    <p className="text-purple-300/60 mt-2">Manage upcoming releases and teasers</p>
                </div>
                <button
                    onClick={() => setIsCreating(!isCreating)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl text-white transition-all duration-300 shadow-lg hover:scale-105 ${isCreating
                            ? 'bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30'
                            : 'bg-gradient-to-r from-blue-600 to-purple-600 shadow-blue-500/30 hover:shadow-blue-500/50'
                        }`}
                >
                    {isCreating ? (
                        <><X className="w-5 h-5" /> Cancel</>
                    ) : (
                        <><Plus className="w-5 h-5" /> Add New Movie</>
                    )}
                </button>
            </div>

            {isCreating && (
                <div className="bg-white/5 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-white/10 animate-in fade-in slide-in-from-top-4 duration-300">
                    <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                        <Film className="w-5 h-5 text-blue-400" />
                        Add Upcoming Movie
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-purple-200 mb-1">Title</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-white placeholder-purple-300/50"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-purple-200 mb-1">Release Date</label>
                                <input
                                    type="date"
                                    required
                                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-white"
                                    value={formData.release_date}
                                    onChange={e => setFormData({ ...formData, release_date: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-purple-200 mb-1">Banner Image URL (Wide)</label>
                            <input
                                type="url"
                                required
                                placeholder="https://..."
                                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-white placeholder-purple-300/50"
                                value={formData.banner_image}
                                onChange={e => setFormData({ ...formData, banner_image: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-purple-200 mb-1">Description</label>
                            <textarea
                                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-white placeholder-purple-300/50"
                                rows={3}
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>

                        <div className="flex items-center gap-8 p-4 bg-white/5 rounded-xl border border-white/10">
                            <div>
                                <label className="block text-sm font-medium text-purple-200 mb-1">Display Order</label>
                                <input
                                    type="number"
                                    className="w-24 px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-white text-center"
                                    value={formData.display_order}
                                    onChange={e => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                                />
                            </div>
                            <div className="flex items-center gap-3 mt-6">
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.is_active}
                                        onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                    <span className="ml-3 text-sm font-medium text-purple-200">Active Status</span>
                                </label>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4 border-t border-white/10">
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-105 transition-all"
                            >
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                                    </span>
                                ) : 'Save Movie'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid gap-6">
                {movies.map((movie) => (
                    <div
                        key={movie.id}
                        className="group bg-white/5 backdrop-blur-xl p-4 rounded-2xl border border-white/10 flex gap-6 items-center hover:bg-white/10 transition-all duration-300 hover:border-blue-500/30 hover:shadow-xl hover:shadow-blue-500/10"
                    >
                        <div className="relative w-64 h-36 rounded-xl overflow-hidden bg-gray-900 shadow-lg group-hover:scale-105 transition-transform duration-500">
                            <img
                                src={movie.banner_image}
                                alt={movie.title}
                                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                            <div className="absolute bottom-3 left-3">
                                <span className={`px-2 py-1 text-xs font-bold rounded-lg ${movie.is_active
                                        ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                                        : 'bg-gray-500/20 text-gray-300 border border-gray-500/30'
                                    }`}>
                                    {movie.is_active ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                        </div>

                        <div className="flex-1 py-2">
                            <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-2xl font-bold text-white group-hover:text-blue-300 transition-colors">{movie.title}</h3>
                            </div>

                            <div className="flex items-center gap-4 mb-3 text-sm text-purple-300/60">
                                <div className="flex items-center gap-1.5">
                                    <Calendar className="w-4 h-4" />
                                    <span>Releases: {new Date(movie.release_date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <ArrowUp className="w-4 h-4" />
                                    <span>Order: {movie.display_order}</span>
                                </div>
                            </div>

                            <p className="text-purple-200/80 line-clamp-2 pr-8">{movie.description}</p>
                        </div>

                        <div className="flex flex-col gap-3 px-4 border-l border-white/10">
                            <button
                                onClick={() => toggleActive(movie)}
                                className={`p-2.5 rounded-xl transition-all duration-300 hover:scale-110 ${movie.is_active
                                        ? 'text-orange-400 hover:bg-orange-500/10 hover:shadow-lg hover:shadow-orange-500/20'
                                        : 'text-green-400 hover:bg-green-500/10 hover:shadow-lg hover:shadow-green-500/20'
                                    }`}
                                title={movie.is_active ? "Deactivate" : "Activate"}
                            >
                                {movie.is_active ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                            <button
                                onClick={() => handleDelete(movie.id)}
                                className="p-2.5 text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-red-500/20"
                                title="Delete"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                ))}

                {movies.length === 0 && !loading && (
                    <div className="text-center py-20 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10">
                        <div className="flex flex-col items-center gap-4">
                            <div className="p-6 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full">
                                <Film className="w-12 h-12 text-blue-400" />
                            </div>
                            <div>
                                <p className="text-xl font-semibold text-white mb-2">No upcoming movies found</p>
                                <p className="text-purple-300/60">Add your first upcoming movie to get started!</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
