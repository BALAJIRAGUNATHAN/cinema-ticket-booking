'use client';

import Link from 'next/link';
import { Clock, Calendar, Star, Play, ArrowLeft, Languages } from 'lucide-react';
import { formatDuration } from '@/lib/utils';
import ShareButton from '@/components/ShareButton';
import LanguageFormatModal from '@/components/LanguageFormatModal';
import { useState } from 'react';

interface Movie {
    id: string;
    title: string;
    poster_url: string;
    genre: string;
    duration: number;
    release_date: string;
    description: string;
    trailer_url?: string;
    languages?: string[];
    cast?: { name: string; role: string; image?: string }[];
}

interface Showtime {
    id: string;
    movie_id: string;
    theater_id: string;
    start_time: string;
    language: string;
    format: string;
    price: number;
    screen?: {
        name: string;
        theater?: {
            name: string;
        };
    };
}

interface MovieDetailsClientProps {
    movie: Movie;
    showtimes: Showtime[];
}

export default function MovieDetailsClient({ movie, showtimes }: MovieDetailsClientProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedLanguage, setSelectedLanguage] = useState('');
    const [selectedFormat, setSelectedFormat] = useState('');
    const [filteredShowtimes, setFilteredShowtimes] = useState<Showtime[]>([]);

    // Prioritize showtime data - only show languages and formats that have actual showtimes
    // If no showtimes exist, fall back to movie languages as defaults
    const availableLanguages = showtimes.length > 0
        ? Array.from(new Set(showtimes.map(s => s.language)))
        : Array.from(new Set(movie.languages && movie.languages.length > 0 ? movie.languages : ['English', 'Hindi', 'Tamil']));

    console.log('Showtimes:', showtimes);
    console.log('Movie Languages:', movie.languages);
    console.log('Available Languages:', availableLanguages);

    const formats = showtimes.length > 0
        ? Array.from(new Set(showtimes.map(s => s.format)))
        : ['2D', 'IMAX', '3D'];

    const handleApply = (language: string, format: string) => {
        setSelectedLanguage(language);
        setSelectedFormat(format);
        const filtered = showtimes.filter(
            s => s.language === language && s.format === format
        );
        setFilteredShowtimes(filtered);
        console.log('Applied filters:', language, format, filtered);
    };

    // Group showtimes by theater
    const showtimesByTheater = filteredShowtimes.reduce((acc, showtime) => {
        const theaterName = showtime.screen?.theater?.name || 'Unknown Theater';
        if (!acc[theaterName]) {
            acc[theaterName] = [];
        }
        acc[theaterName].push(showtime);
        return acc;
    }, {} as Record<string, Showtime[]>);

    return (
        <div className="min-h-screen bg-[#0F172A] text-white">
            {/* Back Button */}
            <div className="absolute top-6 left-6 z-50">
                <Link
                    href="/"
                    className="flex items-center gap-2 px-4 py-2 bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-full text-white transition-all border border-white/10"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span className="font-medium">Back</span>
                </Link>
            </div>

            {/* Hero Section with Backdrop */}
            <div className="relative h-[85vh] w-full overflow-hidden">
                {/* Backdrop Image */}
                <div
                    className="absolute inset-0 bg-cover bg-center scale-110"
                    style={{ backgroundImage: `url(${movie.poster_url})` }}
                />
                {/* Gradient Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-[#0F172A]/90 to-[#0F172A]/40" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#0F172A] via-transparent to-[#0F172A]/60" />

                {/* Content */}
                <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-end pb-16">
                    <div className="flex flex-col md:flex-row gap-10 items-end w-full">
                        {/* Poster Card */}
                        <div className="relative group">
                            <div className="w-72 rounded-2xl overflow-hidden shadow-2xl border-4 border-white/20 transform hover:scale-105 transition-all duration-500">
                                <img
                                    src={movie.poster_url}
                                    alt={movie.title}
                                    className="w-full h-auto object-cover aspect-[2/3]"
                                />
                            </div>
                            {/* Glow Effect */}
                            <div className="absolute inset-0 bg-gradient-to-t from-yellow-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
                        </div>

                        {/* Movie Info */}
                        <div className="flex-1 space-y-6 pb-4">
                            {/* Genre & Rating */}
                            <div className="flex items-center gap-4 flex-wrap">
                                <span className="px-4 py-2 bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 text-yellow-400 text-sm font-bold uppercase tracking-wider rounded-full border border-yellow-500/30 backdrop-blur-sm">
                                    {movie.genre}
                                </span>
                                <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/10">
                                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                                    <span className="font-bold text-lg">4.8</span>
                                    <span className="text-gray-400 text-sm">(2.4k)</span>
                                </div>
                            </div>

                            {/* Title */}
                            <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight leading-none">
                                {movie.title}
                            </h1>

                            {/* Meta Info */}
                            <div className="flex items-center gap-8 text-gray-300 text-base flex-wrap">
                                <div className="flex items-center gap-2">
                                    <Clock className="w-5 h-5 text-yellow-500" />
                                    <span className="font-medium">{formatDuration(movie.duration)}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-yellow-500" />
                                    <span className="font-medium">{new Date(movie.release_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                </div>
                                {movie.languages && movie.languages.length > 0 && (
                                    <div className="flex items-center gap-2">
                                        <Languages className="w-5 h-5 text-yellow-500" />
                                        <span className="font-medium">{movie.languages.join(', ')}</span>
                                    </div>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-4 pt-2">
                                {movie.trailer_url && (
                                    <a
                                        href={movie.trailer_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 px-8 py-4 bg-white/10 hover:bg-white/20 text-white rounded-full font-bold text-lg border border-white/20 transition-all transform hover:scale-105"
                                    >
                                        <Play className="w-6 h-6 fill-current" />
                                        Watch Trailer
                                    </a>
                                )}
                                <button
                                    onClick={() => setIsModalOpen(true)}
                                    className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-full font-bold text-lg shadow-lg shadow-red-500/30 transition-all transform hover:scale-105"
                                >
                                    Book Tickets
                                </button>
                                <ShareButton />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">

                {/* Filtered Showtimes Section */}
                {selectedLanguage && selectedFormat && (
                    <section className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                            <span className="w-1.5 h-10 bg-gradient-to-b from-yellow-400 to-yellow-600 rounded-full"></span>
                            Available Showtimes
                        </h2>

                        {Object.keys(showtimesByTheater).length === 0 ? (
                            <div className="p-8 bg-white/5 rounded-2xl border border-white/10 text-center">
                                <p className="text-gray-400 text-lg">No showtimes available for {selectedLanguage} - {selectedFormat}</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {Object.entries(showtimesByTheater).map(([theaterName, theaterShowtimes]) => (
                                    <div key={theaterName} className="bg-white/5 rounded-2xl border border-white/10 p-6">
                                        <h3 className="text-xl font-bold text-white mb-4">{theaterName}</h3>
                                        <div className="flex flex-wrap gap-4">
                                            {theaterShowtimes.map((showtime) => (
                                                <Link
                                                    key={showtime.id}
                                                    href={`/booking/seat-selection/${showtime.id}`}
                                                    className="px-6 py-3 bg-white/10 hover:bg-yellow-500 hover:text-black rounded-xl transition-all font-medium border border-white/10 hover:border-yellow-500"
                                                >
                                                    {new Date(showtime.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                )}

                {/* Synopsis */}
                <section className="space-y-4">
                    <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                        <span className="w-1.5 h-10 bg-gradient-to-b from-yellow-400 to-yellow-600 rounded-full"></span>
                        Synopsis
                    </h2>
                    <p className="text-gray-300 leading-relaxed text-lg pl-6 max-w-4xl">
                        {movie.description}
                    </p>
                </section>

                {/* Cast */}
                {movie.cast && movie.cast.length > 0 && (
                    <section className="space-y-6">
                        <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                            <span className="w-1.5 h-10 bg-gradient-to-b from-yellow-400 to-yellow-600 rounded-full"></span>
                            Top Cast
                        </h2>
                        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-6 pl-6">
                            {movie.cast.map((member: any, index: number) => (
                                <div key={index} className="text-center group cursor-pointer">
                                    <div className="w-28 h-28 mx-auto mb-4 rounded-full overflow-hidden border-3 border-white/20 group-hover:border-yellow-500/60 transition-all shadow-lg group-hover:shadow-yellow-500/30">
                                        <img
                                            src={member.image || `https://ui-avatars.com/api/?name=${member.name}&background=random`}
                                            alt={member.name}
                                            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                                        />
                                    </div>
                                    <h3 className="font-semibold text-white group-hover:text-yellow-400 transition-colors text-base">{member.name}</h3>
                                    <p className="text-sm text-gray-400 mt-1">{member.role}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </div>

            <LanguageFormatModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                languages={availableLanguages.length > 0 ? availableLanguages : ['English', 'Hindi', 'Tamil']}
                formats={formats.length > 0 ? formats : ['2D']}
                selectedLanguage={selectedLanguage}
                selectedFormat={selectedFormat}
                onApply={handleApply}
            />
        </div>
    );
}
