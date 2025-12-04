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

            const res = await fetch(`${API_URL}/showtimes/`, {
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
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent mb-8">Schedule Showtime</h1>

            <form onSubmit={handleSubmit} className="space-y-6 bg-white/5 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-white/10">
                <div>
                    <label className="block text-sm font-medium text-purple-200 mb-1">Select Movie</label>
                    <select
                        required
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all text-white"
                        value={formData.movie_id}
                        onChange={(e) => setFormData({ ...formData, movie_id: e.target.value })}
                    >
                        <option value="" className="bg-slate-800">Select a movie...</option>
                        {movies.map((movie) => (
                            <option key={movie.id} value={movie.id} className="bg-slate-800">{movie.title}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-purple-200 mb-1">Select Screen</label>
                    <select
                        required
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all text-white"
                        value={formData.screen_id}
                        onChange={(e) => setFormData({ ...formData, screen_id: e.target.value })}
                    >
                        <option value="" className="bg-slate-800">Select a screen...</option>
                        {screens.map((screen) => (
                            <option key={screen.id} value={screen.id} className="bg-slate-800">
                                {screen.theater?.name} - {screen.name}
                            </option>
                        ))}
                    </select>
                    {screens.length === 0 && (
                        <p className="text-sm text-red-400 mt-1">No screens found. Please seed the database.</p>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-purple-200 mb-1">Date</label>
                        <input
                            type="date"
                            required
                            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all text-white"
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-purple-200 mb-1">Time</label>
                        <input
                            type="time"
                            required
                            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all text-white"
                            value={formData.time}
                            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-purple-200 mb-1">Price ($)</label>
                    <input
                        type="number"
                        required
                        min="0"
                        step="0.01"
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all text-white placeholder-purple-300/50"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    />
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-purple-200 mb-1">Language</label>
                        <select
                            required
                            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all text-white"
                            value={formData.language}
                            onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                        >
                            <option value="English" className="bg-slate-800">English</option>
                            <option value="Hindi" className="bg-slate-800">Hindi</option>
                            <option value="Tamil" className="bg-slate-800">Tamil</option>
                            <option value="Telugu" className="bg-slate-800">Telugu</option>
                            <option value="Malayalam" className="bg-slate-800">Malayalam</option>
                            <option value="Kannada" className="bg-slate-800">Kannada</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-purple-200 mb-1">Format</label>
                        <select
                            required
                            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all text-white"
                            value={formData.format}
                            onChange={(e) => setFormData({ ...formData, format: e.target.value })}
                        >
                            <option value="2D" className="bg-slate-800">2D</option>
                            <option value="3D" className="bg-slate-800">3D</option>
                            <option value="IMAX" className="bg-slate-800">IMAX</option>
                            <option value="4DX" className="bg-slate-800">4DX</option>
                            <option value="IMAX 3D" className="bg-slate-800">IMAX 3D</option>
                        </select>
                    </div>
                </div>

                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex items-center justify-center px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-700 hover:to-emerald-700 focus:ring-4 focus:ring-green-500/50 transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-green-500/30"
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
