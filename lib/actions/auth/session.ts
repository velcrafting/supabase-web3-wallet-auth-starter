import { cookies } from "next/headers";
import { jwtVerify, JWTPayload } from "jose";

const SESSION_COOKIE_NAME = "session";
const JWT_SECRET = process.env.JWT_SECRET!;

export const getSession = async (): Promise<JWTPayload | null> => {
  const cookieStore = await cookies(); // ✅ await here
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(JWT_SECRET)
    );
    return payload;
  } catch (err) {
    console.warn("JWT verification failed:", err);
    return null;
  }
};

export const destroySession = async () => {
  const cookieStore = await cookies(); // ✅ await here
  cookieStore.delete(SESSION_COOKIE_NAME);
};