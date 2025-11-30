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
import { useSession } from 'next-auth/react';
import { WPUser } from '@/lib/types';

// 👉 তোমার WordPress base URL
// .env এ NEXT_PUBLIC_WP_API_BASE থাকলে ওটা use হবে
const WP_API_BASE =
  process.env.NEXT_PUBLIC_WP_API_BASE || 'https://your-wp-site.com/wp-json';

type BookingStatus = 'confirmed' | 'pending' | 'completed';

type Booking = {
  id: string;
  subject: string;
  tutorName: string;
  tutorAvatar: string;
  date: string;
  time: string;
  duration: number;
  amount: number;
  status: BookingStatus;
};

export default function BookingsPage() {
  const { data: session, status } = useSession();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  // =============================
  // WP REST: /custom/v1/dashboard-student
  // =============================
  useEffect(() => {
    if (status !== 'authenticated') return;

    const fetchBookings = async () => {
      try {
        const user = session?.user as WPUser;

        const url = `${WP_API_BASE}/custom/v1/dashboard-student?id=${user.id}`;
        const res = await fetch(url);

        if (!res.ok) throw new Error('Failed to load bookings');

        const data = await res.json();
        const wpBookings = data.bookings || [];

        // console.log('RAW WP bookings:', wpBookings);

        const mapped: Booking[] = wpBookings.map((b: any) => {
          // start_date usually "2024-01-20 10:00:00"
          const startStr =
            b.start_date || b.start || b.start_time || b.date || '';
          const start = startStr ? new Date(startStr) : new Date();

          const dateStr = start.toISOString().slice(0, 10); // 2024-01-20
          const timeStr = start.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
          });

          // duration
          const durationMin =
            Number(b.duration) ||
            Number(b.duration_min) ||
            (b.end_date
              ? Math.round(
                  (new Date(b.end_date).getTime() - start.getTime()) / 60000
                )
              : 60);

          // price
          const price =
            Number(b.price) ||
            Number(b.total) ||
            Number(b.amount) ||
            Number(b.payment) ||
            0;

          // status map
          const rawStatus = String(b.status || '').toLowerCase();
          let status: BookingStatus = 'pending';
          if (['approved', 'confirmed', 'active'].includes(rawStatus)) {
            status = 'confirmed';
          } else if (
            ['completed', 'done', 'finished'].includes(rawStatus)
          ) {
            status = 'completed';
          }

          return {
            id: String(b.id || b.appointment_id || b.booking_id),
            subject: b.service_title || b.service || 'Lesson',
            tutorName: b.staff_name || b.tutor_name || 'Tutor',
            tutorAvatar:
              b.staff_avatar || b.tutor_avatar || data.avatar || '',
            date: dateStr,
            time: timeStr,
            duration: durationMin,
            amount: price,
            status,
          };
        });

        setBookings(mapped);
      } catch (error) {
        console.error(error);
        toast.error('Could not load your bookings');
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [session, status]);

  const upcomingBookings = bookings.filter(
    (booking) => booking.status === 'confirmed'
  );
  const pendingBookings = bookings.filter(
    (booking) => booking.status === 'pending'
  );
  const pastBookings = bookings.filter(
    (booking) => booking.status === 'completed'
  );

  const handleJoinLesson = (bookingId: string) => {
    toast.info('Joining lesson...');
  };

  const handleCancelBooking = (bookingId: string) => {
    toast.success('Booking cancelled successfully');
  };

  const handleReschedule = (bookingId: string) => {
    toast.info('Reschedule functionality would open here');
  };

  const BookingCard = ({
    booking,
    showActions = true,
  }: {
    booking: Booking;
    showActions?: boolean;
  }) => (
    <Card className="mb-4">
      <CardContent className="p-4 sm:p-6">
        {/* Top layout */}
        <div className="flex flex-col sm:flex-row items-start gap-4">
          <Avatar className="h-14 w-14 sm:h-16 sm:w-16 self-center sm:self-auto">
            <AvatarImage src={booking.tutorAvatar} />
            <AvatarFallback>{booking.tutorName[0]}</AvatarFallback>
          </Avatar>

          <div className="flex-1 w-full text-center">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
              <div>
                <h3 className="text-base sm:text-lg font-semibold">
                  {booking.subject} Lesson
                </h3>
                <p className="text-gray-600 text-sm sm:text-base">
                  with {booking.tutorName}
                </p>
              </div>
              <Badge
                className="self-center sm:self-start mt-2 sm:mt-0"
                variant={
                  booking.status === 'confirmed'
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
                  {booking.time} ({booking.duration} min)
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="font-medium">${booking.amount}</span>
              </div>
            </div>

            {/* Actions */}
            {showActions && (
              <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
                {booking.status === 'confirmed' && (
                  <>
                    <Button
                      size="sm"
                      className="w-full sm:w-auto"
                      onClick={() => handleJoinLesson(booking.id)}
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
                      onClick={() => handleReschedule(booking.id)}
                    >
                      Reschedule
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full sm:w-auto"
                      onClick={() => handleCancelBooking(booking.id)}
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
                      onClick={() => handleCancelBooking(booking.id)}
                    >
                      Cancel Request
                    </Button>
                  </>
                )}

                {booking.status === 'completed' && (
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="py-8 px-4">
          <div className="max-w-4xl mx-auto text-center">
            Loading bookings...
          </div>
        </div>
        <Footer />
      </div>
    );
  }

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
                  <BookingCard key={booking.id} booking={booking} />
                ))
              ) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No upcoming bookings
                    </h3>
                    <p className="text-gray-500 mb-4">
                      You don&apos;t have any confirmed lessons scheduled.
                    </p>
                    <Button>Find a Tutor</Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="pending" className="mt-6">
              {pendingBookings.length > 0 ? (
                pendingBookings.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} />
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
                  <BookingCard key={booking.id} booking={booking} />
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
        </div>
      </div>

      <Footer />
    </div>
  );
}
