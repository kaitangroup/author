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
import Link from 'next/link';
import { useRouter } from "next/navigation";

 
const apiUrl = process.env.NEXT_PUBLIC_WP_URL;

export default function BookingsPage() {
  const [wpToken, setWpToken] = useState<string | null>(null);
   const router = useRouter();
  const [authorDashboard, setAuthorDashboard] =
    useState<AuthorDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ⭐ rating modal related state
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
  const [ratingValue, setRatingValue] = useState<number>(0);
  const [ratingComment, setRatingComment] = useState<string>('');

  const toLocalDateTime = (startIso?: string) => {
    if (!startIso) return { date: 'N/A', time: 'N/A' };

    const d = new Date(startIso);

    const date = d.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

    const time = d.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
    });

    return { date, time };
  };

  // Grab token once
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('wpToken');
    setWpToken(token);
  }, []);

  // Fetch bookings from student dashboard endpoint
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

        const res = await fetch(
          `${apiUrl}wp-json/custom/v1/dashboard-student`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            cache: 'no-store',
          }
        );

        

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
  const pendingBookings = allBookings.filter((b) => b.status === 'pending');
  const pastBookings = allBookings.filter(
    (b) => b.status !== 'approved' && b.status !== 'pending'
  );

  const handleJoinLesson = (booking: any) => {
    if (booking.video_link) {
      window.location.href = booking.video_link;
    } else {
      toast.info('No join link available for this booking yet.');
    }
  };



  const handleReschedule = (bookingId: string | number) => {
    toast.info('Reschedule functionality would open here');
  };








