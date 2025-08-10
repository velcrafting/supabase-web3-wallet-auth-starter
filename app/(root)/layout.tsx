
import { SessionProvider } from '@/lib/auth/session-context';
import { getSession } from '@/lib/actions/auth/getSession';
import ClientRoot from '@/components/layout/client-root';

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession(); // Session | null

  return (
    <SessionProvider initialSession={session}>
      <ClientRoot>{children}</ClientRoot>
    </SessionProvider>
  );
}
