import { cookies } from "next/headers";
import { jwtVerify, type JWTPayload } from "jose";

const SESSION_COOKIE_NAME = "session";
const JWT_SECRET = process.env.JWT_SECRET!;

export async function getSession(): Promise<JWTPayload | null> {
  const cookieStore = cookies(); // ✅ DO NOT await
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET));
    return payload;
  } catch {
    return null;
  }
}