import { createHash, randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import type { Request, Response } from "express";
import { COOKIE_NAME } from "../shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { createAuthSession, deleteAuthSession, getUserByEmail, getUserBySessionHash } from "./db";

const scrypt = promisify(scryptCallback);
const SESSION_DAYS = 30;

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derived = (await scrypt(password, salt, 64)) as Buffer;
  return `scrypt:${salt}:${derived.toString("hex")}`;
}

export async function verifyPassword(password: string, encoded: string) {
  const [, salt, expectedHex] = encoded.split(":");
  if (!salt || !expectedHex) return false;
  const actual = (await scrypt(password, salt, 64)) as Buffer;
  const expected = Buffer.from(expectedHex, "hex");
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

function hashToken(token: string) { return createHash("sha256").update(token).digest("hex"); }

export async function signInWithPassword(email: string, password: string) {
  const user = await getUserByEmail(email);
  if (!user?.passwordHash || !(await verifyPassword(password, user.passwordHash))) return null;
  const token = randomBytes(32).toString("base64url");
  await createAuthSession(user.id, hashToken(token), new Date(Date.now() + SESSION_DAYS * 86400000));
  return { user, token };
}

export async function getRequestUser(req: Request) {
  const token = req.cookies?.[COOKIE_NAME] as string | undefined;
  if (!token) return null;
  return (await getUserBySessionHash(hashToken(token))) ?? null;
}

export function setSessionCookie(req: Request, res: Response, token: string) {
  res.cookie(COOKIE_NAME, token, { ...getSessionCookieOptions(req), maxAge: SESSION_DAYS * 86400000 });
}

export async function clearSession(req: Request, res: Response) {
  const token = req.cookies?.[COOKIE_NAME] as string | undefined;
  if (token) await deleteAuthSession(hashToken(token));
  res.clearCookie(COOKIE_NAME, { ...getSessionCookieOptions(req), maxAge: -1 });
}
