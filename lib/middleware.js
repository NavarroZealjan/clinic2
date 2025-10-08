// lib/middleware.js (helpers for App Router API routes)
import cookie from 'cookie';
import { verifyToken } from './auth';

export function getTokenFromReq(request) {
  const raw = request.headers.get('cookie') || '';
  const cookies = cookie.parse(raw || '');
  return cookies.token;
}

export function requireAuthApi(request) {
  const token = getTokenFromReq(request);
  if (!token) return null;
  try {
    return verifyToken(token);
  } catch (err) {
    return null;
  }
}

export function requireRoleApi(request, allowedRoles = []) {
  const user = requireAuthApi(request);
  if (!user) return { status: 401 };
  if (!allowedRoles.includes(user.role)) return { status: 403 };
  return { status: 200, user };
}
