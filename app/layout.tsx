import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Providers from "@/components/providers";
import InitialOverlay from '@/components/InitialOverlay'; 

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TutorConnect - Find Your Perfect Tutor",
  description:
    "Connect with qualified tutors for personalized learning. Browse subjects, book lessons, and achieve your academic goals.",
  keywords: "tutor, tutoring, education, learning, online tutoring, academic support",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50 text-gray-900`}>
        <Providers>
        <InitialOverlay minMs={400} oncePerTab={true} />
          {children}
          </Providers>
      </body>
    </html>
  );
}
