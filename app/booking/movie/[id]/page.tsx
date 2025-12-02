'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, MapPin, Filter, Calendar as CalendarIcon } from 'lucide-react';
import DateSelector from '@/components/DateSelector';
import LanguageFormatModal from '@/components/LanguageFormatModal';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface Movie {
    id: string;
    title: string;
    poster_url: string;
    duration: number;
    genre: string;
    languages: string[];
}

interface Theater {
    id: string;
    name: string;
    location: string;
}

interface Screen {
    id: string;
    name: string;
    theater: Theater;
}

interface Showtime {
    id: string;
    movie_id: string;
    start_time: string;
    price: number;
    format: string;
    screen: Screen;
}

export default function MovieBookingPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const [movieId, setMovieId] = useState<string>('');
    const [movie, setMovie] = useState<Movie | null>(null);
    const [allShowtimes, setAllShowtimes] = useState<Showtime[]>([]);
    const [filteredShowtimes, setFilteredShowtimes] = useState<Showtime[]>([]);

    // Filters
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [selectedLanguage, setSelectedLanguage] = useState<string>('');
    const [selectedFormat, setSelectedFormat] = useState<string>('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Get available formats from showtimes
    const availableFormats = Array.from(new Set(allShowtimes.map(s => s.format)));

    useEffect(() => {
        params.then(p => setMovieId(p.id));
    }, [params]);

    useEffect(() => {
        if (!movieId) return;

        async function fetchData() {
            try {
                // Fetch movie details
                const movieRes = await fetch(`${API_URL}/movies/${movieId}`);
                const movieData = await movieRes.json();
                setMovie(movieData);

                // Set default language
                if (movieData.languages && movieData.languages.length > 0) {
                    setSelectedLanguage(movieData.languages[0]);
                }

                // Fetch all showtimes for this movie
                const showtimesRes = await fetch(`${API_URL}/showtimes`);
                const allShowtimesData = await showtimesRes.json();

                // Filter showtimes for this movie
                const movieShowtimes = allShowtimesData.filter((s: any) => s.movie_id === movieId);
                setAllShowtimes(movieShowtimes);

                // Set default format
                if (movieShowtimes.length > 0) {
                    const formats = Array.from(new Set(movieShowtimes.map((s: Showtime) => s.format))) as string[];
                    setSelectedFormat(formats.length > 0 ? formats[0] : '2D');
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        }

        fetchData();
    }, [movieId]);

    // Auto-open modal on first load to select language and format
    useEffect(() => {
        if (movie && allShowtimes.length > 0 && !selectedFormat) {
            setIsModalOpen(true);
        }
    }, [movie, allShowtimes, selectedFormat]);

    // Filter showtimes based on selected date, language, and format
    useEffect(() => {
        let filtered = allShowtimes;

        // Filter by date
        filtered = filtered.filter(showtime => {
            const showtimeDate = new Date(showtime.start_time).toISOString().split('T')[0];
            return showtimeDate === selectedDate;
        });

        // Filter by format (treat null/empty as '2D' for backward compatibility)
        if (selectedFormat) {
            filtered = filtered.filter(showtime => {
                const showtimeFormat = showtime.format || '2D';
                return showtimeFormat === selectedFormat;
            });
        }

        setFilteredShowtimes(filtered);
    }, [allShowtimes, selectedDate, selectedLanguage, selectedFormat]);

    // Group showtimes by theater
    const theaterGroups = filteredShowtimes.reduce((acc: any, showtime) => {
        const theaterName = showtime.screen?.theater?.name || 'Unknown Theater';
        if (!acc[theaterName]) {
            acc[theaterName] = {
                name: theaterName,
                location: showtime.screen?.theater?.location || '',
                showtimes: []
            };
        }
        acc[theaterName].showtimes.push(showtime);
        return acc;
    }, {});

    if (!movie) {
        return (
            <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
                <div className="text-white text-xl">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0F172A] text-white pb-20">
            {/* Header */}
            <div className="bg-[#1a1a2e] border-b border-white/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center gap-4 mb-4">
                        <Link
                            href={`/movie/${movieId}`}
                            className="p-2 hover:bg-white/10 rounded-full transition-colors"
                        >
                            <ArrowLeft className="w-6 h-6" />
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold">{movie.title}</h1>
                            <p className="text-gray-400 mt-1">{movie.genre} • {movie.duration} mins</p>
                        </div>
                    </div>

                    {/* Language & Format Filter Button */}
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/15 rounded-lg border border-white/20 transition-all"
                    >
                        <Filter className="w-4 h-4" />
                        <span className="font-medium">{selectedLanguage} • {selectedFormat}</span>
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                {/* Date Selector */}
                <DateSelector
                    selectedDate={selectedDate}
                    onDateChange={setSelectedDate}
                />

                {/* Theater Listings */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold flex items-center gap-3">
                            <span className="w-1.5 h-8 bg-gradient-to-b from-yellow-400 to-yellow-600 rounded-full"></span>
                            Available Theaters
                        </h2>
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                            <CalendarIcon className="w-4 h-4" />
                            <span>{new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
                        </div>
                    </div>

                    {Object.keys(theaterGroups).length === 0 ? (
                        <div className="p-12 rounded-2xl bg-white/5 backdrop-blur-sm text-center border border-white/10">
                            <CalendarIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                            <p className="text-gray-400 text-lg">No showtimes available for this date.</p>
                            <p className="text-gray-500 text-sm mt-2">Try selecting a different date or format.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {Object.values(theaterGroups).map((theater: any) => (
                                <div key={theater.name} className="rounded-2xl overflow-hidden bg-white/5 backdrop-blur-sm border border-white/10 hover:border-yellow-500/30 transition-all">
                                    {/* Theater Header */}
                                    <div className="px-6 py-4 border-b border-white/10 bg-gradient-to-r from-white/5 to-transparent">
                                        <h3 className="text-xl font-bold text-white mb-1">{theater.name}</h3>
                                        {theater.location && (
                                            <div className="flex items-center gap-2 text-sm text-gray-400">
                                                <MapPin className="w-4 h-4 text-yellow-500" />
                                                <span>{theater.location}</span>
                                            </div>
                                        )}
                                        <div className="mt-2 text-xs text-green-400 font-medium">
                                            ✓ Cancellation available
                                        </div>
                                    </div>

                                    {/* Showtimes */}
                                    <div className="p-6">
                                        <div className="flex flex-wrap gap-3">
                                            {theater.showtimes.map((showtime: Showtime) => (
                                                <Link
                                                    key={showtime.id}
                                                    href={`/booking/${showtime.id}`}
                                                    className="group"
                                                >
                                                    <div className="px-6 py-3 border-2 border-green-500/30 rounded-lg hover:border-green-500 hover:bg-green-500/10 transition-all text-center group-hover:shadow-lg group-hover:shadow-green-500/20 transform group-hover:scale-105 min-w-[120px]">
                                                        <div className="text-lg font-bold text-green-400 group-hover:text-green-300 transition-colors">
                                                            {new Date(showtime.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </div>
                                                        <div className="text-xs text-gray-400 mt-1">
                                                            {showtime.screen?.name}
                                                        </div>
                                                        <div className="text-sm font-semibold text-white mt-1">
                                                            ₹{(showtime.price / 100).toFixed(2)}
                                                        </div>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Language/Format Modal */}
            <LanguageFormatModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                languages={movie.languages || ['English']}
                formats={availableFormats.length > 0 ? availableFormats : ['2D']}
                selectedLanguage={selectedLanguage}
                selectedFormat={selectedFormat}
                onApply={(language, format) => {
                    setSelectedLanguage(language);
                    setSelectedFormat(format);
                }}
            />
        </div>
    );
}
