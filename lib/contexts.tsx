'use client';

import { createContext, use, useEffect, useState } from "react";
import type { JWTPayload } from "jose";

export type Session = JWTPayload | null | undefined;
export type AuthStatus = "authenticated" | "unauthenticated" | "loading";

type SessionContextType = {
  data: Session;
  status: AuthStatus;
  setData: React.Dispatch<React.SetStateAction<Session>>;
  setStatus: React.Dispatch<React.SetStateAction<AuthStatus>>;
};

export const SessionContext = createContext<SessionContextType | null>(null);

export const SessionProvider = ({
  children,
  sessionPromise,
}: {
  children: React.ReactNode;
  sessionPromise: Promise<Session>;
}) => {
  const sessionData = use(sessionPromise);
  const [session, setSession] = useState<Session>(sessionData);
  const [status, setStatus] = useState<AuthStatus>("loading");

  useEffect(() => {
    setSession(sessionData);
  }, [sessionData]);

  useEffect(() => {
    if (session === undefined) {
      setStatus("loading");
    } else {
      setStatus(session ? "authenticated" : "unauthenticated");
    }
  }, [session]);

  return (
    <SessionContext.Provider
      value={{
        data: session,
        status,
        setData: setSession,
        setStatus,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};