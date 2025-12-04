'use client'

import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'
import { User, LogOut, Ticket, ChevronDown } from 'lucide-react'
import { useState, useRef, useEffect, memo } from 'react'

const UserMenu = memo(function UserMenu() {
    const { user, signOut } = useAuth()
    const [isOpen, setIsOpen] = useState(false)
    const menuRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    if (!user) {
        return (
            <div className="flex items-center gap-3">
                <Link
                    href="/login"
                    className="px-4 py-2 text-white hover:text-yellow-500 transition-colors font-medium"
                >
                    Sign In
                </Link>
                <Link
                    href="/signup"
                    className="px-6 py-2 bg-gradient-to-r from-yellow-400 to-yellow-600 text-[#020617] font-bold rounded-xl hover:shadow-[0_0_20px_rgba(234,179,8,0.3)] transition-all"
                >
                    Sign Up
                </Link>
            </div>
        )
    }

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all"
            >
                <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-[#020617]" />
                </div>
                <span className="text-white font-medium hidden sm:block">
                    {user.user_metadata?.full_name || user.email?.split('@')[0]}
                </span>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-[#0a0f1e] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
                    <div className="p-4 border-b border-white/10">
                        <p className="text-white font-medium truncate">{user.user_metadata?.full_name || 'User'}</p>
                        <p className="text-gray-400 text-sm truncate">{user.email}</p>
                    </div>

                    <div className="py-2">
                        <Link
                            href="/profile"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-3 px-4 py-2 text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                        >
                            <User className="w-4 h-4" />
                            My Profile
                        </Link>
                        <Link
                            href="/my-bookings"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-3 px-4 py-2 text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                        >
                            <Ticket className="w-4 h-4" />
                            My Bookings
                        </Link>
                    </div>

                    <div className="border-t border-white/10 py-2">
                        <button
                            onClick={() => {
                                setIsOpen(false)
                                signOut()
                            }}
                            className="flex items-center gap-3 px-4 py-2 text-red-400 hover:bg-red-500/10 transition-colors w-full"
                        >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
})

export default UserMenu;
