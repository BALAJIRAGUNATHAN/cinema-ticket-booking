'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Calendar, Clock, MapPin, Trash2, RefreshCw } from 'lucide-react';

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
        return <div className="p-8 text-center">Loading showtimes...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-900">Showtimes</h1>
                <div className="flex gap-3">
                    <button
                        onClick={handleCleanup}
                        disabled={cleaning}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4 h-4 ${cleaning ? 'animate-spin' : ''}`} />
                        Cleanup Expired
                    </button>
                    <Link
                        href="/admin/showtimes/new"
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Add Showtime
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {showtimes.length === 0 ? (
                    <div className="col-span-full text-center py-12 bg-white rounded-xl border border-gray-100 text-gray-500">
                        No showtimes scheduled. Create one to get started!
                    </div>
                ) : (
                    showtimes.map((showtime: any) => {
                        const isExpired = new Date(showtime.start_time) < new Date();
                        return (
                            <div key={showtime.id} className={`bg-white p-6 rounded-xl shadow-sm border ${isExpired ? 'border-red-100 bg-red-50' : 'border-gray-100'} hover:shadow-md transition-shadow relative group`}>
                                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => handleDelete(showtime.id)}
                                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
                                        title="Delete Showtime"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>

                                <h3 className="text-lg font-bold text-gray-900 mb-2 pr-8">{showtime.movie?.title}</h3>
                                {isExpired && <span className="inline-block px-2 py-0.5 text-xs bg-red-100 text-red-700 rounded-full mb-2">Expired</span>}

                                <div className="space-y-2 text-sm text-gray-600">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-gray-400" />
                                        <span>{new Date(showtime.start_time).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-gray-400" />
                                        <span>{new Date(showtime.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-gray-400" />
                                        <span>{showtime.screen?.theater?.name} - {showtime.screen?.name}</span>
                                    </div>
                                    <div className="pt-2 font-semibold text-gray-900">
                                        ${(showtime.price / 100).toFixed(2)}
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
