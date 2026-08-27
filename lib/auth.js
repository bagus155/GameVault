// lib/auth.js
// ─────────────────────────────────────────────
// JWT Auth Utilities (Server-only)
// ─────────────────────────────────────────────
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET;
const COOKIE_NAME = 'gamevault_token';

/**
 * Sign a JWT token for a given user payload.
 * @param {{ id: number, username: string, email: string }} payload
 */
export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

/**
 * Verify and decode a JWT token string.
 * Returns null if invalid or expired.
 * @param {string} token
 */
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

/**
 * Get the currently authenticated user from the request cookie.
 * Returns null if not authenticated.
 * @param {Request} [request] - Optional: pass Request for Route Handlers
 */
export function getAuthUser(request) {
  let token;

  if (request) {
    // Route Handler context: read from request cookie header (synchronous)
    const cookieHeader = request.headers.get('cookie') || '';
    const match = cookieHeader.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
    token = match ? match[1] : null;
  } else {
    // Server Component context: use next/headers (Next.js 15: cookies() is async)
    // For Server Components, call getAuthUserFromCookies() instead
    throw new Error('Use getAuthUserFromCookies() in Server Components (Next.js 15).');
  }

  if (!token) return null;
  return verifyToken(token);
}

/**
 * Async version for Server Components (Next.js 15).
 * cookies() is async in Next.js 15+.
 */
export async function getAuthUserFromCookies() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value ?? null;
  if (!token) return null;
  return verifyToken(token);
}

/**
 * Create a Set-Cookie header value for the auth token.
 * @param {string} token
 */
export function createAuthCookie(token) {
  return `${COOKIE_NAME}=${token}; HttpOnly; Path=/; Max-Age=${7 * 24 * 60 * 60}; SameSite=Strict`;
}

/**
 * Create a Set-Cookie header value that clears the auth token.
 */
export function clearAuthCookie() {
  return `${COOKIE_NAME}=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict`;
}

export { COOKIE_NAME };
