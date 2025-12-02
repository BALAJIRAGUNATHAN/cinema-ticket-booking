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
