import { SessionProvider } from "@/lib/contexts";
import { getSession } from "@/lib/actions/auth/getSession";
import ClientRoot from "./_components/client-root";


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider sessionPromise={getSession()}>
      <ClientRoot>
        {children}
      </ClientRoot>
    </SessionProvider>
  );
}