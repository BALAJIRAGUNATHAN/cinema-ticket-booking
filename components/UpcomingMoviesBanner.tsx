'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface UpcomingMovie {
    id: string;
    title: string;
    banner_image: string;
    description: string;
    release_date: string;
}

export default function UpcomingMoviesBanner() {
    const [movies, setMovies] = useState<UpcomingMovie[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchUpcoming() {
            try {
                const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
                const res = await fetch(`${API_URL}/upcoming-movies?active_only=true`);
                if (res.ok) {
                    const data = await res.json();
                    setMovies(data);
                }
            } catch (error) {
                console.error('Error fetching upcoming movies:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchUpcoming();
    }, []);

    useEffect(() => {
        if (movies.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % movies.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [movies.length]);

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev + 1) % movies.length);
    };

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev - 1 + movies.length) % movies.length);
    };

    if (loading || movies.length === 0) return null;

    return (
        <div className="relative w-full h-[500px] overflow-hidden group">
            {/* Slides */}
            <div
                className="flex transition-transform duration-700 ease-out h-full"
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
                {movies.map((movie) => (
                    <div key={movie.id} className="w-full h-full flex-shrink-0 relative">
                        <div
                            className="absolute inset-0 bg-cover bg-center"
                            style={{ backgroundImage: `url(${movie.banner_image})` }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-[#0F172A]/50 to-transparent"></div>
                        </div>

                        <div className="absolute bottom-0 left-0 w-full p-12 z-10">
                            <div className="max-w-7xl mx-auto">
                                <span className="inline-block px-3 py-1 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-full text-sm font-medium mb-4 backdrop-blur-sm">
                                    Coming {new Date(movie.release_date).toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}
                                </span>
                                <h2 className="text-5xl font-bold text-white mb-4 drop-shadow-lg max-w-3xl leading-tight">
                                    {movie.title}
                                </h2>
                                <p className="text-gray-200 text-lg max-w-2xl line-clamp-2 drop-shadow-md">
                                    {movie.description}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Navigation Buttons */}
            {movies.length > 1 && (
                <>
                    <button
                        onClick={prevSlide}
                        className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/30 text-white hover:bg-white/20 backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                        onClick={nextSlide}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/30 text-white hover:bg-white/20 backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100"
                    >
                        <ChevronRight className="w-6 h-6" />
                    </button>

                    {/* Indicators */}
                    <div className="absolute bottom-6 right-12 flex gap-2">
                        {movies.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentIndex(idx)}
                                className={`w-2 h-2 rounded-full transition-all ${idx === currentIndex ? 'w-8 bg-yellow-500' : 'bg-white/50 hover:bg-white'
                                    }`}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
