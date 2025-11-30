'use client';

import { useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

type Role = 'author' | 'subscriber';

interface RoleGuardProps {
  allowed: Role[];         // which roles can see this page
  children: ReactNode;
  redirectTo?: string;     // where to send unauthorized users
}

export function RoleGuard({ allowed, children, redirectTo = '/' }: RoleGuardProps) {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    try {
      const profiledata = localStorage.getItem('wpUserdata');

      // ❌ Not logged in at all
      if (!profiledata) {
        router.replace('/auth/user/login');
        return;
      }

      const profile = JSON.parse(profiledata);
      const role: Role | undefined = profile?.role;

      // ❌ Role not allowed → redirect
      if (!role || !allowed.includes(role)) {
        router.replace(redirectTo);
        return;
      }

      // ✅ Ok, can show page
      setChecked(true);
    } catch (e) {
      console.error('RoleGuard: invalid wpUserdata', e);
      router.replace('/auth/user/login');
    }
  }, [allowed, redirectTo, router]);

  if (!checked) return null; // or a loader/spinner

  return <>{children}</>;
}
