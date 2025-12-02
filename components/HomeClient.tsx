'use client';

import Link from 'next/link';
import { Calendar, Clock, Ticket } from 'lucide-react';
import UpcomingMoviesBanner from '@/components/UpcomingMoviesBanner';
import { useState, useEffect } from 'react';

interface Movie {
    id: string;
    title: string;
    poster_url: string;
    genre: string;
    duration: number;
    release_date: string;
}

interface Advertisement {
    id: string;
    title: string;
    image_url: string;
    link_url: string | null;
    is_active: boolean;
    display_order: number;
}

interface HomeClientProps {
    movies: Movie[];
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function HomeClient({ movies }: HomeClientProps) {
    const [ads, setAds] = useState<Advertisement[]>([]);

    useEffect(() => {
        fetchAds();
    }, []);

    const fetchAds = async () => {
        try {
            const res = await fetch(`${API_URL}/ads`);
            const data = await res.json();
            setAds(data);
        } catch (error) {
            console.error('Error fetching ads:', error);
        }
    };

    return (
        <div className="min-h-screen bg-[#0F172A] text-white">
            {/* Header */}
            <header className="fixed w-full z-50 glass border-b border-white/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-full gradient-gold flex items-center justify-center">
                            <Ticket className="w-6 h-6 text-[#0F172A]" />
                        </div>
                        <span className="text-2xl font-bold text-gradient-gold tracking-tight">LUMIÈRE</span>
                    </Link>
                    <Link
                        href="/admin"
                        className="px-6 py-2 rounded-full border border-white/20 hover:bg-white/10 transition-all text-sm font-medium tracking-wide"
                    >
                        Admin Access
                    </Link>
                </div>
            </header>

            {/* Hero Section with Upcoming Movies */}
            <div className="pt-20">
                <UpcomingMoviesBanner />
            </div>

            {/* Advertisements Section */}
            {ads.length > 0 && (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="h-8 w-1 bg-gradient-to-b from-orange-500 to-pink-500 rounded-full"></div>
                        <h3 className="text-3xl font-bold text-white">Special Offers</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {ads.map((ad) => (
                            ad.link_url ? (
                                <a
                                    key={ad.id}
                                    href={ad.link_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group relative overflow-hidden rounded-2xl glass-card hover:scale-105 transition-all duration-300 hover:shadow-2xl hover:shadow-orange-500/20"
                                >
                                    <div className="aspect-[16/9] relative">
                                        <img
                                            src={ad.image_url}
                                            alt={ad.title}
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                                        <div className="absolute bottom-0 left-0 right-0 p-6">
                                            <h4 className="text-xl font-bold text-white group-hover:text-yellow-400 transition-colors">
                                                {ad.title}
                                            </h4>
                                            <p className="text-sm text-gray-300 mt-1">Click to learn more →</p>
                                        </div>
                                    </div>
                                </a>
                            ) : (
                                <div
                                    key={ad.id}
                                    className="relative overflow-hidden rounded-2xl glass-card"
                                >
                                    <div className="aspect-[16/9] relative">
                                        <img
                                            src={ad.image_url}
                                            alt={ad.title}
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                                        <div className="absolute bottom-0 left-0 right-0 p-6">
                                            <h4 className="text-xl font-bold text-white">{ad.title}</h4>
                                        </div>
                                    </div>
                                </div>
                            )
                        ))}
                    </div>
                </div>
            )}

            {/* Tagline Section */}
            <div className="relative py-24 overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-10"></div>
                <div className="absolute inset-0 gradient-overlay"></div>
                <div className="relative max-w-4xl mx-auto text-center px-4">
                    <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                        Experience the <span className="text-gradient-gold">magic of cinema</span>
                    </h2>
                    <p className="text-xl text-gray-300 font-light tracking-wide">
                        Browse the latest movies and book your seats in seconds.
                    </p>
                </div>
            </div>

            {/* Movie Grid */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
                <div className="flex items-center gap-4 mb-12">
                    <div className="h-8 w-1 gradient-gold rounded-full"></div>
                    <h3 className="text-3xl font-bold text-white">Now Showing</h3>
                </div>

                {movies.length === 0 ? (
                    <div className="text-center py-20 glass rounded-2xl">
                        <p className="text-gray-400 text-lg">No movies currently showing. Check back later!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {movies.map((movie) => (
                            <Link key={movie.id} href={`/movie/${movie.id}`} className="group">
                                <div className="glass-card rounded-xl overflow-hidden transition-all duration-500 hover:transform hover:scale-[1.03] hover:shadow-2xl hover:shadow-purple-900/30 h-full flex flex-col border border-white/10 hover:border-yellow-500/50">
                                    <div className="aspect-[2/3] relative overflow-hidden">
                                        {movie.poster_url ? (
                                            <img
                                                src={movie.poster_url}
                                                alt={movie.title}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-600">
                                                No Poster
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-transparent to-transparent opacity-60"></div>

                                        <div className="absolute bottom-0 left-0 w-full p-4 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                                            <span className="inline-block px-3 py-1 bg-gradient-to-r from-yellow-500 to-yellow-600 text-[#0F172A] text-xs font-bold rounded-full mb-2 shadow-lg">
                                                {movie.genre.split(',')[0]}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="p-5 flex-1 flex flex-col bg-gradient-to-b from-slate-900/80 to-slate-900/90">
                                        <h4 className="text-xl font-bold text-white mb-2 line-clamp-2 group-hover:text-yellow-400 transition-colors">
                                            {movie.title}
                                        </h4>

                                        <div className="mt-auto space-y-3">
                                            <div className="flex items-center justify-between text-sm text-gray-400 border-t border-white/10 pt-3">
                                                <div className="flex items-center gap-1.5">
                                                    <Clock className="w-4 h-4 text-yellow-500" />
                                                    <span>{movie.duration} min</span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <Calendar className="w-4 h-4 text-yellow-500" />
                                                    <span>{new Date(movie.release_date).getFullYear()}</span>
                                                </div>
                                            </div>

                                            <button className="w-full py-2.5 rounded-lg gradient-gold text-[#0F172A] font-bold text-sm tracking-wide opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 shadow-lg shadow-yellow-500/20">
                                                BOOK TICKETS
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
