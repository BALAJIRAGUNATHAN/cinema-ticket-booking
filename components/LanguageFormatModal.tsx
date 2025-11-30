'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

interface LanguageFormatModalProps {
    isOpen: boolean;
    onClose: () => void;
    languages: string[];
    formats: string[];
    selectedLanguage: string;
    selectedFormat: string;
    onApply: (language: string, format: string) => void;
}

export default function LanguageFormatModal({
    isOpen,
    onClose,
    languages,
    formats,
    selectedLanguage,
    selectedFormat,
    onApply
}: LanguageFormatModalProps) {
    const [tempLanguage, setTempLanguage] = useState(selectedLanguage);
    const [tempFormat, setTempFormat] = useState(selectedFormat);

    if (!isOpen) return null;

    const handleApply = () => {
        onApply(tempLanguage, tempFormat);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-[#1a1a2e] border border-white/20 rounded-2xl max-w-md w-full shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                    <h2 className="text-2xl font-bold text-white">Select Language and Format</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Language Selection */}
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-3">LANGUAGE</h3>
                        <div className="grid grid-cols-2 gap-3">
                            {languages.map((language) => (
                                <button
                                    key={language}
                                    onClick={() => setTempLanguage(language)}
                                    className={`
                                        px-4 py-3 rounded-xl border-2 font-medium transition-all
                                        ${tempLanguage === language
                                            ? 'bg-red-500 border-red-400 text-white shadow-lg shadow-red-500/30'
                                            : 'bg-white/5 border-white/10 text-gray-300 hover:border-yellow-500/50 hover:bg-white/10'
                                        }
                                    `}
                                >
                                    {language}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Format Selection */}
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-3">FORMAT</h3>
                        <div className="grid grid-cols-2 gap-3">
                            {formats.map((format) => (
                                <button
                                    key={format}
                                    onClick={() => setTempFormat(format)}
                                    className={`
                                        px-4 py-3 rounded-xl border-2 font-medium transition-all
                                        ${tempFormat === format
                                            ? 'bg-red-500 border-red-400 text-white shadow-lg shadow-red-500/30'
                                            : 'bg-white/5 border-white/10 text-gray-300 hover:border-yellow-500/50 hover:bg-white/10'
                                        }
                                    `}
                                >
                                    {format}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-white/10">
                    <button
                        onClick={handleApply}
                        className="w-full px-6 py-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-red-500/30 transform hover:scale-105"
                    >
                        Apply
                    </button>
                </div>
            </div>
        </div>
    );
}
