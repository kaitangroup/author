// app/providers.tsx
"use client";

import { Toaster } from "@/components/ui/sonner";
import NextAuthSessionProvider from "@/components/providers/SessionProvider";
import LoadingProvider from "@/components/LoadingOverlay/LoadingProvider";

// export default function Providers({ children }: { children: React.ReactNode }) {
//   return (
//     <LoadingProvider minMs={2000}>
//       <NextAuthSessionProvider>
//         {children}
//         <Toaster />
//       </NextAuthSessionProvider>
//     </LoadingProvider>
//   );
// }

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
  
      <NextAuthSessionProvider>
        {children}
        <Toaster />
      </NextAuthSessionProvider>

  );
}
