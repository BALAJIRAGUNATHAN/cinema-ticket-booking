'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Calendar, Clock, MapPin, Trash2, RefreshCw, Film } from 'lucide-react';

export default function ShowtimesPage() {
    const [showtimes, setShowtimes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [cleaning, setCleaning] = useState(false);

    useEffect(() => {
        fetchShowtimes();
    }, []);

    const fetchShowtimes = async () => {
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            const res = await fetch(`${API_URL}/showtimes?include_expired=true`);
            if (res.ok) {
                const data = await res.json();
                setShowtimes(data);
            }
        } catch (error) {
            console.error('Error fetching showtimes:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this showtime?')) return;

        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            const res = await fetch(`${API_URL}/showtimes/${id}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                fetchShowtimes();
            }
        } catch (error) {
            console.error('Error deleting showtime:', error);
        }
    };

    const handleCleanup = async () => {
        if (!confirm('This will delete all past showtimes. Continue?')) return;
        setCleaning(true);
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            const res = await fetch(`${API_URL}/showtimes/cleanup-expired`, {
                method: 'POST'
            });

            if (res.ok) {
                const data = await res.json();
                alert(data.message);
                fetchShowtimes();
            }
        } catch (error) {
            console.error('Error cleaning up showtimes:', error);
        } finally {
            setCleaning(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 via-emerald-400 to-green-400 bg-clip-text text-transparent">
                        Showtimes
                    </h1>
                    <p className="text-purple-300/60 mt-2">Manage movie schedules and screenings</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleCleanup}
                        disabled={cleaning}
                        className="flex items-center gap-2 px-4 py-2 bg-white/5 text-purple-200 border border-white/10 rounded-xl hover:bg-white/10 transition-all disabled:opacity-50 hover:scale-105"
                    >
                        <RefreshCw className={`w-4 h-4 ${cleaning ? 'animate-spin' : ''}`} />
                        Cleanup Expired
                    </button>
                    <Link
                        href="/admin/showtimes/new"
                        className="group flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 shadow-lg shadow-green-500/30 hover:shadow-green-500/50 hover:scale-105"
                    >
                        <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                        <span className="font-semibold">Add Showtime</span>
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {showtimes.length === 0 ? (
                    <div className="col-span-full py-16 text-center bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10">
                        <div className="flex flex-col items-center gap-4">
                            <div className="p-6 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-full">
                                <Calendar className="w-12 h-12 text-green-400" />
                            </div>
                            <div>
                                <p className="text-xl font-semibold text-white mb-2">No showtimes scheduled</p>
                                <p className="text-purple-300/60">Create a new showtime to get started!</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    showtimes.map((showtime: any) => {
                        const isExpired = new Date(showtime.start_time) < new Date();
                        return (
                            <div
                                key={showtime.id}
                                className={`relative group p-6 rounded-2xl border backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-xl ${isExpired
                                        ? 'bg-red-500/5 border-red-500/20 hover:border-red-500/40'
                                        : 'bg-white/5 border-white/10 hover:border-green-500/30 hover:shadow-green-500/10'
                                    }`}
                            >
                                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => handleDelete(showtime.id)}
                                        className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                                        title="Delete Showtime"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="flex items-start justify-between mb-4 pr-8">
                                    <h3 className="text-lg font-bold text-white line-clamp-1" title={showtime.movie?.title}>
                                        {showtime.movie?.title}
                                    </h3>
                                </div>

                                {isExpired && (
                                    <span className="absolute top-4 right-12 px-2 py-0.5 text-xs bg-red-500/20 text-red-300 border border-red-500/30 rounded-full">
                                        Expired
                                    </span>
                                )}

                                <div className="space-y-3 text-sm">
                                    <div className="flex items-center gap-3 text-purple-200/80">
                                        <div className={`p-2 rounded-lg ${isExpired ? 'bg-red-500/10' : 'bg-green-500/10'}`}>
                                            <Calendar className={`w-4 h-4 ${isExpired ? 'text-red-400' : 'text-green-400'}`} />
                                        </div>
                                        <span>{new Date(showtime.start_time).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                    </div>

                                    <div className="flex items-center gap-3 text-purple-200/80">
                                        <div className={`p-2 rounded-lg ${isExpired ? 'bg-red-500/10' : 'bg-blue-500/10'}`}>
                                            <Clock className={`w-4 h-4 ${isExpired ? 'text-red-400' : 'text-blue-400'}`} />
                                        </div>
                                        <span className="font-mono text-base">{new Date(showtime.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>

                                    <div className="flex items-center gap-3 text-purple-200/80">
                                        <div className={`p-2 rounded-lg ${isExpired ? 'bg-red-500/10' : 'bg-purple-500/10'}`}>
                                            <MapPin className={`w-4 h-4 ${isExpired ? 'text-red-400' : 'text-purple-400'}`} />
                                        </div>
                                        <span>{showtime.screen?.theater?.name} - {showtime.screen?.name}</span>
                                    </div>

                                    <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between">
                                        <div className="flex gap-2">
                                            <span className="px-2 py-1 text-xs bg-white/10 rounded text-purple-200">{showtime.format}</span>
                                            <span className="px-2 py-1 text-xs bg-white/10 rounded text-purple-200">{showtime.language}</span>
                                        </div>
                                        <div className="font-bold text-lg text-white">
                                            ${(showtime.price / 100).toFixed(2)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