const handleCancelBooking = async (appointmentId: number) => {
  if (!wpToken) {
    toast.error('Missing auth token');
    return;
  }

  const confirmCancel = window.confirm('Are you sure you want to cancel this booking?');
  if (!confirmCancel) return;

  try {
    const res = await fetch(`${apiUrl}wp-json/custom/v1/cancel-booking`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${wpToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ appointment_id: appointmentId }),
    });

    const data: { success?: boolean; message?: string } = await res.json();

    if (!res.ok || data.success === false) {
      throw new Error(data?.message || 'Failed to cancel booking');
    }




    // 🔥 Type-safe state update — No more red marks!
    setAuthorDashboard(
      (prev: AuthorDashboard | null): AuthorDashboard | null => {
        if (!prev) return prev;

        const updatedBookings = prev.bookings.map((b: any) =>
          b.appointment_id === appointmentId ? { ...b, status: 'cancelled' } : b
        );

        return {
          ...prev,
          bookings: updatedBookings,
        };
      }
    );

    toast.success('Booking cancelled successfully');
  } catch (err: any) {
    console.error('Cancel booking error', err);
    toast.error(err.message || 'Failed to cancel booking');
  }
};




  




  // ⭐ Rate Lesson button e click hole
  const openRatingModal = (booking: any) => {
    // helpful debug, ichchha hole console off kore dite paro
    console.log('SELECTED BOOKING FOR RATING:', booking);

    setSelectedBooking(booking);
    setRatingValue(booking.rating ?? 0);
    setRatingComment(booking.rating_comment ?? '');
    setRatingModalOpen(true);
  };

  // ⭐ rating submit
  const submitRating = async () => {
    if (!selectedBooking) return;
    if (!ratingValue) {
      toast.error('Please select a rating.');
      return;
    }

    const token = wpToken ?? localStorage.getItem('wpToken');
    if (!token) {
      toast.error('Missing auth token');
      return;
    }

    // 🔹 tutor er WordPress user ID booking object thekei nichi:
    // backend theke ekhono jei field pacho:
    // - tutor_id (jodi add kore thako)
    // - author_user_id (amra Bookly theke pathacchilam)
    const tutorId =
      selectedBooking.tutor_id ;

    if (!tutorId) {
      console.error('No tutor id on booking', selectedBooking);
      toast.error('Tutor ID missing in booking data');
      return;
    }

    try {
      const res = await fetch(`${apiUrl}wp-json/custom/v1/lesson-rating`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          appointment_id: Number(selectedBooking.appointment_id),
          tutor_id: Number(tutorId),
          rating: ratingValue,
          comment: ratingComment,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message || 'Failed to submit rating');
      }

      await res.json();
      toast.success('Thanks for your rating!');

      // local state update kore dekhai je already rated
      setAuthorDashboard((prev) => {
        if (!prev) return prev;
        const updatedBookings = (prev.bookings as unknown as any[]).map(
          (b: any) =>
            b.appointment_id === selectedBooking.appointment_id
              ? { ...b, rated: true, rating: ratingValue }
              : b
        );
        return { ...prev, bookings: updatedBookings } as unknown as AuthorDashboard;
      });

      setRatingModalOpen(false);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Error while submitting rating');
    }
  };

  // Card component
  const BookingCard = ({
    booking,
    showActions = true,
    onRateLesson,
  }: {
    booking: any;
    showActions?: boolean;
    onRateLesson?: (booking: any) => void;
  }) => (
    <Card className="mb-4">
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start gap-4">
          <Avatar className="h-14 w-14 sm:h-16 sm:w-16 self-center sm:self-auto">
            <AvatarImage src={booking.avatar} />
            <AvatarFallback>{booking.name ? booking.name[0] : 'U'}</AvatarFallback>
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
              {(() => {
                const { date, time } = toLocalDateTime(booking.start_iso);

                return (
                  <>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{date}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>
                        {time}
                        {booking.duration && ` (${booking.duration} min)`}
                      </span>
                    </div>
                  </>
                );
              })()}
              <div className="flex items-center gap-1">
                <span className="font-medium">
                  {typeof booking.price !== 'undefined' ? `$${booking.price}` : ''}
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
                      onClick={() => router.push(`/messages?to=${booking.tutor_id}`)}
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
                      Message Author
                    </Button>
            
                  </>
                )}

                {booking.status !== 'approved' && booking.status !== 'pending' && (
                  <>
                  {authorDashboard?.id !== booking?.tutor_id && (
                      <>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full sm:w-auto"
                      onClick={() => onRateLesson && onRateLesson(booking)}
                      disabled={booking.rated}
                    >
                      <Star className="h-4 w-4 mr-2" />
                      {booking.rated ? 'Rated' : 'Rate Lesson'}
                    </Button>
                    <Link href={`/tutors/${booking.tutor_id}`}>
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full sm:w-auto"
                      >
                        Book Again
                      </Button>
                    </Link>
                    </>
                  )}
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
              Manage your authoring sessions and appointments.
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
                      <Button asChild>
                        <Link href="/search">Find a Author</Link>
                      </Button>
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
                      onRateLesson={openRatingModal}
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

      {/* ⭐ Rating Modal */}
      {ratingModalOpen && selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
            <h2 className="text-xl font-semibold mb-2 text-center">
              Rate Lesson – {selectedBooking.subject || selectedBooking.service}
            </h2>
            <p className="text-sm text-gray-600 mb-4 text-center">
              with {selectedBooking.name}
            </p>

            {/* Star selector */}
            <div className="flex justify-center gap-2 mb-4">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  className="p-1"
                  onClick={() => setRatingValue(value)}
                >
                  <Star
                    className={
                      'h-7 w-7 ' +
                      (value <= ratingValue
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300')
                    }
                  />
                </button>
              ))}
            </div>

            {/* Comment */}
            <textarea
              value={ratingComment}
              onChange={(e) => setRatingComment(e.target.value)}
              placeholder="Leave a short review (optional)"
              className="w-full border rounded-md px-3 py-2 text-sm mb-4 focus:outline-none focus:ring focus:ring-primary/40"
              rows={3}
            />

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setRatingModalOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={submitRating}>Submit Rating</Button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
