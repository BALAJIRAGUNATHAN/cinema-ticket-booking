'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Loader2, ArrowLeft, Check, Clock, AlertCircle, Armchair, Ticket } from 'lucide-react';

// Initialize Stripe with validation
const stripeKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = stripeKey ? loadStripe(stripeKey) : null;

function CheckoutForm({ amount, onSuccess }: { amount: number, onSuccess: (paymentIntentId: string) => void }) {
    const stripe = useStripe();
    const elements = useElements();
    const [error, setError] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        if (stripe && elements) {
            setIsReady(true);
        }
    }, [stripe, elements]);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!stripe || !elements) return;

        setProcessing(true);

        const { error: submitError } = await elements.submit();
        if (submitError) {
            setError(submitError.message || 'An error occurred');
            setProcessing(false);
            return;
        }

        const { error: paymentError, paymentIntent } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: `${window.location.origin}/booking/success`,
            },
            redirect: 'if_required',
        });

        if (paymentError) {
            setError(paymentError.message || 'Payment failed');
            setProcessing(false);
        } else if (paymentIntent && paymentIntent.status === 'succeeded') {
            onSuccess(paymentIntent.id);
        } else {
            setProcessing(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {!isReady && (
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-yellow-500" />
                    <span className="ml-3 text-gray-400">Loading payment form...</span>
                </div>
            )}
            <div className={!isReady ? 'opacity-0 h-0 overflow-hidden' : ''}>
                <PaymentElement />
            </div>
            {error && <div className="text-red-400 text-sm bg-red-900/20 border border-red-900/50 p-3 rounded-lg flex items-center gap-2"><AlertCircle className="w-4 h-4" /> {error}</div>}
            <button
                type="submit"
                disabled={!stripe || processing || !isReady}
                className="w-full py-4 px-6 gradient-gold text-[#0F172A] font-bold rounded-lg hover:shadow-lg hover:shadow-yellow-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
            >
                {processing ? (
                    <span className="flex items-center justify-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Processing Payment...
                    </span>
                ) : !isReady ? (
                    <span className="flex items-center justify-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Loading...
                    </span>
                ) : (
                    `Pay ₹${(amount / 100).toFixed(2)}`
                )}
            </button>
        </form>
    );
}

