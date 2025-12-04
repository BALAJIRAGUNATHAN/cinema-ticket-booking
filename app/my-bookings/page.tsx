'use client'

import ProtectedRoute from '@/components/ProtectedRoute'
import { useAuth } from '@/contexts/AuthContext'
import { useState, useEffect } from 'react'
import { Ticket, Calendar, MapPin, Clock, Loader2, Film } from 'lucide-react'
import Link from 'next/link'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export default function MyBookingsPage() {
    return (
        <ProtectedRoute>
            <MyBookingsContent />
        </ProtectedRoute>
    )
}

function MyBookingsContent() {
    const { user } = useAuth()
    const [bookings, setBookings] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchBookings()
    }, [])

    const fetchBookings = async () => {
        try {
            const session = await user?.getSession()
            const token = session?.access_token

            const res = await fetch(`${API_URL}/users/bookings`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            if (res.ok) {
                const data = await res.json()
                setBookings(data)
            }
        } catch (err) {
            console.error('Error fetching bookings:', err)
        } finally {
            setLoading(false)
        }
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
    }

    const formatTime = (dateString: string) => {
        return new Date(dateString).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-[#020617] flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-yellow-500 animate-spin" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#020617] text-white">
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-900/20 rounded-full blur-[128px]"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-yellow-600/10 rounded-full blur-[128px]"></div>
            </div>

            {/* Header */}
            <header className="relative border-b border-white/5 bg-[#020617]/80 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold">My Bookings</h1>
                            <p className="text-gray-400 mt-1">View your booking history</p>
                        </div>
                        <Link
                            href="/"
                            className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all"
                        >
                            Back to Home
                        </Link>
                    </div>
                </div>
            </header>

            {/* Content */}
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {bookings.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Ticket className="w-10 h-10 text-gray-500" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">No Bookings Yet</h3>
                        <p className="text-gray-400 mb-8">Start booking your favorite movies!</p>
                        <Link
                            href="/"
                            className="inline-block px-8 py-3 bg-gradient-to-r from-yellow-400 to-yellow-600 text-[#020617] font-bold rounded-xl hover:shadow-[0_0_30px_rgba(234,179,8,0.3)] transition-all"
                        >
                            Browse Movies
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {bookings.map((booking) => (
                            <div
                                key={booking.id}
                                className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-yellow-500/30 transition-all"
                            >
                                <div className="flex flex-col md:flex-row gap-6">
                                    {/* Movie Info */}
                                    <div className="flex-1">
                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl flex items-center justify-center flex-shrink-0">
                                                <Film className="w-6 h-6 text-[#020617]" />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="text-xl font-bold text-white mb-2">{booking.movie_title}</h3>
                                                <div className="space-y-2 text-sm text-gray-400">
                                                    <div className="flex items-center gap-2">
                                                        <MapPin className="w-4 h-4" />
                                                        {booking.theater_name} - {booking.screen_name}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="w-4 h-4" />
                                                        {formatDate(booking.start_time)}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Clock className="w-4 h-4" />
                                                        {formatTime(booking.start_time)}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Booking Details */}
                                    <div className="md:w-64 space-y-3">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-400">Seats:</span>
                                            <span className="text-white font-medium">
                                                {booking.seats.map((s: any) => s.seat_number).join(', ')}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-400">Total:</span>
                                            <span className="text-yellow-500 font-bold">
                                                ₹{(booking.total_amount / 100).toFixed(2)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-400">Status:</span>
                                            <span className={`font-medium ${booking.payment_status === 'completed'
                                                    ? 'text-green-400'
                                                    : 'text-yellow-400'
                                                }`}>
                                                {booking.payment_status}
                                            </span>
                                        </div>
                                        <div className="pt-2">
                                            <span className="text-xs text-gray-500">
                                                Booked on {formatDate(booking.created_at)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
