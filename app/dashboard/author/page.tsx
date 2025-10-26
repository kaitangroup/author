'use client';

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

export default function TutorDashboard() {
  const upcomingBookings = mockBookings.filter(booking => booking.status === 'confirmed');
  const pendingBookings = mockBookings.filter(booking => booking.status === 'pending');
  const unreadMessages = mockMessages.filter(msg => msg.unread);

  const totalEarnings = mockBookings.reduce((sum, booking) => sum + booking.amount, 0);
  const monthlyEarnings = 1250; // Mock data
  const totalStudents = 24; // Mock data
  const averageRating = 4.8; // Mock data

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Dashboard Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Tutor Dashboard</h1>
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
                    <p className="text-sm text-gray-600">Upcoming Lessons</p>
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
                    <CardTitle>Upcoming Lessons</CardTitle>
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
                      <p className="text-gray-500">No upcoming lessons scheduled</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Pending Requests */}
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
              )}

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
                  <Link href="/schedule">
                    <Button variant="outline" className="w-full justify-start">
                      <Calendar className="h-4 w-4 mr-3" />
                      Manage Schedule
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
                  {mockMessages.slice(0, 3).map((message) => (
                    <div key={message.id} className="flex items-start gap-3 mb-4 last:mb-0">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={message.avatar} />
                        <AvatarFallback>ST</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">Student Name</p>
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
  );
}