function CountdownTimer({ onExpire }: { onExpire: () => void }) {
    const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds

    useEffect(() => {
        if (timeLeft <= 0) {
            onExpire();
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, onExpire]);

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const percentage = (timeLeft / 300) * 100;

    return (
        <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white p-4 rounded-xl shadow-lg shadow-orange-900/20 border border-white/10">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 animate-pulse" />
                    <span className="font-semibold tracking-wide">Time Remaining</span>
                </div>
                <span className="text-2xl font-bold font-mono tabular-nums">
                    {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                </span>
            </div>
            <div className="w-full bg-black/20 rounded-full h-2 overflow-hidden backdrop-blur-sm">
                <div
                    className="bg-white h-full transition-all duration-1000 ease-linear shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                    style={{ width: `${percentage}%` }}
                ></div>
            </div>
            {timeLeft <= 60 && (
                <p className="text-sm mt-2 flex items-center gap-1 font-medium animate-bounce">
                    <AlertCircle className="w-4 h-4" />
                    Hurry! Your seats will be released soon.
                </p>
            )}
        </div>
    );
}

export default function BookingPage({ params }: { params: Promise<{ id: string }> }) {
    const [showtime, setShowtime] = useState<any>(null);
    const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
    const [unavailableSeats, setUnavailableSeats] = useState<string[]>([]);
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [step, setStep] = useState<'seats' | 'details' | 'payment'>('seats');
    const [customerDetails, setCustomerDetails] = useState({ name: '', email: '', phone: '' });
    const [loading, setLoading] = useState(true);
    const [userSession] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
    const router = useRouter();

    const [id, setId] = useState<string>('');
    useEffect(() => {
        params.then(p => setId(p.id));
    }, [params]);

    useEffect(() => {
        if (!id) return;
        async function fetchShowtime() {
            try {
                const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
                const res = await fetch(`${API_URL}/showtimes`);
                const data = await res.json();
                const found = data.find((s: any) => s.id === id);
                setShowtime(found);

                // Fetch unavailable seats
                const seatsRes = await fetch(`${API_URL}/seats/available/${id}`);
                const seatsData = await seatsRes.json();
                setUnavailableSeats(seatsData.unavailable_seats || []);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }
        fetchShowtime();
    }, [id]);

    const toggleSeat = (seatId: string) => {
        // Don't allow selecting unavailable seats
        if (unavailableSeats.includes(seatId)) {
            alert('This seat is already booked or locked by another user.');
            return;
        }

        if (selectedSeats.includes(seatId)) {
            setSelectedSeats(selectedSeats.filter(s => s !== seatId));
        } else {
            setSelectedSeats([...selectedSeats, seatId]);
        }
    };

    const handleContinueToDetails = async () => {
        if (selectedSeats.length === 0) return;

        setLoading(true);
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            const response = await fetch(`${API_URL}/seats/lock`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    showtime_id: id,
                    seats: selectedSeats,
                    user_session: userSession,
                    customer_email: customerDetails.email || 'temp@example.com'
                })
            });

            if (!response.ok) {
                const error = await response.json();
                alert(error.detail || 'Failed to lock seats. They may have been taken by another user.');
                // Refresh unavailable seats
                const seatsRes = await fetch(`${API_URL}/seats/available/${id}`);
                const seatsData = await seatsRes.json();
                setUnavailableSeats(seatsData.unavailable_seats || []);
                setSelectedSeats([]);
                return;
            }

            setStep('details');
        } catch (e) {
            console.error(e);
            alert('Failed to lock seats. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleDetailsSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            const res = await fetch(`${API_URL}/bookings/create-payment-intent`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    showtime_id: id,
                    customer_name: customerDetails.name,
                    customer_email: customerDetails.email,
                    customer_phone: customerDetails.phone,
                    seats: selectedSeats,
                    total_amount: showtime.price * selectedSeats.length,
                }),
            });

            const data = await res.json();
            setClientSecret(data.clientSecret);
            setStep('payment');
        } catch (e) {
            console.error(e);
            alert('Failed to initialize payment');
        } finally {
            setLoading(false);
        }
    };

    const handlePaymentSuccess = async (paymentIntentId: string) => {
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            const response = await fetch(`${API_URL}/bookings/confirm`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    showtime_id: id,
                    customer_name: customerDetails.name,
                    customer_email: customerDetails.email,
                    customer_phone: customerDetails.phone,
                    seats: selectedSeats,
                    total_amount: showtime.price * selectedSeats.length,
                })
            });

            const booking = await response.json();

            // Store booking details for success page
            const bookingDetails = {
                bookingId: booking.id,
                movieTitle: showtime.movie?.title,
                theaterName: showtime.screen?.theater?.name,
                screenName: showtime.screen?.name,
                showtime: new Date(showtime.start_time).toLocaleString(),
                seats: selectedSeats,
                customerName: customerDetails.name,
                customerEmail: customerDetails.email,
                customerPhone: customerDetails.phone,
                totalAmount: showtime.price * selectedSeats.length,
            };

            sessionStorage.setItem('lastBooking', JSON.stringify(bookingDetails));

            // Redirect to success page
            router.push('/booking/success');
        } catch (e) {
            console.error(e);
            alert('Booking confirmation failed. Please contact support with your payment details.');
        }
    };

    const handleTimerExpire = () => {
        alert('⏰ Time expired! Your seats have been released. Please try again.');
        router.push(`/movie/${showtime.movie_id}`);
    };

    if (loading || !showtime) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0F172A]">
                <Loader2 className="animate-spin text-yellow-500 w-12 h-12" />
            </div>
        );
    }

    const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    const cols = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

    return (
        <div className="min-h-screen bg-[#0F172A] text-white">
            {/* Header */}
            <div className="glass border-b border-white/10 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
                    <button onClick={() => router.back()} className="text-gray-400 hover:text-white transition-colors">
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-white">{showtime.movie?.title}</h1>
                        <p className="text-sm text-gray-400 flex items-center gap-2">
                            <Clock className="w-3 h-3 text-yellow-500" />
                            {new Date(showtime.start_time).toLocaleString()}
                            <span className="text-gray-600">|</span>
                            {showtime.screen?.theater?.name} - {showtime.screen?.name}
                        </p>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Progress Steps */}
                <div className="flex items-center justify-center gap-4 mb-12">
                    <div className={`flex items-center gap-2 ${step === 'seats' ? 'text-yellow-500' : 'text-gray-500'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold transition-all ${step === 'seats' ? 'bg-yellow-500 text-[#0F172A]' : 'bg-gray-800 border border-gray-700'}`}>
                            {step !== 'seats' ? <Check className="w-5 h-5" /> : '1'}
                        </div>
                        <span className="font-medium tracking-wide">Select Seats</span>
                    </div>
                    <div className="w-16 h-0.5 bg-gray-800">
                        <div className={`h-full bg-yellow-500 transition-all duration-500 ${step !== 'seats' ? 'w-full' : 'w-0'}`}></div>
                    </div>
                    <div className={`flex items-center gap-2 ${step === 'details' ? 'text-yellow-500' : 'text-gray-500'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold transition-all ${step === 'details' ? 'bg-yellow-500 text-[#0F172A]' : step === 'payment' ? 'bg-green-500 text-white' : 'bg-gray-800 border border-gray-700'}`}>
                            {step === 'payment' ? <Check className="w-5 h-5" /> : '2'}
                        </div>
                        <span className="font-medium tracking-wide">Details</span>
                    </div>
                    <div className="w-16 h-0.5 bg-gray-800">
                        <div className={`h-full bg-yellow-500 transition-all duration-500 ${step === 'payment' ? 'w-full' : 'w-0'}`}></div>
                    </div>
                    <div className={`flex items-center gap-2 ${step === 'payment' ? 'text-yellow-500' : 'text-gray-500'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold transition-all ${step === 'payment' ? 'bg-yellow-500 text-[#0F172A]' : 'bg-gray-800 border border-gray-700'}`}>
                            3
                        </div>
                        <span className="font-medium tracking-wide">Payment</span>
                    </div>
                </div>

                {step === 'seats' && (
                    <div className="grid lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2">
                            <div className="glass-card rounded-2xl p-8 relative overflow-hidden">
                                {/* Screen Glow Effect */}
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-blue-500/20 blur-[100px] rounded-full pointer-events-none"></div>

                                <div className="mb-16 relative">
                                    <div className="w-3/4 mx-auto h-2 bg-gradient-to-r from-transparent via-blue-400/50 to-transparent rounded-full mb-4 shadow-[0_0_20px_rgba(59,130,246,0.5)]"></div>
                                    <p className="text-center text-xs text-blue-300 uppercase tracking-[0.3em] font-medium">Screen</p>
                                </div>

                                <div className="flex flex-col gap-4 items-center perspective-[1000px]">
                                    {rows.map(row => (
                                        <div key={row} className="flex gap-3 items-center transform-style-3d hover:translate-z-4 transition-transform">
                                            <span className="w-6 text-center text-gray-500 text-sm font-bold">{row}</span>
                                            {cols.map(col => {
                                                const seatId = `${row}${col}`;
                                                const isSelected = selectedSeats.includes(seatId);
                                                const isUnavailable = unavailableSeats.includes(seatId);
                                                return (
                                                    <button
                                                        key={seatId}
                                                        onClick={() => toggleSeat(seatId)}
                                                        disabled={isUnavailable}
                                                        className={`
                                                            group relative w-8 h-8 rounded-t-lg text-[10px] font-medium transition-all duration-300
                                                            ${isUnavailable
                                                                ? 'bg-gray-700 text-gray-500 cursor-not-allowed opacity-40'
                                                                : isSelected
                                                                    ? 'bg-yellow-500 text-[#0F172A] scale-110 shadow-[0_0_15px_rgba(212,175,55,0.6)] z-10'
                                                                    : 'bg-white/10 text-gray-400 hover:bg-white/30 hover:scale-105'
                                                            }
                                                        `}
                                                    >
                                                        <span className="absolute inset-0 flex items-center justify-center">{col}</span>
                                                        {/* 3D Effect Bottom Border */}
                                                        <div className={`absolute -bottom-1 left-0 w-full h-1 rounded-b-sm opacity-50 ${isSelected ? 'bg-yellow-700' : 'bg-black'}`}></div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    ))}
                                </div>

                                <div className="flex items-center justify-center gap-8 mt-12 text-sm border-t border-white/5 pt-8">
                                    <div className="flex items-center gap-3">
                                        <div className="w-6 h-6 bg-white/10 rounded-md border border-white/5"></div>
                                        <span className="text-gray-400">Available</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-6 h-6 bg-yellow-500 rounded-md shadow-[0_0_10px_rgba(212,175,55,0.4)]"></div>
                                        <span className="text-gray-400">Selected</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-6 h-6 bg-gray-700 rounded-md opacity-50"></div>
                                        <span className="text-gray-400">Sold</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-1">
                            <div className="glass-card rounded-2xl p-6 sticky top-24 border-t border-white/10">
                                <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                                    <Ticket className="w-5 h-5 text-yellow-500" />
                                    Booking Summary
                                </h3>
                                <div className="space-y-4 text-sm">
                                    <div className="flex justify-between items-center py-2 border-b border-white/5">
                                        <span className="text-gray-400">Theater</span>
                                        <span className="font-medium text-right">{showtime.screen?.theater?.name}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-white/5">
                                        <span className="text-gray-400">Screen</span>
                                        <span className="font-medium text-right">{showtime.screen?.name}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-white/5">
                                        <span className="text-gray-400">Date</span>
                                        <span className="font-medium text-right">{new Date(showtime.start_time).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-white/5">
                                        <span className="text-gray-400">Time</span>
                                        <span className="font-medium text-right">{new Date(showtime.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>

                                    <div className="bg-white/5 rounded-lg p-4 mt-4">
                                        <div className="flex justify-between mb-2">
                                            <span className="text-gray-400">Seats ({selectedSeats.length})</span>
                                            <span className="font-medium text-yellow-500">{selectedSeats.length > 0 ? selectedSeats.join(', ') : '-'}</span>
                                        </div>
                                        <div className="flex justify-between text-xs text-gray-500 mb-4">
                                            <span>Price per seat</span>
                                            <span>₹{(showtime.price / 100).toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between font-bold text-lg pt-3 border-t border-white/10">
                                            <span>Total</span>
                                            <span className="text-green-400">₹{((showtime.price * selectedSeats.length) / 100).toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    disabled={selectedSeats.length === 0 || loading}
                                    onClick={handleContinueToDetails}
                                    className="w-full mt-6 py-4 gradient-gold text-[#0F172A] font-bold rounded-xl hover:shadow-lg hover:shadow-yellow-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:-translate-y-0.5"
                                >
                                    {loading ? 'Locking Seats...' : 'Continue to Details'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {step === 'details' && (
                    <div className="max-w-5xl mx-auto">
                        <div className="grid md:grid-cols-3 gap-8">
                            {/* Movie Poster */}
                            <div className="md:col-span-1 hidden md:block">
                                <div className="glass-card rounded-2xl overflow-hidden sticky top-24 shadow-2xl shadow-black/50">
                                    {showtime.movie?.poster_url ? (
                                        <img
                                            src={showtime.movie.poster_url}
                                            alt={showtime.movie.title}
                                            className="w-full h-auto"
                                        />
                                    ) : (
                                        <div className="w-full h-96 flex items-center justify-center text-gray-500">
                                            No Poster
                                        </div>
                                    )}
                                    <div className="p-4 bg-[#0F172A]">
                                        <h3 className="font-bold text-lg text-center">{showtime.movie?.title}</h3>
                                    </div>
                                </div>
                            </div>

                            {/* Form */}
                            <div className="md:col-span-2 space-y-6">
                                {/* Countdown Timer */}
                                <CountdownTimer onExpire={handleTimerExpire} />

                                <div className="glass-card rounded-2xl p-8 border-t border-white/10">
                                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                                        <div className="w-1 h-6 bg-yellow-500 rounded-full"></div>
                                        Enter Your Details
                                    </h2>
                                    <form onSubmit={handleDetailsSubmit} className="space-y-6">
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                                                <input
                                                    required
                                                    type="text"
                                                    placeholder="John Doe"
                                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none transition-all text-white placeholder-gray-600"
                                                    value={customerDetails.name}
                                                    onChange={e => setCustomerDetails({ ...customerDetails, name: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                                                <input
                                                    required
                                                    type="email"
                                                    placeholder="john@example.com"
                                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none transition-all text-white placeholder-gray-600"
                                                    value={customerDetails.email}
                                                    onChange={e => setCustomerDetails({ ...customerDetails, email: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-300 mb-2">Phone Number</label>
                                                <input
                                                    required
                                                    type="tel"
                                                    placeholder="+91 98765 43210"
                                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none transition-all text-white placeholder-gray-600"
                                                    value={customerDetails.phone}
                                                    onChange={e => setCustomerDetails({ ...customerDetails, phone: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        {/* Ticket Summary */}
                                        <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-xl p-6 border border-white/5 mt-8">
                                            <h3 className="font-semibold text-blue-400 mb-4 text-sm uppercase tracking-wider">Booking Summary</h3>
                                            <div className="space-y-3">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-400">Movie</span>
                                                    <span className="font-medium">{showtime.movie?.title}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-400">Theater</span>
                                                    <span className="font-medium">{showtime.screen?.theater?.name}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-400">Seats</span>
                                                    <span className="font-medium text-yellow-500">{selectedSeats.join(', ')}</span>
                                                </div>
                                                <div className="border-t border-white/10 pt-3 mt-3">
                                                    <div className="flex justify-between font-bold text-lg">
                                                        <span>Total Amount</span>
                                                        <span className="text-green-400">₹{((showtime.price * selectedSeats.length) / 100).toFixed(2)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex gap-4 pt-4">
                                            <button
                                                type="button"
                                                onClick={() => setStep('seats')}
                                                className="flex-1 px-6 py-3 border border-white/10 text-gray-300 rounded-lg font-medium hover:bg-white/5 transition-all"
                                            >
                                                Back
                                            </button>
                                            <button
                                                type="submit"
                                                className="flex-1 px-6 py-3 gradient-gold text-[#0F172A] rounded-lg font-bold hover:shadow-lg hover:shadow-yellow-500/20 transition-all transform hover:-translate-y-0.5"
                                            >
                                                Proceed to Payment
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {step === 'payment' && clientSecret && (
                    <div className="max-w-2xl mx-auto">
                        <div className="glass-card rounded-2xl p-8 border-t border-white/10">
                            <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
                                <div className="w-1 h-6 bg-green-500 rounded-full"></div>
                                Complete Payment
                            </h2>

                            {/* Ticket Details on Payment Page */}
                            <div className="bg-white/5 rounded-xl p-6 mb-8 border border-white/5">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-semibold text-gray-300">Total Payable</h3>
                                    <span className="text-2xl font-bold text-green-400">₹{((showtime.price * selectedSeats.length) / 100).toFixed(2)}</span>
                                </div>
                                <div className="text-sm text-gray-400">
                                    Booking for <span className="text-white font-medium">{showtime.movie?.title}</span> • {selectedSeats.length} Seats
                                </div>
                            </div>

                            <Elements stripe={stripePromise} options={{
                                clientSecret,
                                appearance: {
                                    theme: 'night',
                                    variables: {
                                        colorPrimary: '#D4AF37',
                                        colorBackground: '#1e293b',
                                        colorText: '#ffffff',
                                        colorDanger: '#ef4444',
                                        fontFamily: 'Inter, system-ui, sans-serif',
                                        borderRadius: '8px',
                                    }
                                }
                            }}>
                                <CheckoutForm
                                    amount={showtime.price * selectedSeats.length}
                                    onSuccess={handlePaymentSuccess}
                                />
                            </Elements>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
