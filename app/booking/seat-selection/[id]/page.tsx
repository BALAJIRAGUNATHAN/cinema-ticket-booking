'use client';

import { useState, useEffect, use } from 'react';
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
    const { id } = use(params);
    const router = useRouter();
    const [showtime, setShowtime] = useState<any>(null);
    const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
    const [unavailableSeats, setUnavailableSeats] = useState<string[]>([]);
    const [step, setStep] = useState<'seats' | 'details' | 'payment'>('seats');
    const [loading, setLoading] = useState(true);
    const [clientSecret, setClientSecret] = useState('');
    const [customerDetails, setCustomerDetails] = useState({
        name: '',
        email: '',
        phone: ''
    });

    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
    const [discountAmount, setDiscountAmount] = useState(0);
    const [couponError, setCouponError] = useState('');
    const [validatingCoupon, setValidatingCoupon] = useState(false);

    useEffect(() => {
        const fetchShowtime = async () => {
            try {
                const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
                const res = await fetch(`${API_URL}/showtimes/${id}`);
                if (!res.ok) throw new Error('Failed to fetch showtime');
                const data = await res.json();
                setShowtime(data);

                // Fetch booked seats
                const seatsRes = await fetch(`${API_URL}/bookings/showtime/${id}/seats`);
                if (seatsRes.ok) {
                    const bookedSeats = await seatsRes.json();
                    setUnavailableSeats(bookedSeats);
                } else {
                    console.error('Failed to fetch booked seats');
                    setUnavailableSeats([]);
                }
            } catch (error) {
                console.error('Error fetching showtime:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchShowtime();
    }, [id]);

    const toggleSeat = (seatId: string) => {
        if (unavailableSeats.includes(seatId)) return;

        setSelectedSeats(prev => {
            if (prev.includes(seatId)) {
                return prev.filter(id => id !== seatId);
            }
            if (prev.length >= 8) {
                alert('You can select up to 8 seats max');
                return prev;
            }
            return [...prev, seatId];
        });
    };

    const handleContinueToDetails = () => {
        setStep('details');
    };

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) return;

        setValidatingCoupon(true);
        setCouponError('');

        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            const originalAmount = (showtime.price * selectedSeats.length) / 100; // Convert to main currency unit for validation

            const res = await fetch(`${API_URL}/offers/validate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    coupon_code: couponCode,
                    booking_amount: originalAmount
                })
            });

            const data = await res.json();

            if (!res.ok) {
                setCouponError(data.detail || 'Invalid coupon');
                setAppliedCoupon(null);
                setDiscountAmount(0);
            } else {
                setAppliedCoupon(data.offer);
                setDiscountAmount(data.discount_amount * 100); // Convert back to cents
                setCouponError('');
            }
        } catch (error) {
            console.error('Error validating coupon:', error);
            setCouponError('Failed to validate coupon');
        } finally {
            setValidatingCoupon(false);
        }
    };

    const removeCoupon = () => {
        setAppliedCoupon(null);
        setDiscountAmount(0);
        setCouponCode('');
        setCouponError('');
    };

    const handleDetailsSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const originalTotal = showtime.price * selectedSeats.length;
        const finalTotal = Math.max(0, originalTotal - discountAmount);

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
                    total_amount: finalTotal,
                    coupon_code: appliedCoupon ? appliedCoupon.coupon_code : null,
                    discount_amount: discountAmount
                }),
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.detail || 'Failed to create payment intent');
            }

            const data = await res.json();
            setClientSecret(data.clientSecret);
            setStep('payment');
        } catch (e: any) {
            console.error(e);
            alert(`Payment Error: ${e.message || 'Failed to initialize payment'}`);
        } finally {
            setLoading(false);
        }
    };

    const handlePaymentSuccess = async (paymentIntentId: string) => {
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            const originalTotal = showtime.price * selectedSeats.length;
            const finalTotal = Math.max(0, originalTotal - discountAmount);

            const response = await fetch(`${API_URL}/bookings/confirm-booking`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    showtime_id: id,
                    customer_name: customerDetails.name,
                    customer_email: customerDetails.email,
                    customer_phone: customerDetails.phone,
                    seats: selectedSeats,
                    total_amount: finalTotal,
                    coupon_code: appliedCoupon ? appliedCoupon.coupon_code : null,
                    discount_amount: discountAmount,
                    payment_intent_id: paymentIntentId
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
                totalAmount: finalTotal,
                originalAmount: originalTotal,
                discountAmount: discountAmount
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
    const originalTotal = showtime.price * selectedSeats.length;
    const finalTotal = Math.max(0, originalTotal - discountAmount);

    return (
        <div className="min-h-screen bg-[#020617] text-white selection:bg-yellow-500/30">
            {/* Header */}
            <div className="bg-[#020617]/80 backdrop-blur-md border-b border-white/5 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-6">
                    <button onClick={() => router.back()} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-white tracking-tight">{showtime.movie?.title}</h1>
                        <p className="text-sm text-gray-400 flex items-center gap-3 mt-0.5">
                            <span className="flex items-center gap-1.5 text-yellow-500">
                                <Clock className="w-3.5 h-3.5" />
                                {new Date(showtime.start_time).toLocaleString()}
                            </span>
                            <span className="w-1 h-1 rounded-full bg-gray-600"></span>
                            <span>{showtime.screen?.theater?.name}</span>
                            <span className="w-1 h-1 rounded-full bg-gray-600"></span>
                            <span>{showtime.screen?.name}</span>
                        </p>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Progress Steps */}
                <div className="flex items-center justify-center gap-4 mb-12">
                    <div className={`flex items-center gap-3 ${step === 'seats' ? 'text-yellow-500' : 'text-gray-500'}`}>
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold transition-all shadow-lg ${step === 'seats' ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-[#020617] shadow-yellow-500/20' : 'bg-white/5 border border-white/10'}`}>
                            {step !== 'seats' ? <Check className="w-5 h-5" /> : '1'}
                        </div>
                        <span className="font-medium tracking-wide text-sm uppercase">Select Seats</span>
                    </div>
                    <div className="w-20 h-0.5 bg-white/5 rounded-full overflow-hidden">
                        <div className={`h-full bg-yellow-500 transition-all duration-500 ${step !== 'seats' ? 'w-full' : 'w-0'}`}></div>
                    </div>
                    <div className={`flex items-center gap-3 ${step === 'details' ? 'text-yellow-500' : 'text-gray-500'}`}>
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold transition-all shadow-lg ${step === 'details' ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-[#020617] shadow-yellow-500/20' : step === 'payment' ? 'bg-green-500 text-white' : 'bg-white/5 border border-white/10'}`}>
                            {step === 'payment' ? <Check className="w-5 h-5" /> : '2'}
                        </div>
                        <span className="font-medium tracking-wide text-sm uppercase">Details</span>
                    </div>
                    <div className="w-20 h-0.5 bg-white/5 rounded-full overflow-hidden">
                        <div className={`h-full bg-yellow-500 transition-all duration-500 ${step === 'payment' ? 'w-full' : 'w-0'}`}></div>
                    </div>
                    <div className={`flex items-center gap-3 ${step === 'payment' ? 'text-yellow-500' : 'text-gray-500'}`}>
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold transition-all shadow-lg ${step === 'payment' ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-[#020617] shadow-yellow-500/20' : 'bg-white/5 border border-white/10'}`}>
                            3
                        </div>
                        <span className="font-medium tracking-wide text-sm uppercase">Payment</span>
                    </div>
                </div>

                {step === 'seats' && (
                    <div className="grid lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                        <div className="lg:col-span-2">
                            <div className="bg-[#0F172A]/50 backdrop-blur-sm border border-white/5 rounded-3xl p-8 relative overflow-hidden shadow-2xl">
                                {/* Screen Glow Effect */}
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-blue-500/10 blur-[80px] rounded-full pointer-events-none"></div>

                                <div className="mb-20 relative">
                                    <div className="w-3/4 mx-auto h-1.5 bg-gradient-to-r from-transparent via-blue-400/30 to-transparent rounded-full mb-6 shadow-[0_0_30px_rgba(59,130,246,0.3)]"></div>
                                    <p className="text-center text-xs text-blue-400/60 uppercase tracking-[0.5em] font-medium">Screen This Way</p>
                                </div>

                                <div className="flex flex-col gap-5 items-center perspective-[1000px]">
                                    {rows.map(row => (
                                        <div key={row} className="flex gap-4 items-center transform-style-3d hover:translate-z-4 transition-transform">
                                            <span className="w-6 text-center text-gray-600 text-xs font-bold">{row}</span>
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
                                                            group relative w-9 h-9 rounded-lg text-[10px] font-medium transition-all duration-300
                                                            ${isUnavailable
                                                                ? 'bg-gray-800/50 text-gray-600 cursor-not-allowed border border-white/5'
                                                                : isSelected
                                                                    ? 'bg-yellow-500 text-[#020617] scale-110 shadow-[0_0_20px_rgba(234,179,8,0.4)] z-10 font-bold'
                                                                    : 'bg-white/5 text-gray-400 hover:bg-white/20 hover:scale-105 border border-white/5 hover:border-white/20'
                                                            }
                                                        `}
                                                    >
                                                        <span className="absolute inset-0 flex items-center justify-center">{col}</span>
                                                        {/* Neon Glow for Selected */}
                                                        {isSelected && <div className="absolute inset-0 bg-yellow-500 blur-md opacity-50 -z-10"></div>}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    ))}
                                </div>

                                <div className="flex items-center justify-center gap-10 mt-16 text-sm border-t border-white/5 pt-8">
                                    <div className="flex items-center gap-3">
                                        <div className="w-5 h-5 bg-white/10 rounded border border-white/5"></div>
                                        <span className="text-gray-400">Available</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-5 h-5 bg-yellow-500 rounded shadow-[0_0_10px_rgba(234,179,8,0.4)]"></div>
                                        <span className="text-gray-300">Selected</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-5 h-5 bg-gray-800 rounded border border-white/5 opacity-50"></div>
                                        <span className="text-gray-500">Sold</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-1">
                            <div className="bg-[#0F172A]/50 backdrop-blur-sm border border-white/5 rounded-3xl p-6 sticky top-28 shadow-xl">
                                <h3 className="text-lg font-bold mb-6 flex items-center gap-3 text-white">
                                    <div className="p-2 bg-yellow-500/10 rounded-lg">
                                        <Ticket className="w-5 h-5 text-yellow-500" />
                                    </div>
                                    Booking Summary
                                </h3>
                                <div className="space-y-4 text-sm">
                                    <div className="flex justify-between items-center py-3 border-b border-white/5">
                                        <span className="text-gray-400">Theater</span>
                                        <span className="font-medium text-right text-gray-200">{showtime.screen?.theater?.name}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-3 border-b border-white/5">
                                        <span className="text-gray-400">Screen</span>
                                        <span className="font-medium text-right text-gray-200">{showtime.screen?.name}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-3 border-b border-white/5">
                                        <span className="text-gray-400">Date</span>
                                        <span className="font-medium text-right text-gray-200">{new Date(showtime.start_time).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-3 border-b border-white/5">
                                        <span className="text-gray-400">Time</span>
                                        <span className="font-medium text-right text-gray-200">{new Date(showtime.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>

                                    <div className="bg-white/5 rounded-xl p-5 mt-6 border border-white/5">
                                        <div className="flex justify-between mb-3">
                                            <span className="text-gray-400">Seats ({selectedSeats.length})</span>
                                            <span className="font-bold text-yellow-500">{selectedSeats.length > 0 ? selectedSeats.join(', ') : '-'}</span>
                                        </div>
                                        <div className="flex justify-between text-xs text-gray-500 mb-4">
                                            <span>Price per seat</span>
                                            <span>₹{(showtime.price / 100).toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between font-bold text-lg pt-4 border-t border-white/10">
                                            <span>Total</span>
                                            <span className="text-white">₹{((showtime.price * selectedSeats.length) / 100).toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    disabled={selectedSeats.length === 0 || loading}
                                    onClick={handleContinueToDetails}
                                    className="w-full mt-6 py-4 bg-gradient-to-r from-yellow-400 to-yellow-600 text-[#020617] font-bold rounded-xl hover:shadow-[0_0_20px_rgba(234,179,8,0.3)] disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:-translate-y-0.5 disabled:hover:translate-y-0 disabled:hover:shadow-none"
                                >
                                    {loading ? 'Locking Seats...' : 'Continue to Details'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {step === 'details' && (
                    <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700">
                        <div className="grid md:grid-cols-3 gap-8">
                            {/* Movie Poster */}
                            <div className="md:col-span-1 hidden md:block">
                                <div className="bg-[#0F172A]/50 backdrop-blur-sm border border-white/5 rounded-3xl overflow-hidden sticky top-28 shadow-2xl shadow-black/50">
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
                                    <div className="p-6 bg-[#020617]/80 backdrop-blur-md border-t border-white/5">
                                        <h3 className="font-bold text-xl text-center text-white">{showtime.movie?.title}</h3>
                                        <p className="text-center text-gray-500 text-sm mt-1">{showtime.movie?.genre}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Form */}
                            <div className="md:col-span-2 space-y-6">
                                {/* Countdown Timer */}
                                <CountdownTimer onExpire={handleTimerExpire} />

                                <div className="bg-[#0F172A]/50 backdrop-blur-sm border border-white/5 rounded-3xl p-8 shadow-xl">
                                    <h2 className="text-2xl font-bold mb-8 flex items-center gap-3 text-white">
                                        <div className="w-1.5 h-8 bg-gradient-to-b from-yellow-400 to-yellow-600 rounded-full"></div>
                                        Enter Your Details
                                    </h2>
                                    <form onSubmit={handleDetailsSubmit} className="space-y-6">
                                        <div className="space-y-5">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-400 mb-2 ml-1">Full Name</label>
                                                <input
                                                    required
                                                    type="text"
                                                    placeholder="John Doe"
                                                    className="w-full px-5 py-3.5 bg-[#020617] border border-white/10 rounded-xl focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500 outline-none transition-all text-white placeholder-gray-600"
                                                    value={customerDetails.name}
                                                    onChange={e => setCustomerDetails({ ...customerDetails, name: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-400 mb-2 ml-1">Email Address</label>
                                                <input
                                                    required
                                                    type="email"
                                                    placeholder="john@example.com"
                                                    className="w-full px-5 py-3.5 bg-[#020617] border border-white/10 rounded-xl focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500 outline-none transition-all text-white placeholder-gray-600"
                                                    value={customerDetails.email}
                                                    onChange={e => setCustomerDetails({ ...customerDetails, email: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-400 mb-2 ml-1">Phone Number</label>
                                                <input
                                                    required
                                                    type="tel"
                                                    placeholder="+91 98765 43210"
                                                    className="w-full px-5 py-3.5 bg-[#020617] border border-white/10 rounded-xl focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500 outline-none transition-all text-white placeholder-gray-600"
                                                    value={customerDetails.phone}
                                                    onChange={e => setCustomerDetails({ ...customerDetails, phone: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        {/* Coupon Code Section */}
                                        <div className="bg-white/5 rounded-2xl p-6 border border-white/5 mt-8">
                                            <h3 className="font-bold text-gray-300 mb-4 text-sm uppercase tracking-wider flex items-center gap-2">
                                                <Ticket className="w-4 h-4 text-yellow-500" />
                                                Offers & Coupons
                                            </h3>

                                            {appliedCoupon ? (
                                                <div className="flex items-center justify-between bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 shadow-[0_0_10px_rgba(74,222,128,0.2)]">
                                                            <Check className="w-5 h-5" />
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-green-400 text-lg">{appliedCoupon.coupon_code}</p>
                                                            <p className="text-sm text-green-300/70">
                                                                {appliedCoupon.discount_type === 'PERCENTAGE'
                                                                    ? `${appliedCoupon.discount_value}% OFF`
                                                                    : `₹${appliedCoupon.discount_value} OFF`} applied successfully
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={removeCoupon}
                                                        className="px-4 py-2 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex gap-3">
                                                    <input
                                                        type="text"
                                                        placeholder="ENTER COUPON CODE"
                                                        className="flex-1 px-5 py-3.5 bg-[#020617] border border-white/10 rounded-xl focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500 outline-none transition-all text-white placeholder-gray-600 uppercase font-mono tracking-wider"
                                                        value={couponCode}
                                                        onChange={e => {
                                                            setCouponCode(e.target.value.toUpperCase());
                                                            setCouponError('');
                                                        }}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={handleApplyCoupon}
                                                        disabled={!couponCode || validatingCoupon}
                                                        className="px-8 py-3.5 bg-white/10 text-white rounded-xl font-bold hover:bg-white/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-white/10"
                                                    >
                                                        {validatingCoupon ? <Loader2 className="w-5 h-5 animate-spin" /> : 'APPLY'}
                                                    </button>
                                                </div>
                                            )}
                                            {couponError && (
                                                <p className="text-red-400 text-sm mt-3 flex items-center gap-2 bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                                                    <AlertCircle className="w-4 h-4" />
                                                    {couponError}
                                                </p>
                                            )}
                                        </div>

                                        {/* Ticket Summary */}
                                        <div className="bg-gradient-to-br from-[#020617] to-[#0F172A] rounded-2xl p-6 border border-white/10 mt-8 shadow-inner">
                                            <h3 className="font-bold text-gray-300 mb-6 text-sm uppercase tracking-wider border-b border-white/5 pb-4">Booking Summary</h3>
                                            <div className="space-y-4">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-400">Movie</span>
                                                    <span className="font-medium text-white">{showtime.movie?.title}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-400">Theater</span>
                                                    <span className="font-medium text-white">{showtime.screen?.theater?.name}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-400">Seats</span>
                                                    <span className="font-medium text-yellow-500">{selectedSeats.join(', ')}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-400">Subtotal</span>
                                                    <span className="font-medium text-white">₹{(originalTotal / 100).toFixed(2)}</span>
                                                </div>

                                                {discountAmount > 0 && (
                                                    <div className="flex justify-between text-sm text-green-400 bg-green-500/5 p-2 rounded-lg border border-green-500/10">
                                                        <span className="font-medium">Discount Applied</span>
                                                        <span className="font-bold">- ₹{(discountAmount / 100).toFixed(2)}</span>
                                                    </div>
                                                )}

                                                <div className="border-t border-white/10 pt-4 mt-4">
                                                    <div className="flex justify-between items-end">
                                                        <span className="text-gray-400 text-sm">Total Amount</span>
                                                        <span className="text-2xl font-bold text-white">₹{(finalTotal / 100).toFixed(2)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex gap-4 pt-6">
                                            <button
                                                type="button"
                                                onClick={() => setStep('seats')}
                                                className="px-8 py-4 border border-white/10 text-gray-300 rounded-xl font-bold hover:bg-white/5 transition-all hover:text-white"
                                            >
                                                Back
                                            </button>
                                            <button
                                                type="submit"
                                                className="flex-1 px-8 py-4 bg-gradient-to-r from-yellow-400 to-yellow-600 text-[#020617] rounded-xl font-bold text-lg hover:shadow-[0_0_20px_rgba(234,179,8,0.3)] transition-all transform hover:-translate-y-0.5"
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
                    <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700">
                        <div className="bg-[#0F172A]/50 backdrop-blur-sm border border-white/5 rounded-3xl p-8 shadow-2xl">
                            <h2 className="text-2xl font-bold mb-8 flex items-center gap-3 text-white">
                                <div className="w-1.5 h-8 bg-green-500 rounded-full shadow-[0_0_15px_rgba(34,197,94,0.5)]"></div>
                                Complete Payment
                            </h2>

                            {/* Ticket Details on Payment Page */}
                            <div className="bg-[#020617] rounded-2xl p-6 mb-8 border border-white/10 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 rounded-full blur-3xl pointer-events-none"></div>
                                <div className="flex justify-between items-center mb-4 relative z-10">
                                    <h3 className="font-medium text-gray-400">Total Payable</h3>
                                    <span className="text-3xl font-bold text-white">₹{(finalTotal / 100).toFixed(2)}</span>
                                </div>
                                <div className="text-sm text-gray-400 relative z-10">
                                    Booking for <span className="text-white font-bold">{showtime.movie?.title}</span> • <span className="text-yellow-500">{selectedSeats.length} Seats</span>
                                </div>
                                {appliedCoupon && (
                                    <div className="mt-3 text-xs text-green-400 flex items-center gap-1.5 bg-green-500/10 py-1.5 px-3 rounded-lg w-fit border border-green-500/20">
                                        <Check className="w-3 h-3" />
                                        Coupon <span className="font-bold">{appliedCoupon.coupon_code}</span> applied
                                    </div>
                                )}
                            </div>

                            <Elements stripe={stripePromise} options={{
                                clientSecret,
                                appearance: {
                                    theme: 'night',
                                    variables: {
                                        colorPrimary: '#D4AF37',
                                        colorBackground: '#020617',
                                        colorText: '#ffffff',
                                        colorDanger: '#ef4444',
                                        fontFamily: 'Inter, system-ui, sans-serif',
                                        borderRadius: '12px',
                                        spacingUnit: '4px',
                                    }
                                }
                            }}>
                                <CheckoutForm
                                    amount={finalTotal}
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
