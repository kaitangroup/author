'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { TutorCard } from '@/components/tutors/TutorCard';
import { SearchFilters } from '@/components/search/SearchFilters';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Filter } from 'lucide-react';

type Filters = {
  subjects: string[];
  priceRange: [number, number];
  rating: number;
  availability: string;
};

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
  rating?: number;
  review_count?: number;
};

type Tutor = {
  id: string;
  name: string;
  avatar: string;
  bio: string;
  subjects: string[];
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
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [filters, setFilters] = useState<Filters>({
    subjects: [],
    priceRange: [0, 100],
    rating: 0,
    availability: '',
  });

  useEffect(() => {
    const abortCtrl = new AbortController();
    async function fetchUsers() {
      setLoading(true);

      try {
        const base = (process.env.NEXT_PUBLIC_WP_URL ?? '').replace(/\/+$/, '');
        if (!base) throw new Error('NEXT_PUBLIC_WP_URL is not set');

        const url = `${base}/wp-json/authorpro/v1/users?per_page=100&role=author`;
        const res = await fetch(url, { signal: abortCtrl.signal });
        if (!res.ok) throw new Error(`Fetch error ${res.status}`);
        const json = await res.json();
        const data: WPUser[] = json.users ?? json;

        // map WPUser → Tutor
        const mappedTutors: Tutor[] = data.map((u) => ({
          id: String(u.id),
          name: u.name,
          avatar: u.avatar ?? '/default-avatar.png',
          bio: u.description ?? '',
          subjects: Array.isArray(u.subjects)
            ? u.subjects
            : u.subjects
            ? [u.subjects]
            : [],
          hourlyRate: u.hourly_rate ? parseFloat(u.hourly_rate) : 0,
          rating: u.rating ?? 0,
          reviewCount: u.review_count ?? 0,
          location: u.location_city_state ?? '',
          responseTime: 'N/A',
            availability: Array.isArray(u.availability)
    ? u.availability.join(', ')
    : u.availability
    ? String(u.availability)
    : '',
          education: u.education ?? '',
          experience: u.experience ?? '',
          languages: u.languages
            ? u.languages.split(',').map((l) => l.trim())
            : [],
          reviews: [], // if API returns reviews, map here
        }));

        setTutors(mappedTutors);
      } catch (err: any) {
        if (err.name === 'AbortError') return;
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
    // return () => abortCtrl.abort();
  }, []);

  // apply filters + search
  const filteredTutors = tutors.filter((tutor) => {
    // search by name or subjects
    if (searchTerm) {
      const matchesName = tutor.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesSubjects = tutor.subjects.some((s) =>
        s.toLowerCase().includes(searchTerm.toLowerCase())
      );
      if (!matchesName && !matchesSubjects) return false;
    }

    // filter by selected subjects
    if (filters.subjects.length > 0) {
      const hasSubject = tutor.subjects.some((s) =>
        filters.subjects.includes(s)
      );
      if (!hasSubject) return false;
    }

    // filter by price range
    if (
      tutor.hourlyRate < filters.priceRange[0] ||
      tutor.hourlyRate > filters.priceRange[1]
    ) {
      return false;
    }

    // filter by rating
    if (filters.rating > 0 && tutor.rating < filters.rating) {
      return false;
    }

    return true;
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Find Your Perfect Author
            </h1>

            {/* Search Bar */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  placeholder="Search by subject or tutor name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
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

            {/* Results Count */}
            <p className="text-gray-600">
              {loading
                ? 'Loading...'
                : `${filteredTutors.length} Authors found`}
            </p>
          </div>

          <div className="flex gap-8">
            {/* Filters Sidebar */}
            {showFilters && (
              <div className="w-80">
                <SearchFilters filters={filters} onFiltersChange={setFilters} />
              </div>
            )}

            {/* Tutors Grid */}
            <div className="flex-1">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTutors.map((tutor) => (
                  <TutorCard key={tutor.id} tutor={tutor} />
                ))}
              </div>

              {!loading && filteredTutors.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-xl text-gray-500">
                    No authors found matching your criteria
                  </p>
                  <p className="text-gray-400 mt-2">
                    Try adjusting your search or filters
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
