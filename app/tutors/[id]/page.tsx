'use client';

import { useState } from 'react';
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
import { mockTutors } from '@/lib/mockData';
import { useParams } from 'next/navigation';

export default function TutorProfilePage() {
  const params = useParams();
  const [showBookingModal, setShowBookingModal] = useState(false);
  
  // Find tutor by ID (in real app, this would be an API call)
  const tutor = mockTutors.find(t => t.id === params.id);

  if (!tutor) {
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
                      <AvatarImage src={tutor.avatar} alt={tutor.name} />
                      <AvatarFallback className="text-lg">
                        {tutor.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <h1 className="text-3xl font-bold mb-2">{tutor.name}</h1>
                      
                      <div className="flex items-center gap-4 mb-4">
                        <div className="flex items-center gap-1">
                          <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">{tutor.rating}</span>
                          <span className="text-gray-500">({tutor.reviewCount} reviews)</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-600">
                          <MapPin className="h-4 w-4" />
                          <span>{tutor.location}</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-600">
                          <Clock className="h-4 w-4" />
                          <span>Responds in {tutor.responseTime}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {tutor.subjects.map((subject) => (
                          <Badge key={subject} variant="secondary">
                            {subject}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex items-center gap-2 text-green-600">
                        <div className="h-2 w-2 bg-green-600 rounded-full"></div>
                        <span className="font-medium">{tutor.availability}</span>
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
                  <p className="text-gray-600 leading-relaxed">{tutor.bio}</p>
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
                      <p className="text-gray-600">{tutor.education}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Award className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Teaching Experience</p>
                      <p className="text-gray-600">{tutor.experience}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Globe className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Languages</p>
                      <p className="text-gray-600">{tutor.languages.join(', ')}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Reviews */}
              <Card>
                <CardHeader>
                  <CardTitle>Reviews ({tutor.reviewCount})</CardTitle>
                </CardHeader>
                <CardContent>
                  {tutor.reviews && tutor.reviews.length > 0 ? (
                    <div className="space-y-4">
                      {tutor.reviews.map((review) => (
                        <div key={review.id} className="border-b last:border-b-0 pb-4 last:pb-0">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < review.rating 
                                      ? 'fill-yellow-400 text-yellow-400' 
                                      : 'text-gray-300'
                                  }`}
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
                      ${tutor.hourlyRate}/hr
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
                      <span className="font-medium">{tutor.responseTime}</span>
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
        tutor={tutor}
      />
      
      <Footer />
    </div>
  );
}

