// app/api/admin/create-doctor/route.js
import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { requireRoleApi } from '@/lib/middleware';

export async function POST(request) {
  // check role
  const check = requireRoleApi(request, ['admin']);
  if (check.status === 401) return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
  if (check.status === 403) return NextResponse.json({ message: 'Access denied' }, { status: 403 });

  try {
    const body = await request.json();
    const { username, password, full_name, role } = body;
    if (!username || !password) return NextResponse.json({ message: 'Missing fields' }, { status: 400 });

    const hashed = await bcrypt.hash(password, 10);
    const result = await pool.query('INSERT INTO users (username, password, full_name, role) VALUES ($1,$2,$3,$4) RETURNING id, username, role, full_name', [username, hashed, full_name || null, role || 'doctor']);

    return NextResponse.json({ user: result.rows[0] }, { status: 201 });
  } catch (err) {
    console.error(err);
    if (err.code === '23505') return NextResponse.json({ message: 'Username exists' }, { status: 409 });
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
