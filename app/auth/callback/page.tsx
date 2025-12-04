'use client'

// OAuth Callback Handler
// This page handles the OAuth redirect from Google/GitHub
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AuthCallbackPage() {
    const router = useRouter()

    useEffect(() => {
        // Redirect to home after successful OAuth
        router.push('/')
    }, [router])

    return (
        <div className="min-h-screen bg-[#020617] flex items-center justify-center">
            <div className="text-white text-xl">Completing sign in...</div>
        </div>
    )
}
