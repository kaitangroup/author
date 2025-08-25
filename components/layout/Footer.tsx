import Link from 'next/link';
import { BookOpen } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div className="md:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <BookOpen className="h-6 w-6 text-blue-400" />
              <span className="text-lg font-bold">AuthorConnect</span>
            </div>
            <p className="text-gray-300 text-sm">
              Connecting students with qualified authors for personalized learning experiences.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">For Students</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/search" className="text-gray-300 hover:text-white">Find Author</Link></li>
              <li><Link href="/auth/user/register" className="text-gray-300 hover:text-white">Sign Up</Link></li>
              <li><Link href="/how-it-works" className="text-gray-300 hover:text-white">How it Works</Link></li>
              <li><Link href="/subjects" className="text-gray-300 hover:text-white">Subjects</Link></li>
            </ul>
          </div>

          {/* Tutor Links */}
          <div>
            <h3 className="font-semibold mb-4">For Authors</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/auth/author/register" className="text-gray-300 hover:text-white">Become a Author</Link></li>
              <li><Link href="/tutor-resources" className="text-gray-300 hover:text-white">Resources</Link></li>
              <li><Link href="/tutor-success" className="text-gray-300 hover:text-white">Success Stories</Link></li>
              <li><Link href="/tutor-support" className="text-gray-300 hover:text-white">Support</Link></li>
            </ul>
          </div>

          {/* Legal & Support */}
          <div>
            <h3 className="font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="text-gray-300 hover:text-white">About Us</Link></li>
              <li><Link href="/contact" className="text-gray-300 hover:text-white">Contact</Link></li>
              <li><Link href="/faq" className="text-gray-300 hover:text-white">FAQ</Link></li>
              <li><Link href="/privacy" className="text-gray-300 hover:text-white">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-gray-300 hover:text-white">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>&copy; 2025 AuthorConnect. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}