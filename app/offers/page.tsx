'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Copy, Check, Clock, Calendar } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface Offer {
    id: string;
    title: string;
    description: string;
    image_url: string;
    coupon_code: string;
    discount_type: 'PERCENTAGE' | 'FIXED';
    discount_value: number;
    valid_until: string;
}

export default function OffersPage() {
    const [offers, setOffers] = useState<Offer[]>([]);
    const [loading, setLoading] = useState(true);
    const [copiedCode, setCopiedCode] = useState<string | null>(null);

    useEffect(() => {
        fetchOffers();
    }, []);

    const fetchOffers = async () => {
        try {
            const res = await fetch(`${API_URL}/offers`);
            const data = await res.json();
            setOffers(data);
        } catch (error) {
            console.error('Error fetching offers:', error);
        } finally {
            setLoading(false);
        }
    };

    const copyCode = (code: string) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    return (
        <div className="min-h-screen bg-[#020617] text-white selection:bg-yellow-500/30">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-[#020617]/80 backdrop-blur-md border-b border-white/5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-20">
                        <Link href="/" className="flex items-center gap-3 group">
                            <div className="relative w-10 h-10 rounded-xl overflow-hidden shadow-[0_0_15px_rgba(234,179,8,0.3)] group-hover:shadow-[0_0_25px_rgba(234,179,8,0.5)] transition-all duration-500 border border-white/10">
                                <Image
                                    src="/cinespot-logo.jpg"
                                    alt="CineSpot"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <span className="text-2xl font-bold bg-gradient-to-r from-white via-white to-gray-400 bg-clip-text text-transparent group-hover:text-yellow-500 transition-colors">CineSpot</span>
                        </Link>
                        <Link href="/" className="px-6 py-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all text-sm font-medium backdrop-blur-sm">
                            Back to Home
                        </Link>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <div className="relative pt-32 pb-20 overflow-hidden">
                {/* Background Glows */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
                    <div className="absolute top-20 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px]"></div>
                    <div className="absolute top-40 right-1/4 w-96 h-96 bg-yellow-500/10 rounded-full blur-[100px]"></div>
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
                    <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight drop-shadow-2xl">
                        Exclusive <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">Offers</span>
                    </h1>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto font-light leading-relaxed">
                        Unlock premium experiences with our curated selection of rewards and privileges.
                    </p>
                </div>
            </div>

            {/* Offers Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
                    </div>
                ) : offers.length === 0 ? (
                    <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-sm">
                        <p className="text-gray-400 text-lg">No active offers at the moment. Check back later!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {offers.map((offer) => (
                            <div key={offer.id} className="group relative bg-[#0F172A]/50 backdrop-blur-sm rounded-3xl overflow-hidden border border-white/5 hover:border-yellow-500/50 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_0_30px_rgba(234,179,8,0.1)]">
                                {/* Image */}
                                <div className="aspect-[16/9] relative overflow-hidden">
                                    {offer.image_url ? (
                                        <img
                                            src={offer.image_url}
                                            alt={offer.title}
                                            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1e293b] to-[#0f172a]">
                                            <span className="text-5xl filter drop-shadow-lg">🎁</span>
                                        </div>
                                    )}
                                    {/* Overlay Gradient */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-transparent to-transparent opacity-90"></div>

                                    <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10 shadow-lg">
                                        <span className="text-sm font-bold text-yellow-400">
                                            {offer.discount_type === 'PERCENTAGE' ? `${offer.discount_value}% OFF` : `₹${offer.discount_value} OFF`}
                                        </span>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-8 relative">
                                    <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-yellow-400 transition-colors">{offer.title}</h3>
                                    <p className="text-gray-400 text-sm mb-6 line-clamp-2 leading-relaxed font-light">{offer.description}</p>

                                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-6 font-mono uppercase tracking-wider">
                                        <Calendar className="w-3.5 h-3.5" />
                                        <span>Valid until {new Date(offer.valid_until).toLocaleDateString()}</span>
                                    </div>

                                    {/* Coupon Code Ticket Style */}
                                    <div className="relative bg-[#020617] border border-white/10 rounded-xl p-1 flex items-center justify-between group/code overflow-hidden">
                                        {/* Ticket Perforations */}
                                        <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-[#0F172A] rounded-full"></div>
                                        <div className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-[#0F172A] rounded-full"></div>

                                        <div className="flex-1 text-center py-3 border-r border-dashed border-white/10">
                                            <span className="font-mono font-bold text-lg text-white tracking-[0.15em] group-hover/code:text-yellow-500 transition-colors">
                                                {offer.coupon_code}
                                            </span>
                                        </div>

                                        <button
                                            onClick={() => copyCode(offer.coupon_code)}
                                            className="px-5 py-3 hover:bg-white/5 transition-colors flex items-center justify-center text-gray-400 hover:text-white"
                                        >
                                            {copiedCode === offer.coupon_code ? (
                                                <Check className="w-5 h-5 text-green-400" />
                                            ) : (
                                                <Copy className="w-5 h-5" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer */}
            <footer className="bg-[#020617] border-t border-white/5 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">
                    <div className="flex items-center gap-3 mb-6 opacity-80 hover:opacity-100 transition-opacity">
                        <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-white/10">
                            <Image
                                src="/cinespot-logo.jpg"
                                alt="CineSpot"
                                fill
                                className="object-cover"
                            />
                        </div>
                        <span className="text-xl font-bold text-white">CineSpot</span>
                    </div>
                    <p className="text-gray-500 text-sm font-light">
                        © 2024 CineSpot. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
}
