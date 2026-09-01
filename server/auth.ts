import { createHash, randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import type { Request, Response } from "express";
import type { ServerResponse } from "node:http";
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

type CookieResponse = Response | ServerResponse;

function requestCookie(req: Request) {
  const helperCookie = (req as Request & { cookies?: Record<string, string> }).cookies?.[COOKIE_NAME];
  if (helperCookie) return helperCookie;
  const header = req.headers.cookie;
  if (!header) return undefined;
  const pair = header.split(";").map(value => value.trim()).find(value => value.startsWith(`${COOKIE_NAME}=`));
  return pair ? decodeURIComponent(pair.slice(COOKIE_NAME.length + 1)) : undefined;
}

function serializeSessionCookie(value: string, maxAge: number) {
  const attributes = [`${COOKIE_NAME}=${encodeURIComponent(value)}`, `Max-Age=${Math.max(0, Math.floor(maxAge / 1000))}`, "Path=/", "HttpOnly", "SameSite=None"];
  if (process.env.NODE_ENV === "production") attributes.push("Secure");
  return attributes.join("; ");
}

function writeSessionCookie(req: Request, res: CookieResponse, value: string, maxAge: number) {
  const options = getSessionCookieOptions(req);
  const serialized = serializeSessionCookie(value, maxAge);
  if (typeof (res as Response).cookie === "function") {
    (res as Response).cookie(COOKIE_NAME, value, { ...options, maxAge });
  } else {
    res.setHeader("Set-Cookie", serialized);
  }
}

export async function getRequestUser(req: Request) {
  const token = requestCookie(req);
  if (!token) return null;
  return (await getUserBySessionHash(hashToken(token))) ?? null;
}

export function setSessionCookie(req: Request, res: CookieResponse, token: string) {
  writeSessionCookie(req, res, token, SESSION_DAYS * 86400000);
}

export async function clearSession(req: Request, res: CookieResponse) {
  const token = requestCookie(req);
  if (token) await deleteAuthSession(hashToken(token));
  const options = getSessionCookieOptions(req);
  if (typeof (res as Response).clearCookie === "function") {
    (res as Response).clearCookie(COOKIE_NAME, { ...options, maxAge: -1 });
  } else {
    res.setHeader("Set-Cookie", serializeSessionCookie("", 0));
  }
}
