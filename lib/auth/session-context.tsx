// lib/auth/session-context.tsx
'use client';

import { createContext, useEffect, useState, type Dispatch, type SetStateAction } from 'react';

export type Session =
  | { user: { id: string; username: string; walletAddress: string; chainId: string } }
  | null;

export type AuthStatus = 'authenticated' | 'unauthenticated' | 'loading';

type SessionContextType = {
  data: Session;
  status: AuthStatus;
  setData: Dispatch<SetStateAction<Session>>;
  setStatus: Dispatch<SetStateAction<AuthStatus>>;
};

export const SessionContext = createContext<SessionContextType | null>(null);

export function SessionProvider({
  children,
  initialSession,
}: {
  children: React.ReactNode;
  initialSession?: Session;
}) {
  const [data, setData] = useState<Session>(initialSession ?? null);
  const [status, setStatus] = useState<AuthStatus>('loading');

  useEffect(() => {
    if (initialSession !== undefined) setData(initialSession);
  }, [initialSession]);

  useEffect(() => {
    setStatus(data ? 'authenticated' : 'unauthenticated');
  }, [data]);

  return (
    <SessionContext.Provider value={{ data, status, setData, setStatus }}>
      {children}
    </SessionContext.Provider>
  );
}
