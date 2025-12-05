import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { password } = await request.json();

        // Simple password check (as requested)
        // In production, use environment variables and proper hashing
        if (password === '12345') {
            const response = NextResponse.json({ success: true });

            // Set cookie (not httpOnly to allow client-side navigation)
            // sameSite: strict provides CSRF protection
            response.cookies.set('admin_auth', 'true', {
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 86400, // 24 hours
                path: '/'
            });

            return response;
        }

        return NextResponse.json(
            { success: false, error: 'Invalid password' },
            { status: 401 }
        );
    } catch (error) {
        return NextResponse.json(
            { success: false, error: 'Server error' },
            { status: 500 }
        );
    }
}
