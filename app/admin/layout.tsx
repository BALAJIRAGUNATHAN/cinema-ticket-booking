import Link from 'next/link';
import { Film, Calendar, Home } from 'lucide-react';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-white shadow-md flex flex-col">
                <div className="p-6 border-b">
                    <h1 className="text-2xl font-bold text-gray-800">Admin Panel</h1>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    <Link
                        href="/admin"
                        className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <Home className="w-5 h-5" />
                        Dashboard
                    </Link>
                    <Link
                        href="/admin/movies"
                        className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <Film className="w-5 h-5" />
                        Movies
                    </Link>
                    <Link
                        href="/admin/showtimes"
                        className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <Calendar className="w-5 h-5" />
                        Showtimes
                    </Link>
                </nav>
                <div className="p-4 border-t">
                    <Link
                        href="/"
                        className="flex items-center gap-3 px-4 py-3 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                        Back to Site
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-y-auto">
                {children}
            </main>
        </div>
    );
}
