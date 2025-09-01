'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { TutorCard } from '@/components/tutors/TutorCard';
import { SearchFilters } from '@/components/search/SearchFilters';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Filter } from 'lucide-react';
import { mockTutors } from '@/lib/mockData';
type Filters = {
  subjects: string[];
  priceRange: [number, number];
  rating: number;
  availability: string;
};

export default function SearchPage() {
  const [tutors, setTutors] = useState(mockTutors);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    subjects: [],
    priceRange: [0, 100],
    rating: 0,
    availability: '',
  });

  useEffect(() => {
    // Filter tutors based on search and filters
    let filtered = mockTutors;

    if (searchTerm) {
      filtered = filtered.filter(tutor =>
        tutor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tutor.subjects.some(subject => 
          subject.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    if (filters.subjects.length > 0) {
      filtered = filtered.filter(tutor =>
        tutor.subjects.some(subject => filters.subjects.includes(subject))
      );
    }

    filtered = filtered.filter(tutor =>
      tutor.hourlyRate >= filters.priceRange[0] && 
      tutor.hourlyRate <= filters.priceRange[1]
    );

    if (filters.rating > 0) {
      filtered = filtered.filter(tutor => tutor.rating >= filters.rating);
    }

    setTutors(filtered);
  }, [searchTerm, filters]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Find Your Perfect Author</h1>
            
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
              {tutors.length} Authors found
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
                {tutors.map((tutor) => (
                  <TutorCard key={tutor.id} tutor={tutor} />
                ))}
              </div>

              {tutors.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-xl text-gray-500">No authors found matching your criteria</p>
                  <p className="text-gray-400 mt-2">Try adjusting your search or filters</p>
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