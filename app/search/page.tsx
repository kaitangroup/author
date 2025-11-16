'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { SearchFilters } from '@/components/search/SearchFilters';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Filter } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { TutorCard } from '@/components/tutors/TutorCard';
import { useDebounce } from 'react-use';
import { toast } from 'sonner';

type Filters = {
  subjects: string[];
  priceRange: [number, number];
  ageRange: [number, number];
  rating: number;
  credentials: {
    backgroundCheck: false;
    ixlCertified: false;
    licensedTeacher: false;
  };
  availability: string;
  instantBook: boolean;
  inPerson: boolean;
};

type WPUser = {
  id: number;
  name: string;
  slug: string;
  roles: string[];
  description?: string;
  avatar?: string;
  hourly_rate?: string;
  subjects?: string[] | string;
  books?: string[] | string;
  education?: string;
  experience?: string;
  availability?: string[] | string;
  teaching_experience?: string;
  languages?: string;
  location?: string;
  rating?: number;
  responseTime?: string;
  reviewCount?: number;
};

type Tutor = {
  id: string;
  name: string;
  avatar: string;
  bio: string;
  subjects: string[];
  books?: string[] | string;
  hourlyRate: number;
  rating: number;
  reviewCount: number;
  location: string;
  responseTime: string;
  availability: string;
  education: string;
  experience: string;
  languages: string[];
  reviews: { reviewer: string; comment: string; rating: number }[];
};

