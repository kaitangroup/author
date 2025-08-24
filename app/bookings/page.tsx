'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar, Clock, MapPin, MessageCircle, 
  Video, Phone, MoreVertical, Star
} from 'lucide-react';
import { mockBookings } from '@/lib/mockData';
import { toast } from 'sonner';

export default function BookingsPage() {
  const [bookings] = useState(mockBookings);

  const upcomingBookings = bookings.filter(booking => booking.status === 'confirmed');
  const pendingBookings = bookings.filter(booking => booking.status === 'pending');
  const pastBookings = bookings.filter(booking => booking.status === 'completed');

  const handleJoinLesson = (bookingId: string) => {
    toast.info('Joining lesson...');
  };

  const handleCancelBooking = (bookingId: string) => {
    toast.success('Booking cancelled successfully');
  };

  const handleReschedule = (bookingId: string) => {
    toast.info('Reschedule functionality would open here');
  };

  const BookingCard = ({ booking, showActions = true }: { booking: any, showActions?: boolean }) => (
    <Card className="mb-4">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={booking.tutorAvatar} />
            <AvatarFallback>{booking.tutorName[0]}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold">{booking.subject} Lesson</h3>
                <p className="text-gray-600">with {booking.tutorName}</p>
              </div>
              <Badge 
                variant={
                  booking.status === 'confirmed' ? 'default' : 
                  booking.status === 'pending' ? 'secondary' : 
                  'outline'
                }
              >
                {booking.status}
              </Badge>
            </div>
            
            <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{booking.date}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{booking.time} ({booking.duration} min)</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="font-medium">${booking.amount}</span>
              </div>
            </div>

            {showActions && (
              <div className="flex items-center gap-2 mt-4">
                {booking.status === 'confirmed' && (
                  <>
                    <Button size="sm" onClick={() => handleJoinLesson(booking.id)}>
                      <Video className="h-4 w-4 mr-2" />
                      Join Lesson
                    </Button>
                    <Button size="sm" variant="outline">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Message
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleReschedule(booking.id)}
                    >
                      Reschedule
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleCancelBooking(booking.id)}
                    >
                      Cancel
                    </Button>
                  </>
                )}
                
                {booking.status === 'pending' && (
                  <>
                    <Button size="sm" variant="outline">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Message Tutor
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleCancelBooking(booking.id)}
                    >
                      Cancel Request
                    </Button>
                  </>
                )}

                {booking.status === 'completed' && (
                  <>
                    <Button size="sm" variant="outline">
                      <Star className="h-4 w-4 mr-2" />
                      Rate Lesson
                    </Button>
                    <Button size="sm" variant="outline">
                      Book Again
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">My Bookings</h1>
            <p className="text-gray-600">Manage your tutoring sessions and appointments.</p>
          </div>

          <Tabs defaultValue="upcoming" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="upcoming">
                Upcoming ({upcomingBookings.length})
              </TabsTrigger>
              <TabsTrigger value="pending">
                Pending ({pendingBookings.length})
              </TabsTrigger>
              <TabsTrigger value="past">
                Past ({pastBookings.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming" className="mt-6">
              {upcomingBookings.length > 0 ? (
                <div>
                  {upcomingBookings.map((booking) => (
                    <BookingCard key={booking.id} booking={booking} />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No upcoming bookings</h3>
                    <p className="text-gray-500 mb-4">You don't have any confirmed lessons scheduled.</p>
                    <Button>Find a Tutor</Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="pending" className="mt-6">
              {pendingBookings.length > 0 ? (
                <div>
                  {pendingBookings.map((booking) => (
                    <BookingCard key={booking.id} booking={booking} />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Clock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No pending requests</h3>
                    <p className="text-gray-500">All your booking requests have been processed.</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="past" className="mt-6">
              {pastBookings.length > 0 ? (
                <div>
                  {pastBookings.map((booking) => (
                    <BookingCard key={booking.id} booking={booking} />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Star className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No past bookings</h3>
                    <p className="text-gray-500">Your completed lessons will appear here.</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}