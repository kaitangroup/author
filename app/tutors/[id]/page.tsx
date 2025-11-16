'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';   // ← added useRouter
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { BookingModal } from '@/components/booking/BookingModal';
import { Star, MapPin, Clock, MessageCircle, Calendar, GraduationCap, Globe, Award, Link } from 'lucide-react';
import { mockTutors } from '@/lib/mockData';
import { useSession } from "next-auth/react";
import { WPUser } from '@/lib/types';



export default function TutorProfilePage() {
  const params = useParams();
  const router = useRouter();                     // ← init router
  const { data: session, status } = useSession();
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [author, setAuthor] = useState<WPUser>();
  const [loading, setLoading] = useState<boolean>(true);
  
  const tutor = mockTutors.find(t => t.id == '1');

  useEffect(() => {
    const abortCtrl = new AbortController();
    async function fetchUsers() {
      setLoading(true);     
      try {
        const base = (process.env.NEXT_PUBLIC_WP_URL ?? '').replace(/\/+$/, '');
        if (!base) throw new Error('NEXT_PUBLIC_WP_URL is not set');
        const url = `${base}/wp-json/custom/v1/author?id=${params.id}`;
        const res = await fetch(url, { signal: abortCtrl.signal, mode: 'cors' });
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Fetch error ${res.status}: ${text}`);
        }
        const json = await res.json();
        const data: WPUser = json.data ?? json;
        setAuthor(data);
      } catch (_) {
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
    return () => abortCtrl.abort();
  }, [params.id]);



  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-6xl mx-auto py-12 px-4 space-y-4">
          {/* simple skeletons */}
          <div className="animate-pulse grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-40 bg-muted rounded-2xl" />
              <div className="h-56 bg-muted rounded-2xl" />
              <div className="h-56 bg-muted rounded-2xl" />
              <div className="h-56 bg-muted rounded-2xl" />
            </div>
            <div className="space-y-6">
              <div className="h-64 bg-muted rounded-2xl sticky top-24" />
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!author && !tutor) {
    
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
                      <AvatarImage src={author?.avatar} alt={author?.name} />
                      <AvatarFallback className="text-lg">
                        {author?.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <h1 className="text-3xl font-bold mb-2">{author?.name}</h1>
                      
                      <div className="flex items-center gap-4 mb-4">
                        <div className="flex items-center gap-1">
                          <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">{tutor?.rating}</span>
                          <span className="text-gray-500">({tutor?.reviewCount} reviews)</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-600">
                          <MapPin className="h-4 w-4" />
                          <span>{author?.location}</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-600">
                          <Clock className="h-4 w-4" />
                          <span>Responds in {tutor?.responseTime}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {author?.subjects?.map((subject) => (
                          <Badge key={subject.trim()} variant="secondary">
                            {subject.trim()}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex items-center gap-2 text-green-600">
                        <div className="h-2 w-2 bg-green-600 rounded-full"></div>
                        <span className="font-medium">{tutor?.availability}</span>
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
                  <p className="text-gray-600 leading-relaxed">{author?.bio}</p>
                </CardContent>
              </Card>

              {/* My Books */}
              {Array.isArray((author as any)?.books) && (author as any).books.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>My Books</CardTitle>
                    <Link href="/books" className="text-blue-600 text-sm font-medium hover:underline">
        Manage All Books →
      </Link>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm text-left">
                        <thead>
                          <tr className="text-gray-500 border-b">
                            <th className="py-3 px-4 font-medium">Book</th>
                            <th className="py-3 px-4 font-medium">Link</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(author as any).books.slice(0, 4).map((book: any) => (
                            <tr
                              key={book.id}
                              className="border-b last:border-b-0 hover:bg-muted/60 transition-colors"
                            >
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-3">
                                  {book.featured_image && (
                                    <img
                                      src={book.featured_image}
                                      alt={book.title}
                                      className="h-12 w-12 rounded-md object-cover border"
                                    />
                                  )}
                                  <span className="font-medium">{book.title}</span>
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                {book.book_url ? (
                                  <a
                                    href={book.book_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline font-medium"
                                  >
                                    View Book →
                                  </a>
                                ) : (
                                  <span className="text-gray-400">No link available</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}

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
                      <p className="text-gray-600">{author?.education}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Award className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Teaching Experience</p>
                      <p className="text-gray-600">{author?.teaching_experience}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Globe className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Languages</p>
                      <p className="text-gray-600">{author?.languages}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Reviews */}
              <Card>
                <CardHeader>
                  <CardTitle>Reviews ({tutor?.reviewCount})</CardTitle>
                </CardHeader>
                <CardContent>
                  {tutor?.reviews && tutor?.reviews.length > 0 ? (
                    <div className="space-y-4">
                      {tutor?.reviews.map((review) => (
                        <div key={review.id} className="border-b last:border-b-0 pb-4 last:pb-0">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                                />
                              ))}
                            </div>
                            <span className="font-medium">{review.studentName}</span>
                            <span className="text-gray-500 text-sm">{review.date}</span>
                          </div>
                          <p className="text-gray-600">{review.comment}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No reviews yet</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Booking Sidebar */}
            <div className="space-y-6">
              <Card className="sticky top-24">
                <CardContent className="p-6">
                  <div className="text-center mb-6">
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      ${author?.hourly_rate}/hr
                    </div>
                    <p className="text-gray-600">Starting rate</p>
                  </div>

                  <div className="space-y-3">
                   <Button 
  className="w-full bg-blue-600 hover:bg-blue-700"
  onClick={() => {
    if (status === "loading") return;

    const wpToken = typeof window !== "undefined" 
      ? localStorage.getItem("wpToken") 
      : null;
    const isLoggedIn = !!(wpToken || session);

    if (!isLoggedIn) {
      router.push(`/auth/user/login?redirect=/tutors/${author?.id}`);
    } else {
      setShowBookingModal(true);
    }
  }}
>
  <Calendar className="mr-2 h-4 w-4" />
  Book a Lesson
</Button>

                    
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => router.push(`/messages?to=${author?.id}`)}   // ← GO TO MESSAGES WITH to=<id>
                    >
                      <MessageCircle className="mr-2 h-4 w-4" />
                      Send Message
                    </Button>
                  </div>

                  <Separator className="my-6" />

                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Response time:</span>
                      <span className="font-medium">{tutor?.responseTime}</span>
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
        tutor={author!}
      />
      
      <Footer />
    </div>
  );
}
