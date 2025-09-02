'use client';

import React, { useEffect, useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter } from 'lucide-react';
import { useRouter } from 'next/navigation';

type WPUser = {
  id: number;
  name: string;
  slug: string;
  roles: string[];
  description?: string;
  avatar?: string;
  website?: string;
  degree?: string;
  hourly_rate?: string;
  subjects?: string[] | string;
  education?: string;
  experience?: string;
  availability?: string[];
  teaching_experience?: string;
  teaching_style?: string;
  date_of_birth?: string;
  university?: string;
  graduation_year?: string;
  languages?: string;
  tutoring_experience?: string;
  why_tutor?: string;
  references?: string;
  location_city_state?: string;
};

export default function SearchPage() {
  const router = useRouter();
  const [users, setUsers] = useState<WPUser[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [roleFilter, setRoleFilter] = useState<string>('');

  useEffect(() => {
    const abortCtrl = new AbortController();
    async function fetchUsers() {
      setLoading(true);
      setError(null);
      try {
        const base = (process.env.NEXT_PUBLIC_WP_URL ?? '').replace(/\/+$/, '');
        if (!base) throw new Error('NEXT_PUBLIC_WP_URL is not set');

        const url = `${base}/wp-json/authorpro/v1/users?per_page=100&role=author`;
        const res = await fetch(url, { signal: abortCtrl.signal });
        if (!res.ok) throw new Error(`Fetch error ${res.status}`);
        const json = await res.json();
        const data: WPUser[] = json.users ?? json;
        setUsers(data);
      } catch (err: any) {
        if (err.name === 'AbortError') return;
        setError(err.message || 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
    return () => abortCtrl.abort();
  }, [roleFilter]);

  const filtered = users.filter(u => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      (u.name && u.name.toLowerCase().includes(q)) ||
      (u.description && u.description.toLowerCase().includes(q)) ||
      (u.roles && u.roles.join(' ').toLowerCase().includes(q))
    );
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="py-8 px-4 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Find Your Authors</h1>

        {/* Search & Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              placeholder="Search by name, role, or bio..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="h-12">
              <Filter className="mr-2 h-5 w-5" /> Filters
            </Button>
            <Button onClick={() => { setSearchTerm(''); setRoleFilter(''); }} className="h-12">
              Reset
            </Button>
          </div>
        </div>
        <p className="text-gray-600 mb-4">{filtered.length} Authors found</p>
        {error && <p className="text-red-500">{error}</p>}

        <div className="flex gap-8">
          {/* Filters Sidebar */}
          {showFilters && (
            <div className="w-80">
              <div className="p-4 bg-white rounded-lg shadow-sm">
                <h3 className="font-semibold mb-2">Role filter</h3>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="w-full border rounded px-2 py-1"
                >
                  <option value="">All roles</option>
                  <option value="administrator">Administrator</option>
                  <option value="editor">Editor</option>
                  <option value="author">Author</option>
                  <option value="contributor">Contributor</option>
                  <option value="subscriber">Subscriber</option>
                </select>
                <p className="mt-4 text-sm text-gray-500">Tip: Filter by role to show only certain user types.</p>
              </div>
            </div>
          )}

          {/* Users Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="text-center py-12">Loading authors...</div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-xl text-gray-500">No authors found matching your criteria</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                




{filtered.map(u => (
  <div
    key={u.id}
    className="rounded-lg border bg-card text-card-foreground shadow-sm hover:shadow-lg transition-shadow"
  >
    <div className="p-6">
      {/* Top: Avatar + Name + Static Rating + Location + Availability */}
      <div className="flex items-start gap-4 mb-4">
        <span className="relative flex shrink-0 overflow-hidden rounded-full h-16 w-16">
          <img
            className="aspect-square h-full w-full object-cover"
            alt={u.name}
            src={u.avatar || "/default-avatar.png"}
          />
        </span>
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-1">{u.name}</h3>

          {/* Static Rating */}
          <div className="flex items-center gap-1 mb-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-star h-4 w-4 fill-yellow-400 text-yellow-400"
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
            <span className="text-sm font-medium">4.8</span>
            <span className="text-sm text-gray-500">(89 reviews)</span>
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-600">
            {u.location_city_state && (
              <div className="flex items-center gap-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-map-pin h-3 w-3"
                >
                  <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                <span>{u.location_city_state}</span>
              </div>
            )}
            {u.availability && (
              <div className="flex items-center gap-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-clock h-3 w-3"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                <span>{Array.isArray(u.availability) ? u.availability.join(", ") : u.availability}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      {u.description && (
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">{u.description}</p>
      )}

      {/* Subjects */}
      {u.subjects && (
        <div className="flex flex-wrap gap-2 mb-4">
          {Array.isArray(u.subjects)
            ? u.subjects.slice(0, 3).map((subj, idx) => (
                <div
                  key={idx}
                  className="inline-flex items-center rounded-full border px-2.5 py-0.5 font-semibold text-xs bg-secondary text-secondary-foreground hover:bg-secondary/80"
                >
                  {subj}
                </div>
              ))
            : (
              <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 font-semibold text-xs bg-secondary text-secondary-foreground hover:bg-secondary/80">
                {u.subjects}
              </div>
            )}
          {Array.isArray(u.subjects) && u.subjects.length > 3 && (
            <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 font-semibold text-xs text-foreground">
              +{u.subjects.length - 3} more
            </div>
          )}
        </div>
      )}

      {/* Footer: Rate + Buttons */}
      <div className="flex items-center justify-between">
        <div className="text-lg font-bold text-blue-600">
          {u.hourly_rate ? `$${u.hourly_rate}/hr` : "Contact for rate"}
        </div>
        <div className="flex gap-2">
          <button className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 rounded-md px-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-message-circle h-4 w-4 mr-1"
            >
              <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"></path>
            </svg>
            Message
          </button>
<button
 onClick={() => router.push(`/mtutor/${u.id}`)}
  className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-primary-foreground h-9 rounded-md px-3 bg-blue-600 hover:bg-blue-700"
>
  View Profile
</button>
        </div>
      </div>
    </div>
  </div>
))}









              </div>
            )}
          </div>

          
        </div>
      </div>
      <Footer />
    </div>
  );
}
