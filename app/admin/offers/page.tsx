'use client';

import { useState, useEffect } from 'react';
import { Tag, Calendar, TrendingUp, Trash2 } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function OffersPage() {
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        image_url: '',
        coupon_code: '',
        discount_type: 'PERCENTAGE',
        discount_value: 0,
        min_booking_amount: 0,
        max_discount_amount: null,
        valid_from: '',
        valid_until: '',
        terms_conditions: '',
    });

    useEffect(() => {
        fetchOffers();
    }, []);

    const fetchOffers = async () => {
        try {
            const res = await fetch(`${API_URL}/offers/all`);
            const data = await res.json();
            setOffers(data);
        } catch (error) {
            console.error('Error fetching offers:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const submitData = {
                ...formData,
                coupon_code: formData.coupon_code.toUpperCase(),
                discount_value: parseFloat(formData.discount_value.toString()),
                min_booking_amount: parseFloat(formData.min_booking_amount.toString()),
                max_discount_amount: formData.max_discount_amount ? parseFloat(String(formData.max_discount_amount)) : null,
            };

            const res = await fetch(`${API_URL}/offers`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(submitData),
            });

            if (res.ok) {
                alert('Offer created successfully!');
                setFormData({
                    title: '',
                    description: '',
                    image_url: '',
                    coupon_code: '',
                    discount_type: 'PERCENTAGE',
                    discount_value: 0,
                    min_booking_amount: 0,
                    max_discount_amount: null,
                    valid_from: '',
                    valid_until: '',
                    terms_conditions: '',
                });
                fetchOffers();
            } else {
                const error = await res.json();
                alert(`Failed to create offer: ${error.detail}`);
            }
        } catch (error) {
            console.error('Error creating offer:', error);
            alert('Failed to create offer');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this offer?')) return;

        try {
            await fetch(`${API_URL}/offers/${id}`, { method: 'DELETE' });
            fetchOffers();
        } catch (error) {
            console.error('Error deleting offer:', error);
        }
    };

    const isExpired = (validUntil: string) => {
        return new Date(validUntil) < new Date();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    return (
        <div className="p-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-emerald-600 bg-clip-text text-transparent mb-2">
                    Offers & Coupons
                </h1>
                <p className="text-gray-400">Manage promotional offers and discount coupons</p>
            </div>

            {/* Create Form */}
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 mb-8">
                <h2 className="text-2xl font-bold text-white mb-6">Create New Offer</h2>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-300 mb-2">Title *</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
                            required
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
                            rows={3}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Coupon Code *</label>
                        <input
                            type="text"
                            value={formData.coupon_code}
                            onChange={(e) => setFormData({ ...formData, coupon_code: e.target.value.toUpperCase() })}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white font-mono uppercase focus:outline-none focus:border-purple-500"
                            placeholder="SAVE20"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Discount Type *</label>
                        <select
                            value={formData.discount_type}
                            onChange={(e) => setFormData({ ...formData, discount_type: e.target.value })}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
                        >
                            <option value="PERCENTAGE">Percentage (%)</option>
                            <option value="FIXED">Fixed Amount (₹)</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Discount Value * {formData.discount_type === 'PERCENTAGE' ? '(%)' : '(₹)'}
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            value={formData.discount_value}
                            onChange={(e) => setFormData({ ...formData, discount_value: parseFloat(e.target.value) })}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Min Booking Amount (₹)</label>
                        <input
                            type="number"
                            step="0.01"
                            value={formData.min_booking_amount}
                            onChange={(e) => setFormData({ ...formData, min_booking_amount: parseFloat(e.target.value) })}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Max Discount Amount (₹)</label>
                        <input
                            type="number"
                            step="0.01"
                            value={formData.max_discount_amount || ''}
                            onChange={(e) => setFormData({ ...formData, max_discount_amount: e.target.value ? parseFloat(e.target.value) : null })}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Valid From *</label>
                        <input
                            type="datetime-local"
                            value={formData.valid_from}
                            onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Valid Until *</label>
                        <input
                            type="datetime-local"
                            value={formData.valid_until}
                            onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
                            required
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-300 mb-2">Image URL</label>
                        <input
                            type="url"
                            value={formData.image_url}
                            onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-300 mb-2">Terms & Conditions</label>
                        <textarea
                            value={formData.terms_conditions}
                            onChange={(e) => setFormData({ ...formData, terms_conditions: e.target.value })}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
                            rows={3}
                        />
                    </div>

                    <div className="md:col-span-2">
                        <button
                            type="submit"
                            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all"
                        >
                            Create Offer
                        </button>
                    </div>
                </form>
            </div>

            {/* Offers List */}
            <div className="space-y-4">
                {offers.length === 0 ? (
                    <div className="text-center py-12 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10">
                        <Tag className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                        <p className="text-gray-400">No offers yet</p>
                    </div>
                ) : (
                    offers.map((offer: any) => {
                        const expired = isExpired(offer.valid_until);
                        return (
                            <div
                                key={offer.id}
                                className={`bg-white/5 backdrop-blur-xl rounded-2xl border p-6 ${expired ? 'border-red-500/30' : offer.is_active ? 'border-green-500/30' : 'border-gray-500/30'
                                    }`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-xl font-bold text-white">{offer.title}</h3>
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${expired ? 'bg-red-500/20 text-red-400' :
                                                offer.is_active ? 'bg-green-500/20 text-green-400' :
                                                    'bg-gray-500/20 text-gray-400'
                                                }`}>
                                                {expired ? 'EXPIRED' : offer.is_active ? 'ACTIVE' : 'INACTIVE'}
                                            </span>
                                        </div>

                                        {offer.description && (
                                            <p className="text-gray-400 mb-3">{offer.description}</p>
                                        )}

                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase">Coupon Code</p>
                                                <p className="text-lg font-bold text-yellow-400 font-mono">{offer.coupon_code}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase">Discount</p>
                                                <p className="text-lg font-bold text-white">
                                                    {offer.discount_type === 'PERCENTAGE' ? `${offer.discount_value}%` : `₹${offer.discount_value}`}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase">Min Amount</p>
                                                <p className="text-lg font-bold text-white">₹{offer.min_booking_amount}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase">Usage</p>
                                                <p className="text-lg font-bold text-white">
                                                    {offer.used_count || 0}
                                                    {offer.usage_limit ? `/${offer.usage_limit}` : ''}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 text-sm text-gray-400">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4" />
                                                <span>{new Date(offer.valid_from).toLocaleDateString()} - {new Date(offer.valid_until).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleDelete(offer.id)}
                                        className="px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg font-medium hover:bg-red-500/30 transition-all flex items-center gap-2"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Delete
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
