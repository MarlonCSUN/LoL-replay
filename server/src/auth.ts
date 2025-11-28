import bcrypt from 'bcryptjs';
import { prisma } from './db.js';
import crypto from 'node:crypto';
import type { Request, Response, NextFunction } from 'express';

const SESSION_TTL_HOURS = 168; // 7 days

export async function hashPassword(pw: string) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(pw, salt);
}

export async function verifyPassword(pw: string, hash: string) {
  return bcrypt.compare(pw, hash);
}

export function newSessionToken() {
  return crypto.randomUUID(); // good randomness; unique token
}

export async function createSession(userId: string) {
  const token = newSessionToken();
  const expiresAt = new Date(Date.now() + SESSION_TTL_HOURS * 3600_000);
  const session = await prisma.session.create({ data: { userId, token, expiresAt } });
  return session;
}

export async function getUserBySessionToken(token?: string | null) {
  if (!token) return null;
  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  });
  if (!session) return null;
  if (session.expiresAt < new Date()) {
    await prisma.session.delete({ where: { token } });
    return null;
  }
  return session.user;
}

// Express middleware: attaches req.user if cookie present
export async function attachUser(req: Request, _res: Response, next: NextFunction) {
  // cookie-parser populates req.cookies
  const token = (req as any).cookies?.sid as string | undefined;
  (req as any).user = await getUserBySessionToken(token);
  next();
}
