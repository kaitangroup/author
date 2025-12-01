'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { HelpCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import * as React from 'react';

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

const subjects = [
  'Romance', 'Science Fiction & Fantasy', 'Mystery, Thriller & Suspense', 'Self-help', 'History',
  'Childrens Books', 'Literature & Fiction', 'Biographies & Memoirs',
  'Arts & Photography', 'Computers & Technology', 'Crafts, Hobbies & Home', 'Education & Teaching',
  'Engineering & Transportation', 'Health, Humor & Entertainment', 'Medical Books',
  'Politics & Social Sciences', 'Religion & Spirituality', 'Science & Math',
  'Sports & Outdoors', 'Test Preparation', 'Travel',
  'Editors Picks', 'Teacher Picks', 'Elementary', 'Middle School', 'High School', 'College'
];

interface SearchFiltersProps {
  filters: {
    subjects: string[];
    priceRange: number[];
    rating: number;
    availability: string;
    ageRange?: number[]; // [min, max]
    credentials?: {
      backgroundCheck: boolean;
      ixlCertified: boolean;
      licensedTeacher: boolean;
    };
    instantBook?: boolean;
    inPerson?: boolean;
  };
  onFiltersChange: (filters: any) => void;
}

export function SearchFilters({ filters, onFiltersChange }: SearchFiltersProps) {
  const updateFilters = (key: string, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const toggleSubject = (subject: string) => {
    const currentSubjects = filters.subjects;
    const updated = currentSubjects.includes(subject)
      ? currentSubjects.filter((s) => s !== subject)
      : [...currentSubjects, subject];
    updateFilters('subjects', updated);
  };

  const updateCredential = (
    key: keyof NonNullable<SearchFiltersProps['filters']['credentials']>,
    checked: boolean | 'indeterminate'
  ) => {
    const next = {
      backgroundCheck: filters.credentials?.backgroundCheck ?? false,
      ixlCertified: filters.credentials?.ixlCertified ?? false,
      licensedTeacher: filters.credentials?.licensedTeacher ?? false,
      [key]: !!checked,
    };
    updateFilters('credentials', next);
  };

  const resetFilters = () => {
    onFiltersChange({
      subjects: [],
      priceRange: [0, 100],
      rating: 0,
      availability: 'any',
      ageRange: [18, 80],
      credentials: {
        backgroundCheck: false,
        ixlCertified: false,
        licensedTeacher: false,
      },
      instantBook: false,
      inPerson: false,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Filters</span>
          <Button variant="ghost" size="sm" onClick={resetFilters}>
            Reset
          </Button>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        <TooltipProvider>

          {/* Price Range */}
        <div>
          <Label className="text-sm tracking-wider font-bold mb-3 block">
            Hourly Rate: ${filters.priceRange[0]} - ${filters.priceRange[1]}
          </Label>
          <Slider
            value={filters.priceRange}
            onValueChange={(value: number[]) => updateFilters('priceRange', value)}
            max={100}
            min={0}
            step={5}
            className="w-full"
          />
        </div>

        {/* Subjects */}
        <div>
          <Label className="text-sm tracking-wider font-bold mb-3 block">Subjects</Label>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {subjects.map((subject) => (
              <div key={subject} className="flex items-center space-x-2">
                <Checkbox
                  id={subject}
                  checked={filters.subjects.includes(subject)}
                  onCheckedChange={() => toggleSubject(subject)}
                />
                <Label htmlFor={subject} className="text-sm">
                  {subject}
                </Label>
              </div>
            ))}
          </div>
        </div>

        
          {/* Booking & Modality */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Checkbox
                id="instant-book"
                checked={!!filters.instantBook}
                onCheckedChange={(v) => updateFilters('instantBook', !!v)}
              />
              <Label htmlFor="instant-book" className="text-sm flex items-center tracking-wider font-bold gap-1">
                Instant Book
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 opacity-70 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    Book a session immediately without messaging back and forth.
                  </TooltipContent>
                </Tooltip>
              </Label>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="in-person"
                checked={!!filters.inPerson}
                onCheckedChange={(v) => updateFilters('inPerson', !!v)}
              />
              <Label htmlFor="in-person" className="text-sm flex items-center tracking-wider font-bold gap-1">
                Available in-person
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 opacity-70 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    Tutor can meet at a physical location instead of online only.
                  </TooltipContent>
                </Tooltip>
              </Label>
            </div>
          </div>

          {/* Credentials */}
          {/* <div>
            <Label className="text-sm tracking-wider font-bold mb-3 block">Credentials</Label>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="cred-bg-check"
                  checked={filters.credentials?.backgroundCheck ?? false}
                  onCheckedChange={(v) => updateCredential('backgroundCheck', v)}
                />
                <Label htmlFor="cred-bg-check" className="text-sm flex items-center gap-1">
                  Background check on file
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 opacity-70 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      Verification that the tutor has a background check on record.
                    </TooltipContent>
                  </Tooltip>
                </Label>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="cred-ixl"
                  checked={filters.credentials?.ixlCertified ?? false}
                  onCheckedChange={(v) => updateCredential('ixlCertified', v)}
                />
                <Label htmlFor="cred-ixl" className="text-sm flex items-center gap-1">
                  IXL certified
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 opacity-70 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      Indicates the tutor holds IXL program certification.
                    </TooltipContent>
                  </Tooltip>
                </Label>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="cred-licensed"
                  checked={filters.credentials?.licensedTeacher ?? false}
                  onCheckedChange={(v) => updateCredential('licensedTeacher', v)}
                />
                <Label htmlFor="cred-licensed" className="text-sm flex items-center gap-1">
                  Licensed teacher
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 opacity-70 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      Tutor holds an active teaching license.
                    </TooltipContent>
                  </Tooltip>
                </Label>
              </div>
            </div>
          </div> */}
        </TooltipProvider>

        

        

        {/* Minimum Rating */}
        <div>
          <Label className="text-sm tracking-wider font-bold mb-3 block">Minimum Rating</Label>
          <Select
            value={filters.rating.toString()}
            onValueChange={(value) => updateFilters('rating', parseInt(value))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Any rating" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">Any rating</SelectItem>
              <SelectItem value="3">3+ stars</SelectItem>
              <SelectItem value="4">4+ stars</SelectItem>
              <SelectItem value="5">5 stars</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Availability */}
        <div>
          <Label className="text-sm tracking-wider font-bold mb-3 block">Availability</Label>
          <Select
            value={filters.availability}
            onValueChange={(value) => updateFilters('availability', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Any time" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any time</SelectItem>
              <SelectItem value="morning">Morning</SelectItem>
              <SelectItem value="afternoon">Afternoon</SelectItem>
              <SelectItem value="evening">Evening</SelectItem>
              <SelectItem value="weekend">Weekend</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tutor Age Range */}
        {/* <div>
          <Label className="text-sm tracking-wider font-bold mb-3 block">
            Tutor age:{' '}
            {((filters as any).ageRange ?? [18, 80])[1] >= 80
              ? `${((filters as any).ageRange ?? [18, 80])[0]} and up`
              : `${((filters as any).ageRange ?? [18, 80])[0]} - ${((filters as any).ageRange ?? [18, 80])[1]}`}
          </Label>

          <Slider
            value={((filters as any).ageRange ?? [18, 80]) as number[]}
            onValueChange={(value: number[]) => updateFilters('ageRange', value)}
            min={18}
            max={80}
            step={1}
            className=""
          />
        </div> */}
      </CardContent>
    </Card>
  );
}
