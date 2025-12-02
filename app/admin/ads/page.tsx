'use client';

import { useState, useEffect } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function AdsPage() {
    const [ads, setAds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        title: '',
        image_url: '',
        link_url: '',
        display_order: 0,
    });

    useEffect(() => {
        fetchAds();
    }, []);

    const fetchAds = async () => {
        try {
            const res = await fetch(`${API_URL}/ads/all`);
            const data = await res.json();
            setAds(data);
        } catch (error) {
            console.error('Error fetching ads:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_URL}/ads`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                setFormData({ title: '', image_url: '', link_url: '', display_order: 0 });
                fetchAds();
                alert('Advertisement created successfully!');
            }
        } catch (error) {
            console.error('Error creating ad:', error);
            alert('Failed to create advertisement');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this advertisement?')) return;

        try {
            await fetch(`${API_URL}/ads/${id}`, { method: 'DELETE' });
            fetchAds();
        } catch (error) {
            console.error('Error deleting ad:', error);
        }
    };

    const toggleActive = async (id: string, currentStatus: boolean) => {
        try {
            await fetch(`${API_URL}/ads/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_active: !currentStatus }),
            });
            fetchAds();
        } catch (error) {
            console.error('Error updating ad:', error);
        }
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
                    Advertisements
                </h1>
                <p className="text-gray-400">Manage homepage advertisements</p>
            </div>

            {/* Add New Ad Form */}
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 mb-8">
                <h2 className="text-2xl font-bold text-white mb-6">Add New Advertisement</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Image URL</label>
                        <input
                            type="url"
                            value={formData.image_url}
                            onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Link URL (Optional)</label>
                        <input
                            type="url"
                            value={formData.link_url}
                            onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Display Order</label>
                        <input
                            type="number"
                            value={formData.display_order}
                            onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all"
                    >
                        Add Advertisement
                    </button>
                </form>
            </div>

            {/* Ads List */}
            <div className="space-y-4">
                {ads.length === 0 ? (
                    <div className="text-center py-12 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10">
                        <p className="text-gray-400">No advertisements yet</p>
                    </div>
                ) : (
                    ads.map((ad: any) => (
                        <div
                            key={ad.id}
                            className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 flex items-center gap-6"
                        >
                            {/* Preview Image */}
                            <img
                                src={ad.image_url}
                                alt={ad.title}
                                className="w-32 h-20 object-cover rounded-lg"
                            />

                            {/* Ad Info */}
                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-white">{ad.title}</h3>
                                <p className="text-gray-400 text-sm">Order: {ad.display_order}</p>
                                {ad.link_url && (
                                    <a
                                        href={ad.link_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-400 text-sm hover:underline"
                                    >
                                        {ad.link_url}
                                    </a>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => toggleActive(ad.id, ad.is_active)}
                                    className={`px-4 py-2 rounded-lg font-medium transition-all ${ad.is_active
                                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                            : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                                        }`}
                                >
                                    {ad.is_active ? 'Active' : 'Inactive'}
                                </button>
                                <button
                                    onClick={() => handleDelete(ad.id)}
                                    className="px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg font-medium hover:bg-red-500/30 transition-all"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
