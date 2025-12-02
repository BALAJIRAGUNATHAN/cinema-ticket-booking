'use client';

import Link from 'next/link';
import { Calendar, Clock, MapPin, Search } from 'lucide-react';
import { useState, useEffect } from 'react';
import Image from 'next/image';

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
        <div className="min-h-screen bg-gray-50">
            {/* Header - BookMyShow Style */}
            <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Top Bar */}
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-3">
                            <Image
                                src="/cinespot-logo.jpg"
                                alt="CineSpot"
                                width={40}
                                height={40}
                                className="rounded-lg"
                            />
                            <span className="text-2xl font-bold text-gray-900">CineSpot</span>
                        </Link>

                        {/* Search Bar */}
                        <div className="hidden md:flex flex-1 max-w-xl mx-8">
                            <div className="relative w-full">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search for Movies, Events, Plays, Sports..."
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        {/* Right Actions */}
                        <div className="flex items-center gap-4">
                            <Link href="/offers" className="text-sm font-medium text-gray-700 hover:text-red-600 transition-colors">
                                Offers
                            </Link>
                            <Link
                                href="/admin"
                                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
                            >
                                Admin
                            </Link>
                        </div>
                    </div>

                    {/* Navigation */}
                    <div className="flex items-center gap-6 py-2 border-t border-gray-100 overflow-x-auto">
                        <Link href="/" className="text-sm font-medium text-gray-900 hover:text-red-600 border-b-2 border-red-600 pb-2 whitespace-nowrap">
                            Movies
                        </Link>
                        <Link href="#" className="text-sm font-medium text-gray-600 hover:text-red-600 pb-2 whitespace-nowrap">
                            Events
                        </Link>
                        <Link href="#" className="text-sm font-medium text-gray-600 hover:text-red-600 pb-2 whitespace-nowrap">
                            Plays
                        </Link>
                        <Link href="#" className="text-sm font-medium text-gray-600 hover:text-red-600 pb-2 whitespace-nowrap">
                            Sports
                        </Link>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <div className="bg-gradient-to-r from-red-50 to-orange-50 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                        Welcome to CineSpot
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Experience the magic of cinema. Book your tickets now for the latest movies, exclusive events, and unforgettable moments.
                    </p>
                </div>
            </div>

            {/* Advertisement Slider */}
            {ads.length > 0 && (
                <div className="bg-white py-8">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="relative h-80 rounded-xl overflow-hidden shadow-lg">
                            {ads.map((ad, index) => (
                                <div
                                    key={ad.id}
                                    className={`absolute inset-0 transition-opacity duration-500 ${index === currentAdIndex ? 'opacity-100' : 'opacity-0'
                                        }`}
                                >
                                    {ad.link_url ? (
                                        <a href={ad.link_url} target="_blank" rel="noopener noreferrer" className="block h-full">
                                            <img
                                                src={ad.image_url}
                                                alt={ad.title}
                                                className="w-full h-full object-cover"
                                            />
                                        </a>
                                    ) : (
                                        <img
                                            src={ad.image_url}
                                            alt={ad.title}
                                            className="w-full h-full object-cover"
                                        />
                                    )}
                                </div>
                            ))}

                            {/* Slider Indicators */}
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                                {ads.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setCurrentAdIndex(index)}
                                        className={`w-2 h-2 rounded-full transition-all ${index === currentAdIndex ? 'bg-white w-8' : 'bg-white/50'
                                            }`}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Movies Section */}
            <main className="bg-white py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">Now Showing</h2>
                        <button className="text-sm font-medium text-red-600 hover:text-red-700">
                            See All →
                        </button>
                    </div>

                    {movies.length === 0 ? (
                        <div className="text-center py-20 bg-gray-50 rounded-xl">
                            <p className="text-gray-500 text-lg">No movies currently showing. Check back later!</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                            {movies.map((movie) => (
                                <Link key={movie.id} href={`/movie/${movie.id}`} className="group">
                                    <div className="bg-white rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl border border-gray-200 hover:border-red-200">
                                        {/* Poster */}
                                        <div className="aspect-[2/3] relative overflow-hidden bg-gray-100">
                                            {movie.poster_url ? (
                                                <img
                                                    src={movie.poster_url}
                                                    alt={movie.title}
                                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                    No Poster
                                                </div>
                                            )}
                                            {/* Rating Badge */}
                                            <div className="absolute top-2 left-2 px-2 py-1 bg-black/70 text-white text-xs font-bold rounded">
                                                ★ 8.5/10
                                            </div>
                                        </div>

                                        {/* Info */}
                                        <div className="p-3">
                                            <h3 className="font-bold text-gray-900 mb-1 line-clamp-2 group-hover:text-red-600 transition-colors">
                                                {movie.title}
                                            </h3>
                                            <p className="text-xs text-gray-500 uppercase tracking-wide line-clamp-1 mb-2">
                                                {movie.genre.split(',')[0]}
                                            </p>
                                            <button className="w-full py-1.5 bg-red-600 text-white text-sm font-medium rounded hover:bg-red-700 transition-colors">
                                                Book Now
                                            </button>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-8 mt-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <Image
                            src="/cinespot-logo.jpg"
                            alt="CineSpot"
                            width={32}
                            height={32}
                            className="rounded"
                        />
                        <span className="text-xl font-bold">CineSpot</span>
                    </div>
                    <p className="text-gray-400 text-sm">
                        © 2024 CineSpot. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
}
