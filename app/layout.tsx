import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from '@/components/ui/sonner';
import NextAuthSessionProvider from "@/components/providers/SessionProvider";
import LoadingProvider from '@/components/LoadingOverlay/LoadingProvider';




const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'TutorConnect - Find Your Perfect Tutor',
  description: 'Connect with qualified tutors for personalized learning. Browse subjects, book lessons, and achieve your academic goals.',
  keywords: 'tutor, tutoring, education, learning, online tutoring, academic support',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50 text-gray-900`}>

        <LoadingProvider minMs={2000}> 
          <NextAuthSessionProvider>
            {children}
            <Toaster />
          </NextAuthSessionProvider>
        </LoadingProvider>
      </body>
    </html>
  );
}
