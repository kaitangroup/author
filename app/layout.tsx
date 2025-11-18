import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Providers from "@/components/providers";
import InitialOverlay from '@/components/InitialOverlay'; 
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AuthorConnect - Find Your Perfect Author",
  description:
    "Connect with qualified authors for personalized learning. Browse subjects, book lessons, and achieve your academic goals.",
  keywords: "author, authoring, education, learning, online authoring, academic support",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.className} bg-gray-50 text-gray-900`}
        suppressHydrationWarning
      >
        <Providers>
        <InitialOverlay minMs={400} oncePerTab={true} />
          {children}
          <Toaster />
          </Providers>
      </body>
    </html>
  );
}
