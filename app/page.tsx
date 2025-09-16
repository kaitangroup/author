import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Search, BookOpen, MessageCircle, Star, Users, Clock } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-blue-50 to-white py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Find Your Perfect <span className="text-blue-600">Author</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Connect with qualified Author for personalized learning. Get the academic support you need to succeed.
          </p>
          
          {/* Search Bar */}
          <div className="bg-white p-4 rounded-lg shadow-lg max-w-4xl mx-auto mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input 
                  placeholder="What subject do you want to learn?" 
                  className="h-12 text-lg"
                />
              </div>
              {/* <div className="flex-1">
                <Input 
                  placeholder="Your location or online" 
                  className="h-12 text-lg"
                />
              </div> */}
              <Link href="/search">
                <Button size="lg" className="h-12 px-8 bg-blue-600 hover:bg-blue-700">
                  <Search className="mr-2 h-5 w-5" />
                  Find Authors
                </Button>
              </Link>
            </div>
          </div>










          <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600">
            <span className="bg-blue-100 px-3 py-1 rounded-full">Romance</span>
            <span className="bg-green-100 px-3 py-1 rounded-full">Science Fiction & Fantasy</span>
            <span className="bg-purple-100 px-3 py-1 rounded-full">Mystery, Thriller & Suspense</span>
            <span className="bg-orange-100 px-3 py-1 rounded-full">Self-help</span>
            <span className="bg-pink-100 px-3 py-1 rounded-full">History</span>
            <span className="bg-pink-100 px-3 py-1 rounded-full">Children's Books</span>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose AuthorConnect?</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <CardContent>
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Qualified Authors</h3>
                <p className="text-gray-600">
                  All Authors are verified and have proven expertise in their subjects
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <CardContent>
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Flexible Scheduling</h3>
                <p className="text-gray-600">
                  Book lessons that fit your schedule, with easy rescheduling options
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <CardContent>
                <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="h-8 w-8 text-orange-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Direct Communication</h3>
                <p className="text-gray-600">
                  Chat directly with Authors to discuss your learning goals
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Start Learning?</h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of students who have found success with our authors
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/user/register">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                Find a Authors
              </Button>
            </Link>
            <Link href="/auth/author/register">
              <Button size="lg" variant="outline">
                Become a Author
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}