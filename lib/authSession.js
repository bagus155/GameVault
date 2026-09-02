import { cookies } from 'next/headers';
import { verifyToken, COOKIE_NAME } from './auth';

/**
 * Mendapatkan user yang terautentikasi dari cookies (Server-side only).
 * Cocok digunakan di Route Handlers (App Router) untuk mencegah ID Spoofing.
 * 
 * @returns {Promise<Object|null>} User payload jika valid, null jika tidak.
 */
export async function getAuthSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value ?? null;
  
  if (!token) return null;
  return verifyToken(token);
}
