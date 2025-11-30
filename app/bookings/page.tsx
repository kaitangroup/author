'use client';

import { useEffect, useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, MessageCircle, Video, Star } from 'lucide-react';
import { toast } from 'sonner';
import { AuthorDashboard } from '@/lib/types';
import { RoleGuard } from '@/components/auth/RoleGuard';

const apiUrl = process.env.NEXT_PUBLIC_WP_URL;

export default function BookingsPage() {
  const [wpToken, setWpToken] = useState<string | null>(null);
  const [authorDashboard, setAuthorDashboard] = useState<AuthorDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Grab token once
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('wpToken');
    setWpToken(token);
  }, []);

  // Fetch bookings from same endpoint as student dashboard
  useEffect(() => {
    const fetchBookings = async () => {
      if (!apiUrl) return;
      try {
        setLoading(true);
        setError(null);

        const token = wpToken ?? localStorage.getItem('wpToken');
        if (!token) {
          setError('Missing auth token');
          setLoading(false);
          return;
        }

        const res = await fetch(`${apiUrl}wp-json/custom/v1/dashboard-student`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          cache: 'no-store',
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data?.message || 'Failed to load bookings');
        }

        const data: AuthorDashboard = await res.json();
        setAuthorDashboard(data);
      } catch (err: any) {
        console.error('Bookings fetch error', err);
        setError(err.message || 'Failed to load bookings');
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [wpToken]);

  const allBookings: any[] = Array.isArray(authorDashboard?.bookings)
    ? (authorDashboard!.bookings as any[])
    : [];

  // Map statuses from Bookly → tabs
  const upcomingBookings = allBookings.filter((b) => b.status === 'approved');
  const pendingBookings  = allBookings.filter((b) => b.status === 'pending');
  const pastBookings     = allBookings.filter(
    (b) => b.status !== 'approved' && b.status !== 'pending'
  );

  const handleJoinLesson = (booking: any) => {
    if (booking.video_link) {
      // You could also router.push here, but toast for now
      window.location.href = booking.video_link;
    } else {
      toast.info('No join link available for this booking yet.');
    }
  };

  const handleCancelBooking = (bookingId: string | number) => {
    // Later: call WP REST to cancel
    toast.success('Booking cancelled successfully (frontend only placeholder)');
  };

  const handleReschedule = (bookingId: string | number) => {
    toast.info('Reschedule functionality would open here');
  };

  const BookingCard = ({
    booking,
    showActions = true,
  }: {
    booking: any;
    showActions?: boolean;
  }) => (
    <Card className="mb-4">
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start gap-4">
          <Avatar className="h-14 w-14 sm:h-16 sm:w-16 self-center sm:self-auto">
            <AvatarImage src={booking.avatar} />
            <AvatarFallback>
              {booking.name ? booking.name[0] : 'U'}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 w-full text-center">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
              <div>
                <h3 className="text-base sm:text-lg font-semibold">
                  {booking.subject || booking.service}
                </h3>
                <p className="text-gray-600 text-sm sm:text-base">
                  with {booking.name}
                </p>
              </div>
              <Badge
                className="self-center sm:self-start mt-2 sm:mt-0 capitalize"
                variant={
                  booking.status === 'approved'
                    ? 'default'
                    : booking.status === 'pending'
                    ? 'secondary'
                    : 'outline'
                }
              >
                {booking.status}
              </Badge>
            </div>

            {/* Date / time / price */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3 text-xs sm:text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{booking.date}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>
                  {booking.time}
                  {booking.duration && ` (${booking.duration} min)`}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="font-medium">
                  {typeof booking.price !== 'undefined'
                    ? `$${booking.price}`
                    : ''}
                </span>
              </div>
            </div>

            {/* Actions */}
            {showActions && (
              <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
                {booking.status === 'approved' && (
                  <>
                    <Button
                      size="sm"
                      className="w-full sm:w-auto"
                      onClick={() => handleJoinLesson(booking)}
                    >
                      <Video className="h-4 w-4 mr-2" />
                      Join Lesson
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full sm:w-auto"
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Message
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full sm:w-auto"
                      onClick={() => handleReschedule(booking.appointment_id)}
                    >
                      Reschedule
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full sm:w-auto"
                      onClick={() => handleCancelBooking(booking.appointment_id)}
                    >
                      Cancel
                    </Button>
                  </>
                )}

                {booking.status === 'pending' && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full sm:w-auto"
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Message Tutor
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full sm:w-auto"
                      onClick={() => handleCancelBooking(booking.appointment_id)}
                    >
                      Cancel Request
                    </Button>
                  </>
                )}

                {booking.status !== 'approved' &&
                  booking.status !== 'pending' && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full sm:w-auto"
                      >
                        <Star className="h-4 w-4 mr-2" />
                        Rate Lesson
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full sm:w-auto"
                      >
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
              <p className="text-gray-600">
                Manage your tutoring sessions and appointments.
              </p>
            </div>

            {loading ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <p className="text-gray-500">Loading your bookings...</p>
                </CardContent>
              </Card>
            ) : error ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <p className="text-red-500">{error}</p>
                </CardContent>
              </Card>
            ) : (
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
                    upcomingBookings.map((booking) => (
                      <BookingCard
                        key={booking.appointment_id}
                        booking={booking}
                      />
                    ))
                  ) : (
                    <Card>
                      <CardContent className="p-12 text-center">
                        <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          No upcoming bookings
                        </h3>
                        <p className="text-gray-500 mb-4">
                          You don&apos;t have any approved lessons scheduled.
                        </p>
                        <Button>Find a Tutor</Button>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="pending" className="mt-6">
                  {pendingBookings.length > 0 ? (
                    pendingBookings.map((booking) => (
                      <BookingCard
                        key={booking.appointment_id}
                        booking={booking}
                      />
                    ))
                  ) : (
                    <Card>
                      <CardContent className="p-12 text-center">
                        <Clock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          No pending requests
                        </h3>
                        <p className="text-gray-500">
                          All your booking requests have been processed.
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="past" className="mt-6">
                  {pastBookings.length > 0 ? (
                    pastBookings.map((booking) => (
                      <BookingCard
                        key={booking.appointment_id}
                        booking={booking}
                      />
                    ))
                  ) : (
                    <Card>
                      <CardContent className="p-12 text-center">
                        <Star className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          No past bookings
                        </h3>
                        <p className="text-gray-500">
                          Your completed lessons will appear here.
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
              </Tabs>
            )}
          </div>
        </div>

        <Footer />
      </div>
 
  );
}




