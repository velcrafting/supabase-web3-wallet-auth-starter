import { useActionState, useContext } from "react";
import { SessionContext } from "@/lib/contexts";

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

type ActionResult<R> = {
  data?: R | null;
  error?: string | null;
};

export function useFormActionState<T, U>(
  action: (input: T) => Promise<ActionResult<U>>,
  onSuccess?: () => void
) {
  const [state, formAction, isPending] = useActionState(
    async (currentState: any, formData: FormData) => {
      let res = await action(Object.fromEntries(formData) as T);

      if (res === undefined) {
        res = { data: null, error: null };
      }

      if (!res.error) {
        onSuccess?.();
      }

      return res;
    },
    { data: null, error: null }
  );

  return [state, formAction, isPending] as const;
}

export function useSession(): {
  data: any;
  setData: (data: any) => void;
  status: AuthStatus;
  setStatus: React.Dispatch<React.SetStateAction<AuthStatus>>;
} {
  const context = useContext(SessionContext);

  if (context === null) {
    throw new Error("useSession must be used within a SessionProvider");
  }

  return context;
}