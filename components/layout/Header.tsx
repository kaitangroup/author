'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { BookOpen, Menu, User, MessageCircle, Calendar } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useSession, signOut } from 'next-auth/react';

export function Header() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [profileEditLink, setProfileEditLink] = useState('profile/edit');
  const [userType, setUserType] = useState<'student' | 'author'>('student');
  const [wpUser, setWpUser] = useState<string | null>(null);

  useEffect(() => {
    if (session?.wpToken) {
      localStorage.setItem('wpToken', session.wpToken);
      localStorage.setItem('wpUser', session.user?.name || '');
    }

    const token = localStorage.getItem('wpToken');
    const user = localStorage.getItem('wpUser');
    const profiledata = localStorage.getItem('wpUserdata');

    setWpUser(user);

    if (profiledata) {
      try {
        const profile = JSON.parse(profiledata);
        if (profile.role === 'author') {
          setUserType('author');
          setProfileEditLink('apply');
        } else {
          setUserType('student');
          setProfileEditLink('profile/edit');
        }
      } catch (e) {
        console.error('Invalid wpUserdata JSON', e);
      }
    }

    setIsLoggedIn(!!(token || session));
  }, [session, status]);

  const handleLogout = async () => {
    localStorage.removeItem('wpToken');
    localStorage.removeItem('wpUser');
    localStorage.removeItem('wpUserdata');

    await signOut({ callbackUrl: '/auth/user/login' });

    setIsLoggedIn(false);
    toast.success('You have been logged out successfully');
    router.push('/auth/user/login');
  };

  return (
    <header className="bg-white border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <BookOpen className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">AuthorConnect</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/search"
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              Find Authors
            </Link>
            <Link
              href="/about"
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              About
            </Link>
            <Link
              href="/blogs"
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              Blogs
            </Link>
            <Link
              href="/contact"
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              Contact
            </Link>
          </nav>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Desktop Auth / User menu */}
            {!isLoggedIn ? (
              // 👉 only desktop
              <div className="hidden md:flex items-center space-x-4">
                <Link href="/auth/user/login">
                  <Button variant="ghost">Login</Button>
                </Link>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button className="bg-blue-600 hover:bg-blue-700">Sign Up</Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href="/auth/user/register">Find an Author</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/auth/author/register">Become an Author</Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  {/* Mobile e শুধু icon, md+ e icon + name */}
                  <Button variant="ghost" size="sm">
                    <User className="h-4 w-4 mr-0 md:mr-2" />
                    <span className="hidden md:inline-block">
                      {session?.user?.name || wpUser || 'Account'}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={`/dashboard/${userType}`}>
                      <User className="h-4 w-4 mr-2" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/${profileEditLink}`}>
                      <User className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/books">
                      <BookOpen className="h-4 w-4 mr-2" />
                      Manage Books
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/messages">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Messages
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/bookings">
                      <Calendar className="h-4 w-4 mr-2" />
                      Bookings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-red-600 focus:text-red-600"
                  >
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Mobile Menu (nav + auth) */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden">
                  <Menu className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {/* Auth options for mobile */}
                {!isLoggedIn ? (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href="/auth/user/login">Login</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/auth/user/register">Sign Up as Student</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/auth/author/register">Sign Up as Author</Link>
                    </DropdownMenuItem>
                    <div className="border-t my-1" />
                  </>
                ) : (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/${userType}`}>Dashboard</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/${profileEditLink}`}>Edit Profile</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/messages">Messages</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/bookings">Bookings</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="text-red-600 focus:text-red-600"
                    >
                      Logout
                    </DropdownMenuItem>
                    <div className="border-t my-1" />
                  </>
                )}

                {/* Common nav links */}
                <DropdownMenuItem asChild>
                  <Link href="/search">Find Authors</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/about">About</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/blogs">Blogs</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/contact">Contact</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
