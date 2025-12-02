import Link from 'next/link';
import { Film, Calendar, Users, TrendingUp } from 'lucide-react';

export default function AdminDashboard() {
    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="space-y-2">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                    Dashboard
                </h1>
                <p className="text-purple-300/60">Welcome back! Here's what's happening with your cinema.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Movies Card */}
                <Link href="/admin/movies" className="group block">
                    <div className="relative overflow-hidden bg-gradient-to-br from-blue-500/10 to-purple-500/10 backdrop-blur-xl border border-white/10 p-6 rounded-2xl hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-500 hover:scale-105 hover:border-blue-500/30">
                        {/* Glow effect */}
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/20 group-hover:to-purple-500/20 transition-all duration-500"></div>

                        <div className="relative">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-2xl font-bold text-white">Movies</h2>
                                <div className="p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg shadow-blue-500/50 group-hover:shadow-blue-500/70 transition-all duration-300 group-hover:scale-110">
                                    <Film className="w-7 h-7 text-white" />
                                </div>
                            </div>
                            <p className="text-purple-200/80 mb-3">Manage movie details, posters, and genres</p>
                            <div className="flex items-center gap-2 text-blue-400 font-medium">
                                <span>View all movies</span>
                                <TrendingUp className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </div>
                    </div>
                </Link>

                {/* Showtimes Card */}
                <Link href="/admin/showtimes" className="group block">
                    <div className="relative overflow-hidden bg-gradient-to-br from-green-500/10 to-emerald-500/10 backdrop-blur-xl border border-white/10 p-6 rounded-2xl hover:shadow-2xl hover:shadow-green-500/20 transition-all duration-500 hover:scale-105 hover:border-green-500/30">
                        {/* Glow effect */}
                        <div className="absolute inset-0 bg-gradient-to-br from-green-500/0 to-emerald-500/0 group-hover:from-green-500/20 group-hover:to-emerald-500/20 transition-all duration-500"></div>

                        <div className="relative">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-2xl font-bold text-white">Showtimes</h2>
                                <div className="p-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg shadow-green-500/50 group-hover:shadow-green-500/70 transition-all duration-300 group-hover:scale-110">
                                    <Calendar className="w-7 h-7 text-white" />
                                </div>
                            </div>
                            <p className="text-purple-200/80 mb-3">Schedule movies and manage ticket prices</p>
                            <div className="flex items-center gap-2 text-green-400 font-medium">
                                <span>Manage schedule</span>
                                <TrendingUp className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </div>
                    </div>
                </Link>

                {/* Bookings Card - Coming Soon */}
                <div className="group relative overflow-hidden bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-xl border border-white/10 p-6 rounded-2xl opacity-75 cursor-not-allowed">
                    {/* Coming Soon Badge */}
                    <div className="absolute top-4 right-4 px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-xs font-bold text-white shadow-lg">
                        Coming Soon
                    </div>

                    <div className="relative">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-2xl font-bold text-white">Bookings</h2>
                            <div className="p-4 bg-gradient-to-br from-purple-500/50 to-pink-600/50 rounded-2xl">
                                <Users className="w-7 h-7 text-white" />
                            </div>
                        </div>
                        <p className="text-purple-200/80 mb-3">View and manage customer bookings</p>
                        <div className="flex items-center gap-2 text-purple-400 font-medium">
                            <span>Feature in development</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-white mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Link
                        href="/admin/movies/new"
                        className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 hover:from-blue-500/20 hover:to-purple-500/20 border border-white/10 rounded-xl transition-all duration-300 hover:scale-105"
                    >
                        <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                            <Film className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="font-semibold text-white">Add New Movie</p>
                            <p className="text-sm text-purple-300/60">Create a new movie listing</p>
                        </div>
                    </Link>
                    <Link
                        href="/admin/showtimes/new"
                        className="flex items-center gap-4 p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 hover:from-green-500/20 hover:to-emerald-500/20 border border-white/10 rounded-xl transition-all duration-300 hover:scale-105"
                    >
                        <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
                            <Calendar className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="font-semibold text-white">Add New Showtime</p>
                            <p className="text-sm text-purple-300/60">Schedule a new screening</p>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
}
