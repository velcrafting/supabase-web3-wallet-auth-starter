import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { sessionCookieName } from "@/lib/constants";
import { getSession as baseGetSession } from "./getSession";

export const getSession = baseGetSession;

export function destroySession(response?: NextResponse) {
  if (response) {
    response.cookies.delete(sessionCookieName);
    response.cookies.delete(`${sessionCookieName}-refresh-token`);
  } else {
    const cookieStore = cookies();
    cookieStore.delete(sessionCookieName);
    cookieStore.delete(`${sessionCookieName}-refresh-token`);
  }
}
