import Link from 'next/link';
import { Film, Calendar, Home, ArrowLeft, Sparkles } from 'lucide-react';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex">
            {/* Sidebar */}
            <aside className="w-72 bg-white/5 backdrop-blur-xl border-r border-white/10 shadow-2xl flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-white/10">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
                            <Sparkles className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                                Admin Panel
                            </h1>
                            <p className="text-xs text-purple-300/60">Manage your cinema</p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-2">
                    <Link
                        href="/admin"
                        className="group flex items-center gap-3 px-4 py-3.5 text-purple-100 hover:bg-white/10 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/20"
                    >
                        <div className="p-2 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg group-hover:from-blue-500/30 group-hover:to-purple-500/30 transition-all">
                            <Home className="w-5 h-5 text-blue-400" />
                        </div>
                        <span className="font-medium">Dashboard</span>
                    </Link>
                    <Link
                        href="/admin/movies"
                        className="group flex items-center gap-3 px-4 py-3.5 text-purple-100 hover:bg-white/10 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/20"
                    >
                        <div className="p-2 bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-lg group-hover:from-pink-500/30 group-hover:to-purple-500/30 transition-all">
                            <Film className="w-5 h-5 text-pink-400" />
                        </div>
                        <span className="font-medium">Movies</span>
                    </Link>
                    <Link
                        href="/admin/showtimes"
                        className="group flex items-center gap-3 px-4 py-3.5 text-purple-100 hover:bg-white/10 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/20"
                    >
                        <div className="p-2 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-lg group-hover:from-green-500/30 group-hover:to-emerald-500/30 transition-all">
                            <Calendar className="w-5 h-5 text-green-400" />
                        </div>
                        <span className="font-medium">Showtimes</span>
                    </Link>
                    <Link
                        href="/admin/ads"
                        className="group flex items-center gap-3 px-4 py-3.5 text-purple-100 hover:bg-white/10 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/20"
                    >
                        <div className="p-2 bg-gradient-to-br from-orange-500/20 to-pink-500/20 rounded-lg group-hover:from-orange-500/30 group-hover:to-pink-500/30 transition-all">
                            <svg className="w-5 h-5 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                            </svg>
                        </div>
                        <span className="font-medium">Advertisements</span>
                    </Link>
                    <Link
                        href="/admin/offers"
                        className="group flex items-center gap-3 px-4 py-3.5 text-purple-100 hover:bg-white/10 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/20"
                    >
                        <div className="p-2 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-lg group-hover:from-green-500/30 group-hover:to-emerald-500/30 transition-all">
                            <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                        </div>
                        <span className="font-medium">Offers</span>
                    </Link>
                </nav>

                {/* Footer */}
                <div className="p-4 border-t border-white/10">
                    <Link
                        href="/"
                        className="group flex items-center gap-3 px-4 py-3.5 text-purple-300 hover:text-white hover:bg-gradient-to-r hover:from-purple-500/20 hover:to-pink-500/20 rounded-xl transition-all duration-300"
                    >
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        <span className="font-medium">Back to Site</span>
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-y-auto">
                <div className="max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
