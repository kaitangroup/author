'use client';

import { useEffect, useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { BookingModal } from '@/components/booking/BookingModal';
import {
  Star, MapPin, Clock, MessageCircle, Calendar,
  GraduationCap, Globe, Award
} from 'lucide-react';
import { useParams } from 'next/navigation';

type WPUser = {
  id: number;
  name: string;
  slug?: string;
  description?: string;
  avatar?: string;
  website?: string;
  degree?: string;
  hourly_rate?: string | number;
  subjects?: string[] | string;            // <-- union type
  education?: string;
  experience?: string;
  availability?: string[] | string;        // <-- union type
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

export default function TutorProfilePage() {
  const params = useParams<{ id: string }>();
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [author, setAuthor] = useState<WPUser | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const abortCtrl = new AbortController();

    async function fetchUser() {
      setLoading(true);
      try {
        const base = (process.env.NEXT_PUBLIC_WP_URL ?? '').replace(/\/+$/, '');
        if (!base) throw new Error('NEXT_PUBLIC_WP_URL is not set');

        const url = `${base}/wp-json/custom/v1/author?id=${params.id}`;
        const res = await fetch(url, { signal: abortCtrl.signal, mode: 'cors' });
        if (!res.ok) throw new Error(`Fetch error: ${res.status}`);

        const json = await res.json();
        const data: WPUser = json.data ?? json;
        setAuthor(data);
      } catch (err) {
        console.error(err);
        setAuthor(null);
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
    return () => abortCtrl.abort();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading profile...
      </div>
    );
  }

  if (!author) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="py-16 px-4 text-center">
          <h1 className="text-2xl font-bold">Author not found</h1>
        </div>
        <Footer />
      </div>
    );
  }

  // --- Safe parsing ---
  const subjectsArr: string[] = Array.isArray(author.subjects)
    ? author.subjects
    : (author.subjects ? author.subjects.split(',') : []);
  const availabilityText =
    Array.isArray(author.availability)
      ? author.availability.join(', ')
      : (author.availability ?? 'Available');

  const hourly =
    typeof author.hourly_rate === 'number'
      ? author.hourly_rate
      : (author.hourly_rate ? Number(author.hourly_rate) : undefined);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Profile Header */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start gap-6">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={author.avatar} alt={author.name} />
                      <AvatarFallback className="text-lg">
                        {author.name?.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1">
                      <h1 className="text-3xl font-bold mb-2">{author.name}</h1>

                      <div className="flex items-center gap-4 mb-4">
                        {/* Static Rating */}
                        <div className="flex items-center gap-1">
                          <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">4.8</span>
                          <span className="text-gray-500">(89 reviews)</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-600">
                          <MapPin className="h-4 w-4" />
                          <span>{author.location_city_state}</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-600">
                          <Clock className="h-4 w-4" />
                          <span>Responds in 1 hour</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {subjectsArr.map((subject) => (
                          <Badge key={subject.trim()} variant="secondary">
                            {subject.trim()}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex items-center gap-2 text-green-600">
                        <div className="h-2 w-2 bg-green-600 rounded-full"></div>
                        <span className="font-medium">{availabilityText}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* About */}
              <Card>
                <CardHeader>
                  <CardTitle>About Me</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 leading-relaxed">{author.description}</p>
                </CardContent>
              </Card>

              {/* Experience & Education */}
              <Card>
                <CardHeader>
                  <CardTitle>Experience & Education</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <GraduationCap className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Education</p>
                      <p className="text-gray-600">{author.education}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Award className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Teaching Experience</p>
                      <p className="text-gray-600">{author.teaching_experience}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Globe className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Languages</p>
                      <p className="text-gray-600">{author.languages}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Reviews */}
              <Card>
                <CardHeader>
                  <CardTitle>Reviews (89)</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500">No reviews yet</p>
                </CardContent>
              </Card>
            </div>

            {/* Booking Sidebar */}
            <div className="space-y-6">
              <Card className="sticky top-24">
                <CardContent className="p-6">
                  <div className="text-center mb-6">
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      {hourly ? `$${hourly}/hr` : 'Contact for rate'}
                    </div>
                    <p className="text-gray-600">Starting rate</p>
                  </div>

                  <div className="space-y-3">
                    <Button
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      onClick={() => setShowBookingModal(true)}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      Book a Lesson
                    </Button>

                    <Button variant="outline" className="w-full">
                      <MessageCircle className="mr-2 h-4 w-4" />
                      Send Message
                    </Button>
                  </div>

                  <Separator className="my-6" />

                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Response time:</span>
                      <span className="font-medium">1 hour</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Lessons taught:</span>
                      <span className="font-medium">500+</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Repeat students:</span>
                      <span className="font-medium">85%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <BookingModal
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        tutor={author}
      />

      <Footer />
    </div>
  );
}
