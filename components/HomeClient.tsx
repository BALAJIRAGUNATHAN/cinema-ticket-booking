'use client';

import Link from 'next/link';
import { Calendar, Clock, MapPin, Search, Ticket, ArrowRight, Clapperboard, Star } from 'lucide-react';
import { useState, useEffect } from 'react';
import Image from 'next/image';

interface Movie {
    id: string;
    title: string;
    poster_url: string;
    genre: string;
    duration: number;
    release_date: string;
    rating?: number;
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
    const [currentAdIndex, setCurrentAdIndex] = useState(0);

    useEffect(() => {
        fetchAds();
    }, []);

    // Auto-rotate ads every 4 seconds
    useEffect(() => {
        if (ads.length > 0) {
            const timer = setInterval(() => {
                setCurrentAdIndex((prev) => (prev + 1) % ads.length);
            }, 4000);
            return () => clearInterval(timer);
        }
    }, [ads.length]);

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
        <div className="min-h-screen bg-[#020617] text-white selection:bg-yellow-500/30">
            {/* Premium Navbar */}
            <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-[#020617]/80 backdrop-blur-md border-b border-white/5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-20">
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-3 group">
                            <div className="relative w-10 h-10 rounded-xl overflow-hidden shadow-[0_0_20px_rgba(212,175,55,0.2)] group-hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] transition-all duration-500">
                                <Image
                                    src="/cinespot-logo.jpg"
                                    alt="CineSpot"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <span className="text-2xl font-bold text-white tracking-tight">
                                Cine<span className="text-gradient-gold">Spot</span>
                            </span>
                        </Link>

                        {/* Search Bar */}
                        <div className="hidden md:flex flex-1 max-w-xl mx-8">
                            <div className="relative w-full group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-yellow-500 transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Search for movies..."
                                    className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500/50 transition-all text-white placeholder-gray-500"
                                />
                            </div>
                        </div>

                        {/* Right Actions */}
                        <div className="flex items-center gap-6">
                            <Link href="/offers" className="text-sm font-medium text-gray-300 hover:text-yellow-400 transition-colors flex items-center gap-2">
                                <Ticket className="w-4 h-4" />
                                Offers
                            </Link>
                            <Link
                                href="/admin"
                                className="px-6 py-2.5 text-sm font-bold text-[#020617] bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-xl hover:shadow-[0_0_20px_rgba(234,179,8,0.4)] transition-all transform hover:-translate-y-0.5"
                            >
                                Admin Access
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <div className="relative pt-32 pb-20 overflow-hidden">
                {/* Background Glows */}
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-900/20 rounded-full blur-[128px] pointer-events-none"></div>
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-yellow-600/10 rounded-full blur-[128px] pointer-events-none"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                    <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight">
                        Experience <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-yellow-200 to-yellow-500 animate-shine">Cinematic Luxury</span>
                    </h1>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-12 font-light">
                        Immerse yourself in the world of storytelling. Book tickets for the latest blockbusters in premium comfort.
                    </p>

                    {/* Advertisement Slider */}
                    {ads.length > 0 && (
                        <div className="relative max-w-5xl mx-auto rounded-3xl overflow-hidden shadow-2xl shadow-black/50 border border-white/10 aspect-[21/9] group">
                            {ads.map((ad, index) => (
                                <div
                                    key={ad.id}
                                    className={`absolute inset-0 transition-all duration-700 ease-in-out ${index === currentAdIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
                                        }`}
                                >
                                    {ad.link_url ? (
                                        <a href={ad.link_url} target="_blank" rel="noopener noreferrer" className="block h-full relative">
                                            <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent opacity-60"></div>
                                            <img
                                                src={ad.image_url}
                                                alt={ad.title}
                                                className="w-full h-full object-cover"
                                            />
                                        </a>
                                    ) : (
                                        <div className="relative h-full">
                                            <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent opacity-60"></div>
                                            <img
                                                src={ad.image_url}
                                                alt={ad.title}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    )}
                                </div>
                            ))}

                            {/* Slider Indicators */}
                            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-20">
                                {ads.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setCurrentAdIndex(index)}
                                        className={`h-1.5 rounded-full transition-all duration-300 ${index === currentAdIndex ? 'bg-yellow-500 w-8' : 'bg-white/30 w-2 hover:bg-white/50'
                                            }`}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Movies Section */}
            <main className="py-20 relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between mb-12">
                        <div className="flex items-center gap-4">
                            <div className="w-1 h-8 bg-gradient-to-b from-yellow-400 to-yellow-600 rounded-full"></div>
                            <h2 className="text-3xl font-bold text-white">Now Showing</h2>
                        </div>
                        <button className="text-sm font-medium text-yellow-500 hover:text-yellow-400 transition-colors flex items-center gap-2 group">
                            View All
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>

                    {movies.length === 0 ? (
                        <div className="text-center py-32 bg-white/5 rounded-3xl border border-white/5 backdrop-blur-sm">
                            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Clapperboard className="w-10 h-10 text-gray-500" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">No Movies Showing</h3>
                            <p className="text-gray-400">Check back later for new releases.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8">
                            {movies.map((movie) => (
                                <Link key={movie.id} href={`/movie/${movie.id}`} className="group perspective-[1000px]">
                                    <div className="relative transform-style-3d transition-all duration-500 group-hover:-translate-y-2">
                                        {/* Poster Container */}
                                        <div className="aspect-[2/3] relative rounded-2xl overflow-hidden shadow-2xl shadow-black/50 border border-white/10 group-hover:border-yellow-500/50 group-hover:shadow-[0_0_30px_rgba(212,175,55,0.15)] transition-all duration-500">
                                            {movie.poster_url ? (
                                                <img
                                                    src={movie.poster_url}
                                                    alt={movie.title}
                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex flex-col items-center justify-center bg-white/5 text-gray-500 gap-2">
                                                    <Clapperboard className="w-8 h-8 opacity-50" />
                                                    <span className="text-xs uppercase tracking-widest">No Poster</span>
                                                </div>
                                            )}

                                            {/* Overlay Gradient */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300"></div>

                                            {/* Rating Badge */}
                                            <div className="absolute top-3 left-3 px-2.5 py-1 bg-black/60 backdrop-blur-md border border-white/10 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-lg">
                                                <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                                <span>{movie.rating ? movie.rating : '8.5'}</span>
                                            </div>

                                            {/* Hover Action */}
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40 backdrop-blur-[2px]">
                                                <div className="px-6 py-3 bg-yellow-500 text-[#020617] font-bold rounded-xl transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 shadow-lg shadow-yellow-500/20">
                                                    Book Now
                                                </div>
                                            </div>
                                        </div>

                                        {/* Info */}
                                        <div className="mt-4 space-y-1">
                                            <h3 className="font-bold text-white text-lg leading-tight group-hover:text-yellow-500 transition-colors line-clamp-1">
                                                {movie.title}
                                            </h3>
                                            <p className="text-sm text-gray-400 line-clamp-1">
                                                {movie.genre.split(',')[0]} • {Math.floor(movie.duration / 60)}h {movie.duration % 60}m
                                            </p>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-[#020617] border-t border-white/5 py-12 relative overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-1 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                    <div className="flex items-center justify-center gap-3 mb-6">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-lg shadow-yellow-500/20">
                            <span className="font-bold text-[#020617]">C</span>
                        </div>
                        <span className="text-2xl font-bold text-white tracking-tight">Cine<span className="text-gradient-gold">Spot</span></span>
                    </div>
                    <p className="text-gray-500 text-sm">
                        © 2024 CineSpot. Experience Cinema Like Never Before.
                    </p>
                </div>
            </footer>
        </div>
    );
}
