'use client';

import Link from 'next/link';
import { Calendar, Clock, MapPin, Search, Ticket, ArrowRight, Clapperboard, Star } from 'lucide-react';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { AdSliderSkeleton, MovieGridSkeleton } from './Skeletons';

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
    const [adsLoading, setAdsLoading] = useState(true);

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
            setAdsLoading(true);
            const res = await fetch(`${API_URL}/ads`);
            const data = await res.json();
            setAds(data);
        } catch (error) {
            console.error('Error fetching ads:', error);
        } finally {
            setAdsLoading(false);
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
                    {adsLoading ? (
                        <AdSliderSkeleton />
                    ) : ads.length > 0 ? (
                        <div className="relative h-[400px] rounded-3xl overflow-hidden group mt-16">
                            {/* Slider Container */}
                            {ads.map((ad, index) => (
                                <div
                                    key={ad.id}
                                    className={`absolute inset-0 transition-opacity duration-700 ${index === currentAdIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
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
                    ) : null}
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
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                            {movies.map((movie) => (
                                <Link
                                    key={movie.id}
                                    href={`/movie/${movie.id}`}
                                    className="group relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-yellow-500/30 transition-all duration-500 hover:shadow-[0_0_40px_rgba(234,179,8,0.15)] hover:-translate-y-2"
                                >
                                    <div className="relative aspect-[2/3] overflow-hidden">
                                        {/* Rating Badge */}
                                        <div className="absolute top-3 right-3 z-10 px-3 py-1.5 bg-black/60 backdrop-blur-md rounded-full border border-yellow-500/30 flex items-center gap-1.5">
                                            <Star className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500" />
                                            <span className="text-xs font-bold text-yellow-500">{movie.rating || '8.5'}/10</span>
                                        </div>

                                        {/* Poster */}
                                        <img
                                            src={movie.poster_url}
                                            alt={movie.title}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        />

                                        {/* Overlay */}
                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40 backdrop-blur-[2px]">
                                            <div className="px-6 py-3 bg-yellow-500 text-[#020617] font-bold rounded-xl transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 shadow-lg shadow-yellow-500/20">
                                                Book Now
                                            </div>
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
