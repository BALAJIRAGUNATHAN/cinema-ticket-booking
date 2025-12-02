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
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <Link href="/" className="flex items-center gap-3">
                            <Image
                                src="/cinespot-logo.jpg"
                                alt="CineSpot"
                                width={40}
                                height={40}
                                className="rounded-lg"
                            />
                            <span className="text-2xl font-bold text-gray-900">CineSpot</span>
                        </Link>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <div className="bg-white py-12 border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">Exclusive Offers</h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Save on your movie tickets with our latest coupons and promotional offers.
                    </p>
                </div>
            </div>

            {/* Offers Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
                    </div>
                ) : offers.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
                        <p className="text-gray-500 text-lg">No active offers at the moment. Check back later!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {offers.map((offer) => (
                            <div key={offer.id} className="bg-white rounded-xl overflow-hidden border border-gray-200 hover:shadow-xl transition-all duration-300 group">
                                {/* Image */}
                                <div className="aspect-video relative bg-gray-100 overflow-hidden">
                                    {offer.image_url ? (
                                        <img
                                            src={offer.image_url}
                                            alt={offer.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50">
                                            <span className="text-4xl">🎁</span>
                                        </div>
                                    )}
                                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-red-600 shadow-sm">
                                        {offer.discount_type === 'PERCENTAGE' ? `${offer.discount_value}% OFF` : `₹${offer.discount_value} OFF`}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-6">
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">{offer.title}</h3>
                                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{offer.description}</p>

                                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-6">
                                        <Calendar className="w-4 h-4" />
                                        <span>Valid until {new Date(offer.valid_until).toLocaleDateString()}</span>
                                    </div>

                                    {/* Coupon Code */}
                                    <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-3 flex items-center justify-between group/code">
                                        <div className="font-mono font-bold text-gray-900 tracking-wider">
                                            {offer.coupon_code}
                                        </div>
                                        <button
                                            onClick={() => copyCode(offer.coupon_code)}
                                            className="text-sm font-medium text-red-600 hover:text-red-700 flex items-center gap-1.5 transition-colors"
                                        >
                                            {copiedCode === offer.coupon_code ? (
                                                <>
                                                    <Check className="w-4 h-4" />
                                                    Copied
                                                </>
                                            ) : (
                                                <>
                                                    <Copy className="w-4 h-4" />
                                                    Copy Code
                                                </>
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
            <footer className="bg-gray-900 text-white py-8 mt-auto">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <Image
                            src="/cinespot-logo.jpg"
                            alt="CineSpot"
                            width={32}
                            height={32}
                            className="rounded"
                        />
                        <span className="text-xl font-bold">CineSpot</span>
                    </div>
                    <p className="text-gray-400 text-sm">
                        © 2024 CineSpot. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
}
