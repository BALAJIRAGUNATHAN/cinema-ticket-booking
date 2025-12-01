'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function NewShowtimePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [movies, setMovies] = useState<any[]>([]);
    const [screens, setScreens] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        movie_id: '',
        screen_id: '',
        date: '',
        time: '',
        price: '',
        language: 'English',
        format: '2D',
    });

    useEffect(() => {
        async function fetchData() {
            console.log('Fetching data from:', API_URL);
            try {
                // Fetch movies from backend (note trailing slash)
                console.log('Fetching movies...');
                const moviesRes = await fetch(`${API_URL}/movies/`);
                console.log('Movies response status:', moviesRes.status);
                if (moviesRes.ok) {
                    const moviesData = await moviesRes.json();
                    console.log('Movies data:', moviesData);
                    setMovies(moviesData);
                }

                // Fetch screens from backend (note trailing slash)
                console.log('Fetching screens...');
                const screensRes = await fetch(`${API_URL}/screens/`);
                console.log('Screens response status:', screensRes.status);
                if (screensRes.ok) {
                    const screensData = await screensRes.json();
                    console.log('Screens data:', screensData);
                    setScreens(screensData);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        }
        fetchData();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const start_time = new Date(`${formData.date}T${formData.time}`).toISOString();
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

            const res = await fetch(`${API_URL}/showtimes`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    movie_id: formData.movie_id,
                    screen_id: formData.screen_id,
                    start_time,
                    price: Math.round(parseFloat(formData.price) * 100),
                    language: formData.language,
                    format: formData.format,
                }),
            });

            if (!res.ok) throw new Error('Failed to create showtime');

            router.push('/admin/showtimes');
            router.refresh();
        } catch (error) {
            console.error('Error creating showtime:', error);
            alert('Error creating showtime. Please check console.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Schedule Showtime</h1>

            <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Select Movie</label>
                    <select
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        value={formData.movie_id}
                        onChange={(e) => setFormData({ ...formData, movie_id: e.target.value })}
                    >
                        <option value="">Select a movie...</option>
                        {movies.map((movie) => (
                            <option key={movie.id} value={movie.id}>{movie.title}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Select Screen</label>
                    <select
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        value={formData.screen_id}
                        onChange={(e) => setFormData({ ...formData, screen_id: e.target.value })}
                    >
                        <option value="">Select a screen...</option>
                        {screens.map((screen) => (
                            <option key={screen.id} value={screen.id}>
                                {screen.theater?.name} - {screen.name}
                            </option>
                        ))}
                    </select>
                    {screens.length === 0 && (
                        <p className="text-sm text-red-500 mt-1">No screens found. Please seed the database.</p>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                        <input
                            type="date"
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                        <input
                            type="time"
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            value={formData.time}
                            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                    <input
                        type="number"
                        required
                        min="0"
                        step="0.01"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    />
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                        <select
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            value={formData.language}
                            onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                        >
                            <option value="English">English</option>
                            <option value="Hindi">Hindi</option>
                            <option value="Tamil">Tamil</option>
                            <option value="Telugu">Telugu</option>
                            <option value="Malayalam">Malayalam</option>
                            <option value="Kannada">Kannada</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Format</label>
                        <select
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            value={formData.format}
                            onChange={(e) => setFormData({ ...formData, format: e.target.value })}
                        >
                            <option value="2D">2D</option>
                            <option value="3D">3D</option>
                            <option value="IMAX">IMAX</option>
                            <option value="4DX">4DX</option>
                            <option value="IMAX 3D">IMAX 3D</option>
                        </select>
                    </div>
                </div>

                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                Scheduling...
                            </>
                        ) : (
                            'Create Showtime'
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
