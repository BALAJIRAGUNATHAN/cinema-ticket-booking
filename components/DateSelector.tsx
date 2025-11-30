'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface DateOption {
    date: Date;
    dayName: string;
    dayNumber: string;
    monthName: string;
    isToday: boolean;
}

interface DateSelectorProps {
    selectedDate: string; // YYYY-MM-DD format
    onDateChange: (date: string) => void;
}

export default function DateSelector({ selectedDate, onDateChange }: DateSelectorProps) {
    // Generate next 7 days
    const generateDates = (): DateOption[] => {
        const dates: DateOption[] = [];
        const today = new Date();

        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);

            dates.push({
                date,
                dayName: date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase(),
                dayNumber: date.getDate().toString(),
                monthName: date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
                isToday: i === 0
            });
        }

        return dates;
    };

    const dates = generateDates();

    const formatDateToString = (date: Date): string => {
        return date.toISOString().split('T')[0];
    };

    return (
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Select Date</h3>

            <div className="relative">
                {/* Scroll buttons */}
                <button
                    className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-10 h-10 bg-yellow-500 hover:bg-yellow-600 rounded-full flex items-center justify-center shadow-lg transition-all"
                    onClick={() => {
                        document.getElementById('date-scroll')?.scrollBy({ left: -200, behavior: 'smooth' });
                    }}
                >
                    <ChevronLeft className="w-5 h-5 text-black" />
                </button>

                <button
                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-10 h-10 bg-yellow-500 hover:bg-yellow-600 rounded-full flex items-center justify-center shadow-lg transition-all"
                    onClick={() => {
                        document.getElementById('date-scroll')?.scrollBy({ left: 200, behavior: 'smooth' });
                    }}
                >
                    <ChevronRight className="w-5 h-5 text-black" />
                </button>

                {/* Date options */}
                <div
                    id="date-scroll"
                    className="flex gap-3 overflow-x-auto scrollbar-hide scroll-smooth px-2"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {dates.map((dateOption, index) => {
                        const dateString = formatDateToString(dateOption.date);
                        const isSelected = dateString === selectedDate;

                        return (
                            <button
                                key={index}
                                onClick={() => onDateChange(dateString)}
                                className={`
                                    flex-shrink-0 w-24 py-4 px-3 rounded-xl border-2 transition-all
                                    ${isSelected
                                        ? 'bg-gradient-to-b from-red-500 to-red-600 border-red-400 shadow-lg shadow-red-500/30'
                                        : 'bg-white/5 border-white/10 hover:border-yellow-500/50 hover:bg-white/10'
                                    }
                                `}
                            >
                                <div className="text-center">
                                    <div className={`text-xs font-medium mb-1 ${isSelected ? 'text-white' : 'text-gray-400'}`}>
                                        {dateOption.dayName}
                                    </div>
                                    <div className={`text-2xl font-bold mb-1 ${isSelected ? 'text-white' : 'text-white'}`}>
                                        {dateOption.dayNumber}
                                    </div>
                                    <div className={`text-xs font-medium ${isSelected ? 'text-white/90' : 'text-gray-400'}`}>
                                        {dateOption.monthName}
                                    </div>
                                    {dateOption.isToday && (
                                        <div className={`text-xs mt-1 font-semibold ${isSelected ? 'text-white' : 'text-yellow-500'}`}>
                                            TODAY
                                        </div>
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
