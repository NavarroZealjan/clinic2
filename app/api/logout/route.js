// app/api/logout/route.js
import { NextResponse } from 'next/server';
import { clearTokenCookie } from '@/lib/auth';

export async function POST() {
  const res = NextResponse.json({ message: 'Logged out' });
  clearTokenCookie(res);
  return res;
}
