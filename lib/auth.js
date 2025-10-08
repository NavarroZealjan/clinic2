// lib/auth.js
import jwt from 'jsonwebtoken';
import cookie from 'cookie';

export function signToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
  });
}

export function verifyToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

export function setTokenCookie(res, token) {
  const serialized = cookie.serialize('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60, // 1 hour
  });
  // NextResponse-like object supports headers
  if (res.headers) {
    res.headers.append('Set-Cookie', serialized);
  } else {
    res.setHeader('Set-Cookie', serialized);
  }
}

export function clearTokenCookie(res) {
  const serialized = cookie.serialize('token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: new Date(0),
  });
  if (res.headers) {
    res.headers.append('Set-Cookie', serialized);
  } else {
    res.setHeader('Set-Cookie', serialized);
  }
}
