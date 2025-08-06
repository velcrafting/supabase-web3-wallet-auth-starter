import { cookies } from "next/headers";

import { sessionCookieName } from "@/lib/constants";
import { getSession as baseGetSession } from "./getSession";

export const getSession = baseGetSession;

export const destroySession = async () => {
  const cookieStore = await cookies();
  cookieStore.delete(sessionCookieName);
  cookieStore.delete(`${sessionCookieName}-refresh-token`);
};