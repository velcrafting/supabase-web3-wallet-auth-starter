// lib/auth/update-session.tsx
'use client';

import { useSession } from '@/lib/hooks';
import type { Session } from '@/lib/auth'; // or '@/lib/auth/session-context'

export function useUpdateSession() {
  const { setData, setStatus } = useSession();
  return (next: Session | null) => {
    setData(next);
    setStatus(next ? 'authenticated' : 'unauthenticated');
  };
}
