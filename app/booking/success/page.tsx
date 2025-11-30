'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, X, Calendar, MapPin, Clock, User, Mail, Phone, Ticket } from 'lucide-react';

function BookingSuccessContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [bookingDetails, setBookingDetails] = useState<any>(null);

    useEffect(() => {
        // Get booking details from sessionStorage (we'll set this before redirect)
        const details = sessionStorage.getItem('lastBooking');
        if (details) {
            setBookingDetails(JSON.parse(details));
            sessionStorage.removeItem('lastBooking'); // Clear after reading
        }
    }, []);

    const handleClose = () => {
        router.push('/');
    };

    if (!bookingDetails) {
        return (
            <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
                <div className="text-center">
                    <p className="text-white text-lg mb-4">Loading booking details...</p>
                    <button
                        onClick={handleClose}
                        className="px-6 py-2 gradient-gold text-[#0F172A] font-bold rounded-lg"
                    >
                        Go to Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Glows */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[100px] pointer-events-none"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="max-w-2xl w-full relative z-10">
                {/* Success Animation */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-24 h-24 bg-green-500 rounded-full mb-4 animate-bounce shadow-[0_0_20px_rgba(34,197,94,0.5)]">
                        <CheckCircle className="w-16 h-16 text-[#0F172A]" />
                    </div>
                    <h1 className="text-4xl font-bold text-white mb-2">Booking Confirmed!</h1>
                    <p className="text-gray-400 text-lg">Your tickets have been booked successfully</p>
                </div>

                {/* Ticket Card */}
                <div className="glass-card rounded-2xl overflow-hidden mb-8 border border-white/10">
                    {/* Header */}
                    <div className="gradient-gold p-6 text-[#0F172A]">
                        <div className="flex justify-between items-start">
                            <div>
                                <h2 className="text-2xl font-bold mb-1">{bookingDetails.movieTitle}</h2>
                                <p className="font-medium opacity-80">Booking ID: {bookingDetails.bookingId}</p>
                            </div>
                            <Ticket className="w-8 h-8 opacity-80" />
                        </div>
                    </div>

                    {/* Details */}
                    <div className="p-8 space-y-8">
                        {/* Theater & Screen */}
                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                                    <MapPin className="w-6 h-6 text-yellow-500" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-400 mb-1">Theater</p>
                                    <p className="font-bold text-white text-lg">{bookingDetails.theaterName}</p>
                                    <p className="text-sm text-gray-400">{bookingDetails.screenName}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                                    <Calendar className="w-6 h-6 text-yellow-500" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-400 mb-1">Date & Time</p>
                                    <p className="font-bold text-white text-lg">{bookingDetails.showtime}</p>
                                </div>
                            </div>
                        </div>

                        {/* Seats */}
                        <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                            <p className="text-sm text-gray-400 mb-3 uppercase tracking-wider font-medium">Your Seats</p>
                            <div className="flex flex-wrap gap-2">
                                {bookingDetails.seats.map((seat: string) => (
                                    <span
                                        key={seat}
                                        className="px-4 py-2 bg-green-500/20 text-green-400 border border-green-500/30 font-bold rounded-lg"
                                    >
                                        {seat}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Customer Details */}
                        <div className="border-t border-white/10 pt-6 space-y-4">
                            <div className="flex items-center gap-3">
                                <User className="w-5 h-5 text-gray-500" />
                                <span className="text-gray-300">{bookingDetails.customerName}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Mail className="w-5 h-5 text-gray-500" />
                                <span className="text-gray-300">{bookingDetails.customerEmail}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Phone className="w-5 h-5 text-gray-500" />
                                <span className="text-gray-300">{bookingDetails.customerPhone}</span>
                            </div>
                        </div>

                        {/* Total Amount */}
                        <div className="bg-gradient-to-r from-white/5 to-transparent p-6 rounded-xl border border-white/10">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400 font-medium">Total Amount Paid</span>
                                <span className="text-3xl font-bold text-green-400">
                                    ₹{(bookingDetails.totalAmount / 100).toFixed(2)}
                                </span>
                            </div>
                        </div>

                        {/* Email Notice */}
                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex gap-3">
                            <div className="mt-1">
                                <Mail className="w-5 h-5 text-blue-400" />
                            </div>
                            <div>
                                <p className="text-sm text-blue-200">
                                    A confirmation email has been sent to <strong className="text-white">{bookingDetails.customerEmail}</strong>
                                </p>
                                <p className="text-xs text-blue-400 mt-1">
                                    Please show this email at the theater entrance
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Close Button */}
                <button
                    onClick={handleClose}
                    className="w-full py-4 gradient-gold text-[#0F172A] font-bold rounded-xl hover:shadow-lg hover:shadow-yellow-500/20 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                >
                    <X className="w-5 h-5" />
                    Close & Return to Movies
                </button>
            </div>
        </div>
    );
}

export default function BookingSuccessPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#0F172A] flex items-center justify-center text-white">Loading...</div>}>
            <BookingSuccessContent />
        </Suspense>
    );
}
