'use client';
import { useEffect, useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, Calendar, DollarSign, MessageCircle, 
  Clock, Star, TrendingUp, Settings
} from 'lucide-react';
import Link from 'next/link';
import { mockBookings, mockMessages } from '@/lib/mockData';
import { AuthorDashboard } from '@/lib/types';
import { RoleGuard } from '@/components/auth/RoleGuard';

import { useSession } from "next-auth/react";

// ... baki imports same

type RecentMessage = {
  id: number;
  content: string;
  timestamp: string;
  unread: boolean;
  other_user: {
    id: number;
    name: string;
    avatar: string;
  };
};



export default function TutorDashboard() {
 
  const unreadMessages = mockMessages.filter(msg => msg.unread);
  const [loading, setLoading] = useState(true);
  const apiUrl = process.env.NEXT_PUBLIC_WP_URL;

  const [wpToken, setWpToken] = useState<string | null>(null);
  const [recentMessages, setRecentMessages] = useState<RecentMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [messagesError, setMessagesError] = useState<string | null>(null);

  const [authorDashboard, setAuthorDashboard] = useState<AuthorDashboard | null>();
  const totalEarnings = authorDashboard ? authorDashboard.totalEarnings  : 0; // Mock data
  const monthlyEarnings = authorDashboard ? authorDashboard.totalEarnings : 0; // Mock data
  const totalStudents = authorDashboard ? authorDashboard.totalStudents : 0; // Mock data
  const averageRating = 4.8; // Mock data

  const upcomingBookings = authorDashboard && Array.isArray(authorDashboard.bookings)
    ? authorDashboard.bookings.filter((booking: any) => booking?.status === 'approved')
    : [];

    const pendingBookings = authorDashboard && Array.isArray(authorDashboard.bookings)
    ? authorDashboard.bookings.filter((booking: any) => booking?.status === 'pending')
    : [];


  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('wpToken');
        const res = await fetch(`${apiUrl}wp-json/custom/v1/dashboard`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!res.ok) throw new Error('Failed to fetch profile');
        const data = await res.json();
        setAuthorDashboard(data);
       
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);




  // page load hole ekbar localStorage theke wpToken niye asho
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('wpToken');
    setWpToken(token);
    console.log('Dashboard wpToken from localStorage =>', token);
  }, []);



    useEffect(() => {
    const fetchRecentMessages = async () => {
      if (!wpToken || !apiUrl) {
        console.log('No token or apiUrl, skipping fetch');
        return;
      }

      setLoadingMessages(true);
      setMessagesError(null);

      try {
        const res = await fetch(
          `${apiUrl}/wp-json/authorconnect/v1/recent-messages?limit=2`,
          {
            headers: {
              Authorization: `Bearer ${wpToken}`,
              'Content-Type': 'application/json',
            },
            cache: 'no-store',
          }
        );

        console.log('recent-messages status =>', res.status);
        const data = await res.json().catch(() => ({}));
        console.log('recent-messages body =>', data);

        if (!res.ok) {
          throw new Error(data?.message || 'Failed to load recent messages');
        }

        setRecentMessages(data.messages || []);
      } catch (e: any) {
        console.error('Recent messages error', e);
        setMessagesError(e.message || 'Failed to load messages');
      } finally {
        setLoadingMessages(false);
      }
    };

    fetchRecentMessages();
  }, [apiUrl, wpToken]);


  return (
    <RoleGuard allowed={['author']} redirectTo="/">
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Dashboard Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Author Dashboard</h1>
            <p className="text-gray-600">Manage your lessons, students, and earnings all in one place.</p>
          </div>

          {/* Quick Stats */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{totalStudents}</p>
                    <p className="text-sm text-gray-600">Active Students</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 p-3 rounded-lg">
                    <DollarSign className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">${monthlyEarnings}</p>
                    <p className="text-sm text-gray-600">This Month</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="bg-orange-100 p-3 rounded-lg">
                    <Calendar className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{upcomingBookings.length}</p>
                    <p className="text-sm text-gray-600">Upcoming Meetings</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="bg-yellow-100 p-3 rounded-lg">
                    <Star className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{averageRating}</p>
                    <p className="text-sm text-gray-600">Average Rating</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Upcoming Lessons */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Upcoming Meetings</CardTitle>
                    <Link href="/calendar">
                      {/* <Button size="sm">
                        <Calendar className="h-4 w-4 mr-2" />
                        View Calendar
                      </Button> */}
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  {upcomingBookings.length > 0 ? (
                    <div className="space-y-4">
                      {upcomingBookings.map((booking) => (
  <div key={booking?.appointment_id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
    <Avatar>
      <AvatarImage src={booking.avatar} />
      <AvatarFallback>{booking.name}</AvatarFallback>
    </Avatar>
    <div className="flex-1">
      <h4 className="font-medium">{booking.subject} with {booking.name}</h4>
      <p className="text-sm text-gray-600">{booking.date} at {booking.time}</p>
      <div className="flex items-center gap-2 mt-1">
        <Clock className="h-3 w-3 text-gray-400" />
        <span className="text-xs text-gray-500">{booking.duration} minutes</span>
      </div>

      {/* ✅ Join Now link */}
      <Link
        href={booking.video_link ?? "/room/demo"}
        className="text-blue-600 text-sm font-medium mt-2 inline-block hover:underline"
      >
        Join Link →
      </Link>
    </div>
    <div className="text-right">
      <Badge variant="secondary">{booking.status}</Badge>
      <p className="text-sm font-medium mt-1">${booking.price}</p>
    </div>
  </div>
))}

                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">No upcoming lessons scheduled</p>
                    </div>
                  )}
                </CardContent>
              </Card>

            {/* My Books */}
            {Array.isArray((authorDashboard as any)?.books) && (authorDashboard as any).books.length > 0 && (
                <Card>
                  <CardHeader>
  <div className="flex items-center justify-between w-full">
    <CardTitle>My Books</CardTitle>

    <Link
      href="/books"
      className="text-blue-600 text-sm font-medium hover:underline"
    >
      Manage All Books →
    </Link>
  </div>
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
                          {(authorDashboard as any).books.slice(0, 4).map((book: any) => (
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

              {/* Pending Requests
              {pendingBookings.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Pending Booking Requests</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {pendingBookings.map((booking) => (
                        <div key={booking.id} className="flex items-center gap-4 p-4 border rounded-lg">
                          <Avatar>
                            <AvatarFallback>ST</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <h4 className="font-medium">{booking.subject} Request</h4>
                            <p className="text-sm text-gray-600">Student: Jane Smith</p>
                            <p className="text-sm text-gray-600">{booking.date} at {booking.time}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">Decline</Button>
                            <Button size="sm" className="bg-green-600 hover:bg-green-700">Accept</Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )} */}

              {/* Earnings Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Earnings Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <TrendingUp className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">Earnings chart will be displayed here</p>
                      <p className="text-sm text-gray-400 mt-2">Total earnings: ${totalEarnings}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Link href="/books">
                    <Button variant="outline" className="w-full justify-start">
                      <Calendar className="h-4 w-4 mr-3" />
                      Manage Books
                    </Button>
                  </Link>
                  <Link href="/messages">
                    <Button variant="outline" className="w-full justify-start">
                      <MessageCircle className="h-4 w-4 mr-3" />
                      View Messages
                      {unreadMessages.length > 0 && (
                        <Badge className="ml-auto">{unreadMessages.length}</Badge>
                      )}
                    </Button>
                  </Link>
                  <Link href="/profile/edit">
                    <Button variant="outline" className="w-full justify-start">
                      <Settings className="h-4 w-4 mr-3" />
                      Edit Profile
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Recent Messages */}
              <Card>
  <CardHeader>
    <CardTitle>Recent Messages</CardTitle>
  </CardHeader>
  <CardContent>
    {loadingMessages && (
      <p className="text-sm text-gray-500">Loading messages...</p>
    )}

    {!loadingMessages && messagesError && (
      <p className="text-sm text-red-500">{messagesError}</p>
    )}

    {!loadingMessages && !messagesError && recentMessages.length === 0 && (
      <div className="text-center py-6">
        <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-blue-50">
          <MessageCircle className="h-5 w-5 text-blue-500" />
        </div>
        <p className="text-sm font-medium text-gray-800">
          You don&apos;t have any messages yet
        </p>
        <p className="mt-1 text-xs text-gray-500">
          When a student contacts you, their messages will appear here.
        </p>
      </div>
    )}

    {!loadingMessages && !messagesError && recentMessages.length > 0 && (
      <>
        {recentMessages.map((message) => (
          <div
            key={message.id}
            className="flex items-start gap-3 mb-4 last:mb-0"
          >
            <Avatar className="h-8 w-8">
              <AvatarImage src={message.other_user.avatar} />
              <AvatarFallback>
                {message.other_user.name?.[0] ?? 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">
                {message.other_user.name}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {message.content}
              </p>
              <p className="text-xs text-gray-400">
                {message.timestamp}
              </p>
            </div>
            {message.unread && (
              <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
            )}
          </div>
        ))}
      </>
    )}

    <Link href="/messages">
      <Button variant="ghost" size="sm" className="w-full mt-3">
        View All Messages
      </Button>
    </Link>
  </CardContent>
</Card>

              {/* Performance Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle>Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Response Rate</span>
                      <span className="text-sm font-medium text-green-600">95%</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Completion Rate</span>
                      <span className="text-sm font-medium text-green-600">98%</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm">Repeat Students</span>
                      <span className="text-sm font-medium text-blue-600">85%</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm">Profile Views</span>
                      <span className="text-sm font-medium">247 this week</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
    </RoleGuard>
  );
}