// app/api/me/route.js
import { NextResponse } from 'next/server';
import cookie from 'cookie';
import { verifyToken } from '@/lib/auth';

export async function GET(request) {
  try {
    const raw = request.headers.get('cookie') || '';
    const cookies = cookie.parse(raw || '');
    const token = cookies.token;
    if (!token) return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });

    const decoded = verifyToken(token);
    return NextResponse.json({ user: decoded });
  } catch (err) {
    return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
  }
}
