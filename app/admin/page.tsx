import Link from 'next/link';
import { Film, Calendar, Users } from 'lucide-react';

export default function AdminDashboard() {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Link href="/admin/movies" className="block">
                    <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold text-gray-800">Movies</h2>
                            <div className="p-3 bg-blue-100 rounded-full text-blue-600">
                                <Film className="w-6 h-6" />
                            </div>
                        </div>
                        <p className="text-gray-500">Manage movie details, posters, and genres.</p>
                    </div>
                </Link>

                <Link href="/admin/showtimes" className="block">
                    <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold text-gray-800">Showtimes</h2>
                            <div className="p-3 bg-green-100 rounded-full text-green-600">
                                <Calendar className="w-6 h-6" />
                            </div>
                        </div>
                        <p className="text-gray-500">Schedule movies and manage ticket prices.</p>
                    </div>
                </Link>

                {/* Placeholder for future features */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 opacity-60">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold text-gray-800">Bookings</h2>
                        <div className="p-3 bg-purple-100 rounded-full text-purple-600">
                            <Users className="w-6 h-6" />
                        </div>
                    </div>
                    <p className="text-gray-500">View customer bookings (Coming Soon).</p>
                </div>
            </div>
        </div>
    );
}
