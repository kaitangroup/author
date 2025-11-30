import { BookTable } from '@/components/BookTable';
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { RoleGuard } from '@/components/auth/RoleGuard';

export default function Home() {
  return (
    <RoleGuard allowed={['author']} redirectTo="/">
    <main className="min-h-screen bg-white">
      <Header />
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <BookTable />
      </div>
    </div>
    <Footer />
    </main>
    </RoleGuard>
  );
}