export default function SearchPage() {
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(false);
  const [debounceSearchTerm, setDebounceSearchTerm] = useState('');
  const [filters, setFilters] = useState<Filters>({
    subjects: [],
    priceRange: [0, 100],
    ageRange: [18, 80],
    rating: 0,
    availability: '',
    credentials: {
      backgroundCheck: false,
      ixlCertified: false,
      licensedTeacher: false,
    },
    instantBook: false,
    inPerson: false,
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [userEmail, setUserEmail] = useState('');
  const [savingSearch, setSavingSearch] = useState(false);
  const [searchTypes, setSearchTypes] = useState<string[]>([]);
  const [emailError, setEmailError] = useState('');

  useEffect(() => {
    const q = searchParams.get('q') ?? '';
    setSearchTerm(q);
  }, [searchParams]);

  const decodeHTML = (str: string) => {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = str;
    return textarea.value;
  };

  useDebounce(() => setDebounceSearchTerm(searchTerm), 500, [searchTerm]);

  useEffect(() => {
    const abortCtrl = new AbortController();

    async function fetchUsers() {
      setLoading(true);
      try {
        const base = (process.env.NEXT_PUBLIC_WP_URL ?? '').replace(/\/+$/, '');
        let url = `${base}/wp-json/authorpro/v1/users?per_page=6&page=${page}&role=author`;

        const params = new URLSearchParams();
        if (searchTerm) params.append('search', debounceSearchTerm);
        if (filters.subjects.length > 0) {
          filters.subjects.forEach((s) => params.append('subject[]', s));
        }
        params.append('min_rate', String(filters.priceRange[0]));
        params.append('max_rate', String(filters.priceRange[1]));
        params.append('min_age', String(filters.ageRange[0]));
        params.append('max_age', String(filters.ageRange[1]));
        if (filters.rating > 0) params.append('rating', String(filters.rating));
        if (filters.credentials.backgroundCheck) {
          params.append('background_check', '1');
        }
        if (filters.credentials.ixlCertified) {
          params.append('ixl_certified', '1');
        }
        if (filters.credentials.licensedTeacher) {
          params.append('licensed_teacher', '1');
        }
        if (filters.instantBook) params.append('instant_book', '1');
        if (filters.inPerson) params.append('in_person', '1');
        if (filters.availability && filters.availability !== 'any') {
          params.append('availability', filters.availability);
        }

        url += `&${params.toString()}`;
        const res = await fetch(url, { signal: abortCtrl.signal });
        if (!res.ok) throw new Error(`Fetch error ${res.status}`);
        const json = await res.json();
        const data: WPUser[] = json.users ?? json;
        setTotalPages(json.total_pages ?? 1);

        const mapped: Tutor[] = data.map((u) => ({
          id: String(u.id),
          name: u.name,
          avatar: u.avatar ?? '/default-avatar.png',
          bio: u.description ?? '',
          subjects: Array.isArray(u.subjects)
            ? u.subjects.map((s) => decodeHTML(s))
            : u.subjects
            ? [decodeHTML(u.subjects)]
            : [],
          hourlyRate: u.hourly_rate ? parseFloat(u.hourly_rate) : 0,
          rating: u.rating ?? 0,
          reviewCount: u.reviewCount ?? 0,
          location: u.location ?? '',
          books: u.books ?? [],
          responseTime: u.responseTime ?? '',
          availability: Array.isArray(u.availability)
            ? u.availability.join(', ')
            : (u.availability as string) ?? '',
          education: u.education ?? '',
          experience: u.experience ?? '',
          languages: u.languages
            ? u.languages.split(',').map((l) => l.trim())
            : [],
          reviews: [],
        }));

        setTutors(mapped);
      } catch (err: any) {
        if (err.name !== 'AbortError') console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
    return () => abortCtrl.abort();
  }, [debounceSearchTerm, filters, page]);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Heading + Search */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Find Your Perfect Author
            </h1>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  placeholder="Search by Subject, Book or Author name..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setPage(1);
                  }}
                  className="pl-10 h-12"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="h-12"
              >
                <Filter className="mr-2 h-5 w-5" />
                Filters
              </Button>
            </div>

            <p className="text-gray-600">
              {loading
                ? 'Loading...'
                : `${tutors.length} Authors found (Page ${page} of ${totalPages})`}
            </p>
          </div>

          {/* Layout: sidebar + grid */}
          <div className="flex gap-8 items-start">
            {showFilters && (
              <div className="w-80 flex-shrink-0">
                <SearchFilters
                  filters={filters}
                  onFiltersChange={(nf) => {
                    setFilters(nf);
                    setPage(1);
                  }}
                />
              </div>
            )}

            <div className="flex-1 min-w-0">
              <div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                style={{ gridAutoRows: '1fr' }}
              >
                {tutors.map((t) => (
                  <TutorCard key={t.id} tutor={t} />
                ))}
              </div>

              {/* No results + Save search */}
              {!loading && tutors.length === 0 && (
                <div className="text-center py-12 space-y-4">
                  <p className="text-xl text-gray-500">
                    No results found for “{searchTerm}”
                  </p>
                  <p className="text-gray-400">
                    Try adjusting your search or filters
                  </p>

                  {searchTerm && (
                    <div className="mt-6 max-w-sm mx-auto bg-gray-50 border rounded-lg p-5 shadow-sm">
                      <p className="text-gray-700 mb-3 font-semibold">
                        Save this search for later
                      </p>

                      {/* Auto-filled name field */}
                      <input
                        type="text"
                        placeholder="Search name"
                        value={searchTerm}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-3 bg-gray-100 text-gray-700"
                      />

                      {/* Email field with inline error */}
                      <div className="text-left mb-3">
                        <input
                          type="email"
                          placeholder="Your email address"
                          onChange={(e) => {
                            setUserEmail(e.target.value);
                            setEmailError('');
                          }}
                          value={userEmail}
                          className={`w-full px-3 py-2 rounded-lg border ${
                            emailError
                              ? 'border-red-500 focus:ring-red-500 text-red-600'
                              : 'border-gray-300 focus:ring-blue-500'
                          }`}
                        />

                        {/* Error text (left aligned) */}
                        {emailError && (
                          <p className="text-red-500 text-sm mt-1 text-left">
                            {emailError}
                          </p>
                        )}
                      </div>


                      {/* Search type checkboxes */}
                      <div className="text-left mb-4 mt-3">
                        <p className="text-gray-700 mb-2 font-medium">
                          Search Type (optional)
                        </p>
                        <div className="flex flex-col gap-2">
                          {(['author', 'book', 'subject'] as const).map(
                            (type) => (
                              <label
                                key={type}
                                className="flex items-center gap-2 text-gray-700"
                              >
                                <input
                                  type="checkbox"
                                  checked={searchTypes.includes(type)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSearchTypes([...searchTypes, type]);
                                    } else {
                                      setSearchTypes(
                                        searchTypes.filter((t) => t !== type)
                                      );
                                    }
                                  }}
                                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="capitalize">{type}</span>
                              </label>
                            )
                          )}
                        </div>
                      </div>

                      {/* Save button */}
                      <Button
                        onClick={async () => {
                          if (!userEmail) {
                            setEmailError('Email is required');
                            return;
                          }

                          setEmailError('');
                          setSavingSearch(true);

                          try {
                            const base = (
                              process.env.NEXT_PUBLIC_WP_URL ?? ''
                            ).replace(/\/+$/, '');
                            const res = await fetch(
                              `${base}/wp-json/authorpro/v1/save-search`,
                              {
                                method: 'POST',
                                headers: {
                                  'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                  name: searchTerm,
                                  term: searchTerm,
                                  types: searchTypes,
                                  email: userEmail,
                                }),
                              }
                            );

                            if (!res.ok)
                              throw new Error('Failed to save search');

                            toast.success(
                              'Search saved ✅ We’ll notify you when we find matching authors.'
                            );

                            setUserEmail('');
                            setSearchTypes([]);
                          } catch (e) {
                            toast.error(
                              'Could not save your search. Please try again.'
                            );
                          } finally {
                            setSavingSearch(false);
                          }
                        }}
                        disabled={savingSearch}
                        className="w-full"
                      >
                        {savingSearch ? 'Saving...' : 'Save Search'}
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* Pagination */}
              <div className="flex justify-center items-center gap-4 mt-8">
                <Button
                  variant="outline"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                <span className="text-gray-700">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
