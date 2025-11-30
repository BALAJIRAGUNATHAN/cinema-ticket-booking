'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Loader2, Plus, X } from 'lucide-react';

interface CastMember {
    name: string;
    role: string;
    image: string;
}

export default function NewMoviePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        genre: '',
        duration: '',
        release_date: '',
        poster_url: '',
        trailer_url: '',
    });
    const [selectedLanguages, setSelectedLanguages] = useState<string[]>(['English']);
    const [cast, setCast] = useState([
        { name: '', role: '', image: '' },
        { name: '', role: '', image: '' },
        { name: '', role: '', image: '' },
        { name: '', role: '', image: '' },
    ]);

    const addCastMember = () => {
        if (cast.length < 4) {
            setCast([...cast, { name: '', role: '', image: '' }]);
        }
    };

    const removeCastMember = (index: number) => {
        setCast(cast.filter((_, i) => i !== index));
    };

    const updateCastMember = (index: number, field: keyof CastMember, value: string) => {
        const updated = [...cast];
        updated[index][field] = value;
        setCast(updated);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            const res = await fetch(`${API_URL}/movies`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    duration: parseInt(formData.duration),
                    cast: cast.filter(c => c.name.trim() !== ''),
                    trailer_url: formData.trailer_url,
                    languages: selectedLanguages,
                }),
            });

            if (!res.ok) throw new Error('Failed to create movie');

            router.push('/admin/movies');
            router.refresh();
        } catch (error) {
            console.error('Error creating movie:', error);
            alert('Error creating movie. Please check console.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Add New Movie</h1>

            <form onSubmit={handleSubmit} className="space-y-8 bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                {/* Basic Info */}
                <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">Basic Information</h2>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Movie Title</label>
                        <input
                            type="text"
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                            required
                            rows={4}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Genre</label>
                            <input
                                type="text"
                                required
                                placeholder="e.g. Action, Drama"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                value={formData.genre}
                                onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
                            <input
                                type="number"
                                required
                                min="1"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                value={formData.duration}
                                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Release Date</label>
                            <input
                                type="date"
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                value={formData.release_date}
                                onChange={(e) => setFormData({ ...formData, release_date: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Poster URL</label>
                            <input
                                type="url"
                                required
                                placeholder="https://..."
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                value={formData.poster_url}
                                onChange={(e) => setFormData({ ...formData, poster_url: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Trailer URL (YouTube)</label>
                        <input
                            type="url"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            value={formData.trailer_url}
                            onChange={(e) => setFormData({ ...formData, trailer_url: e.target.value })}
                            placeholder="https://youtube.com/watch?v=..."
                        />
                    </div>

                    {/* Languages */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Languages</label>
                        <div className="flex flex-wrap gap-3">
                            {['English', 'Hindi', 'Tamil', 'Telugu', 'Malayalam', 'Kannada'].map((lang) => (
                                <label key={lang} className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={selectedLanguages.includes(lang)}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setSelectedLanguages([...selectedLanguages, lang]);
                                            } else {
                                                setSelectedLanguages(selectedLanguages.filter(l => l !== lang));
                                            }
                                        }}
                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-gray-700">{lang}</span>
                                </label>
                            ))}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Select all languages available for this movie</p>
                    </div>
                </div>

                {/* Cast Section */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between border-b pb-2">
                        <h2 className="text-xl font-semibold text-gray-800">Cast Members (Max 4)</h2>
                        <button
                            type="button"
                            onClick={addCastMember}
                            disabled={cast.length >= 4}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            <Plus className="w-4 h-4" />
                            Add Cast
                        </button>
                    </div>

                    {cast.length === 0 && (
                        <p className="text-gray-500 text-sm italic">No cast members added yet. Click "Add Cast" to add up to 4 cast members.</p>
                    )}

                    {cast.map((member, index) => (
                        <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="font-medium text-gray-700">Cast Member {index + 1}</h3>
                                <button
                                    type="button"
                                    onClick={() => removeCastMember(index)}
                                    className="text-red-600 hover:text-red-700 p-1"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                <input
                                    type="text"
                                    placeholder="Actor Name"
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                    value={member.name}
                                    onChange={(e) => updateCastMember(index, 'name', e.target.value)}
                                />
                                <input
                                    type="text"
                                    placeholder="Character/Role"
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                    value={member.role}
                                    onChange={(e) => updateCastMember(index, 'role', e.target.value)}
                                />
                                <input
                                    type="url"
                                    placeholder="Image URL"
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                    value={member.image}
                                    onChange={(e) => updateCastMember(index, 'image', e.target.value)}
                                />
                            </div>
                        </div>
                    ))}
                </div>

                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            'Create Movie'
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
