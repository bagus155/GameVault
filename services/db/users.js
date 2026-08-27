// services/db/users.js
// ─────────────────────────────────────────────
// User CRUD operations (Database Layer)
// ─────────────────────────────────────────────
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

/**
 * Find a user by email.
 * @param {string} email
 */
export async function findUserByEmail(email) {
  return prisma.user.findUnique({ where: { email } });
}

/**
 * Find a user by username.
 * @param {string} username
 */
export async function findUserByUsername(username) {
  return prisma.user.findUnique({ where: { username } });
}

/**
 * Create a new user. Password is hashed before storing.
 * @param {{ username: string, email: string, password: string }} data
 */
export async function createUser({ username, email, password }) {
  const hashedPassword = await bcrypt.hash(password, 12);
  return prisma.user.create({
    data: { username, email, password: hashedPassword },
    select: { id: true, username: true, email: true, createdAt: true },
  });
}

/**
 * Verify a plain password against a stored hash.
 * @param {string} plain
 * @param {string} hash
 */
export async function verifyPassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}
