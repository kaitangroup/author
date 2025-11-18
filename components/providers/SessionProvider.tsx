// "use client";
// import { SessionProvider } from "next-auth/react";
// import { ReactNode } from "react";

// export default function NextAuthSessionProvider({ children }: { children: ReactNode }) {
//   return <SessionProvider>{children}</SessionProvider>;
// }



// components/providers.tsx
'use client';

import { SessionProvider } from "next-auth/react";

type ProvidersProps = {
  children: React.ReactNode;
};

export default function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      {children}
    </SessionProvider>
  );
}
