'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Plus, Trash2, Eye, EyeOff, ArrowUp, ArrowDown } from 'lucide-react';

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
        <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Upcoming Movies</h1>
                <button
                    onClick={() => setIsCreating(!isCreating)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    {isCreating ? 'Cancel' : <><Plus className="w-4 h-4" /> Add New</>}
                </button>
            </div>

            {isCreating && (
                <div className="mb-8 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-semibold mb-4">Add Upcoming Movie</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-3 py-2 border rounded-lg"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Release Date</label>
                                <input
                                    type="date"
                                    required
                                    className="w-full px-3 py-2 border rounded-lg"
                                    value={formData.release_date}
                                    onChange={e => setFormData({ ...formData, release_date: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Banner Image URL (Wide)</label>
                            <input
                                type="url"
                                required
                                placeholder="https://..."
                                className="w-full px-3 py-2 border rounded-lg"
                                value={formData.banner_image}
                                onChange={e => setFormData({ ...formData, banner_image: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea
                                className="w-full px-3 py-2 border rounded-lg"
                                rows={3}
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>

                        <div className="flex items-center gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
                                <input
                                    type="number"
                                    className="w-24 px-3 py-2 border rounded-lg"
                                    value={formData.display_order}
                                    onChange={e => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                                />
                            </div>
                            <div className="flex items-center gap-2 mt-6">
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    checked={formData.is_active}
                                    onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                                    className="w-4 h-4 text-blue-600 rounded"
                                />
                                <label htmlFor="is_active" className="text-sm font-medium text-gray-700">Active</label>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                            >
                                {loading ? 'Saving...' : 'Save Movie'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid gap-6">
                {movies.map((movie) => (
                    <div key={movie.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-6 items-center">
                        <img
                            src={movie.banner_image}
                            alt={movie.title}
                            className="w-48 h-28 object-cover rounded-lg bg-gray-100"
                        />
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                                <h3 className="text-xl font-bold text-gray-900">{movie.title}</h3>
                                <span className={`px-2 py-0.5 text-xs rounded-full ${movie.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                    {movie.is_active ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                            <p className="text-sm text-gray-500 mb-2">Releases: {new Date(movie.release_date).toLocaleDateString()}</p>
                            <p className="text-gray-600 line-clamp-2">{movie.description}</p>
                        </div>
                        <div className="flex flex-col gap-2">
                            <button
                                onClick={() => toggleActive(movie)}
                                className={`p-2 rounded-lg transition-colors ${movie.is_active ? 'text-orange-600 hover:bg-orange-50' : 'text-green-600 hover:bg-green-50'}`}
                                title={movie.is_active ? "Deactivate" : "Activate"}
                            >
                                {movie.is_active ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                            <button
                                onClick={() => handleDelete(movie.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                ))}

                {movies.length === 0 && !loading && (
                    <div className="text-center py-12 text-gray-500">
                        No upcoming movies found. Add one to get started!
                    </div>
                )}
            </div>
        </div>
    );
}
