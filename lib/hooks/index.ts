// lib/hooks/index.ts
'use client';
import { useActionState, useContext } from 'react';
import { SessionContext } from '@/lib/auth/session-context';

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

type ActionResult<R> = { data?: R | null; error?: string | null };

export function useFormActionState<T, U>(
  action: (input: T) => Promise<ActionResult<U>>,
  onSuccess?: () => void
) {
  const [state, formAction, isPending] = useActionState(
    async (_cur: any, formData: FormData) => {
      let res = await action(Object.fromEntries(formData) as T);
      if (res === undefined) res = { data: null, error: null };
      if (!res.error) onSuccess?.();
      return res;
    },
    { data: null, error: null }
  );
  return [state, formAction, isPending] as const;
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used within a SessionProvider');
  return ctx;
}
