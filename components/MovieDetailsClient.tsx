'use client';

import Link from 'next/link';
import { Clock, Calendar, Star, Play, ArrowLeft, Languages, Ticket, MapPin } from 'lucide-react';
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
        <div className="min-h-screen bg-[#020617] text-white selection:bg-yellow-500/30">
            {/* Back Button */}
            <div className="absolute top-6 left-6 z-50">
                <Link
                    href="/"
                    className="flex items-center gap-2 px-4 py-2 bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-full text-white transition-all border border-white/10 hover:border-yellow-500/50 group"
                >
                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    <span className="font-medium">Back</span>
                </Link>
            </div>

            {/* Hero Section with Backdrop */}
            <div className="relative h-[85vh] w-full overflow-hidden">
                {/* Backdrop Image */}
                <div
                    className="absolute inset-0 bg-cover bg-center scale-110 blur-sm opacity-50"
                    style={{ backgroundImage: `url(${movie.poster_url})` }}
                />
                {/* Gradient Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/80 to-[#020617]/30" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#020617] via-[#020617]/50 to-transparent" />

                {/* Content */}
                <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-end pb-16">
                    <div className="flex flex-col md:flex-row gap-12 items-end w-full">
                        {/* Poster Card */}
                        <div className="relative group perspective-[1000px] hidden md:block">
                            <div className="w-80 rounded-2xl overflow-hidden shadow-2xl shadow-black/50 border border-white/10 transform-style-3d group-hover:rotate-y-6 transition-all duration-700">
                                <img
                                    src={movie.poster_url}
                                    alt={movie.title}
                                    className="w-full h-auto object-cover aspect-[2/3]"
                                />
                                {/* Shine Effect */}
                                <div className="absolute inset-0 bg-gradient-to-tr from-white/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                            </div>
                        </div>

                        {/* Movie Info */}
                        <div className="flex-1 space-y-8 pb-4">
                            {/* Genre & Rating */}
                            <div className="flex items-center gap-4 flex-wrap">
                                <span className="px-4 py-1.5 bg-yellow-500/10 text-yellow-400 text-sm font-bold uppercase tracking-wider rounded-lg border border-yellow-500/20 backdrop-blur-sm shadow-[0_0_15px_rgba(234,179,8,0.1)]">
                                    {movie.genre}
                                </span>
                                <div className="flex items-center gap-2 px-4 py-1.5 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
                                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                    <span className="font-bold text-white">4.8</span>
                                    <span className="text-gray-500 text-xs border-l border-white/10 pl-2 ml-1">2.4k Votes</span>
                                </div>
                            </div>

                            {/* Title */}
                            <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight leading-none drop-shadow-2xl">
                                {movie.title}
                            </h1>

                            {/* Meta Info */}
                            <div className="flex items-center gap-8 text-gray-300 text-base flex-wrap font-light">
                                <div className="flex items-center gap-2.5">
                                    <Clock className="w-5 h-5 text-yellow-500" />
                                    <span>{formatDuration(movie.duration)}</span>
                                </div>
                                <div className="flex items-center gap-2.5">
                                    <Calendar className="w-5 h-5 text-yellow-500" />
                                    <span>{new Date(movie.release_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                </div>
                                {movie.languages && movie.languages.length > 0 && (
                                    <div className="flex items-center gap-2.5">
                                        <Languages className="w-5 h-5 text-yellow-500" />
                                        <span>{movie.languages.join(', ')}</span>
                                    </div>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-5 pt-4">
                                <button
                                    onClick={() => setIsModalOpen(true)}
                                    className="flex items-center gap-3 px-10 py-4 bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-300 hover:to-yellow-500 text-[#020617] rounded-xl font-bold text-lg shadow-[0_0_30px_rgba(234,179,8,0.3)] transition-all transform hover:-translate-y-1 hover:shadow-[0_0_40px_rgba(234,179,8,0.5)]"
                                >
                                    <Ticket className="w-5 h-5" />
                                    Book Tickets
                                </button>
                                {movie.trailer_url && (
                                    <a
                                        href={movie.trailer_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 px-8 py-4 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold text-lg border border-white/10 hover:border-white/30 transition-all backdrop-blur-sm"
                                    >
                                        <Play className="w-5 h-5 fill-current" />
                                        Trailer
                                    </a>
                                )}
                                <div className="ml-2">
                                    <ShareButton />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-20">

                {/* Filtered Showtimes Section */}
                {selectedLanguage && selectedFormat && (
                    <section className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                        <div className="flex items-center gap-4">
                            <div className="w-1.5 h-10 bg-gradient-to-b from-yellow-400 to-yellow-600 rounded-full shadow-[0_0_15px_rgba(234,179,8,0.5)]"></div>
                            <h2 className="text-3xl font-bold text-white">Available Showtimes</h2>
                        </div>

                        {Object.keys(showtimesByTheater).length === 0 ? (
                            <div className="p-10 bg-white/5 rounded-2xl border border-white/10 text-center backdrop-blur-sm">
                                <p className="text-gray-400 text-lg">No showtimes available for {selectedLanguage} - {selectedFormat}</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {Object.entries(showtimesByTheater).map(([theaterName, theaterShowtimes]) => (
                                    <div key={theaterName} className="bg-[#0F172A]/50 rounded-2xl border border-white/5 p-8 hover:border-white/10 transition-colors">
                                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                            <MapPin className="w-5 h-5 text-gray-500" />
                                            {theaterName}
                                        </h3>
                                        <div className="flex flex-wrap gap-4">
                                            {theaterShowtimes.map((showtime) => (
                                                <Link
                                                    key={showtime.id}
                                                    href={`/booking/seat-selection/${showtime.id}`}
                                                    className="group relative px-6 py-3 bg-[#020617] hover:bg-yellow-500 rounded-xl transition-all border border-white/10 hover:border-yellow-500 overflow-hidden"
                                                >
                                                    <span className="relative z-10 font-mono font-medium text-yellow-500 group-hover:text-[#020617] transition-colors">
                                                        {new Date(showtime.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
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
                <section className="space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="w-1.5 h-10 bg-gradient-to-b from-yellow-400 to-yellow-600 rounded-full shadow-[0_0_15px_rgba(234,179,8,0.5)]"></div>
                        <h2 className="text-3xl font-bold text-white">Synopsis</h2>
                    </div>
                    <p className="text-gray-300 leading-relaxed text-lg pl-6 max-w-4xl font-light">
                        {movie.description}
                    </p>
                </section>

                {/* Cast */}
                {movie.cast && movie.cast.length > 0 && (
                    <section className="space-y-8">
                        <div className="flex items-center gap-4">
                            <div className="w-1.5 h-10 bg-gradient-to-b from-yellow-400 to-yellow-600 rounded-full shadow-[0_0_15px_rgba(234,179,8,0.5)]"></div>
                            <h2 className="text-3xl font-bold text-white">Top Cast</h2>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-8 pl-6">
                            {movie.cast.map((member: any, index: number) => (
                                <div key={index} className="text-center group cursor-pointer">
                                    <div className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden border-2 border-white/10 group-hover:border-yellow-500 transition-all shadow-lg group-hover:shadow-[0_0_20px_rgba(234,179,8,0.3)] relative">
                                        <img
                                            src={member.image || `https://ui-avatars.com/api/?name=${member.name}&background=random`}
                                            alt={member.name}
                                            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500 filter grayscale group-hover:grayscale-0"
                                        />
                                    </div>
                                    <h3 className="font-bold text-white group-hover:text-yellow-500 transition-colors text-base">{member.name}</h3>
                                    <p className="text-sm text-gray-500 mt-1 font-light">{member.role}</p>
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
