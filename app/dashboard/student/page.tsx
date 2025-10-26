'use client';

import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  BookOpen, Calendar, MessageCircle, CreditCard, 
  Clock, Star, Search, Plus
} from 'lucide-react';
import Link from 'next/link';
import { mockBookings, mockMessages } from '@/lib/mockData';

export default function StudentDashboard() {
  const upcomingBookings = mockBookings.filter(booking => booking.status === 'confirmed');
  const pendingBookings = mockBookings.filter(booking => booking.status === 'pending');
  const unreadMessages = mockMessages.filter(msg => msg.unread);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Dashboard Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">User Dashboard</h1>
            <p className="text-gray-600">Welcome back! Here's what's happening with your learning journey.</p>
          </div>

          {/* Quick Stats */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <BookOpen className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{mockBookings.length}</p>
                    <p className="text-sm text-gray-600">Total Meetings</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 p-3 rounded-lg">
                    <Calendar className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{upcomingBookings.length}</p>
                    <p className="text-sm text-gray-600">Upcoming</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="bg-orange-100 p-3 rounded-lg">
                    <MessageCircle className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{unreadMessages.length}</p>
                    <p className="text-sm text-gray-600">New Messages</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <CreditCard className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">$135</p>
                    <p className="text-sm text-gray-600">This Month</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Upcoming Meetings */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Upcoming Meetings</CardTitle>
                    <Link href="/search">
                      <Button size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Book New
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  {upcomingBookings.length > 0 ? (
                    <div className="space-y-4">
                     {upcomingBookings.map((booking) => (
                    <div key={booking.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                      <Avatar>
                        <AvatarImage src={booking.tutorAvatar} />
                        <AvatarFallback>{booking.tutorName[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h4 className="font-medium">{booking.subject} with {booking.tutorName}</h4>
                        <p className="text-sm text-gray-600">{booking.date} at {booking.time}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="h-3 w-3 text-gray-400" />
                          <span className="text-xs text-gray-500">{booking.duration} minutes</span>
                        </div>

                        {/* ✅ Join Now link */}
                        <Link
                          href="/room/demo"
                          className="text-blue-600 text-sm font-medium mt-2 inline-block hover:underline"
                        >
                          Join Now →
                        </Link>
                      </div>
                      <div className="text-right">
                        <Badge variant="secondary">{booking.status}</Badge>
                        <p className="text-sm font-medium mt-1">${booking.amount}</p>
                      </div>
                    </div>
                  ))}

                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 mb-4">No upcoming Meetings</p>
                      <Link href="/search">
                        <Button>Find a Tutor</Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                      <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                      <span>Lesson completed with Sarah Johnson - Mathematics</span>
                      <span className="text-gray-500 ml-auto">2 hours ago</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                      <span>New message from Michael Chen</span>
                      <span className="text-gray-500 ml-auto">1 day ago</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <div className="h-2 w-2 bg-orange-500 rounded-full"></div>
                      <span>Payment processed - $45.00</span>
                      <span className="text-gray-500 ml-auto">2 days ago</span>
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
                  <Link href="/search">
                    <Button variant="outline" className="w-full justify-start">
                      <Search className="h-4 w-4 mr-3" />
                      Find New Tutor
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
                  <Link href="/bookings">
                    <Button variant="outline" className="w-full justify-start">
                      <Calendar className="h-4 w-4 mr-3" />
                      Manage Bookings
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
                  {mockMessages.slice(0, 3).map((message) => (
                    <div key={message.id} className="flex items-start gap-3 mb-4 last:mb-0">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={message.avatar} />
                        <AvatarFallback>{message.participant[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{message.participant}</p>
                        <p className="text-xs text-gray-500 truncate">{message.lastMessage}</p>
                        <p className="text-xs text-gray-400">{message.timestamp}</p>
                      </div>
                      {message.unread && (
                        <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                      )}
                    </div>
                  ))}
                  
                  <Link href="/messages">
                    <Button variant="ghost" size="sm" className="w-full mt-3">
                      View All Messages
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Performance */}
              <Card>
                <CardHeader>
                  <CardTitle>Learning Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm">Science Fiction & Fantasy</span>
                        <span className="text-sm text-gray-600">85%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm">Romance</span>
                        <span className="text-sm text-gray-600">72%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full" style={{ width: '72%' }}></div>
                      </div>
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
  );
}