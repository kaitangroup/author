'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import Link from 'next/link';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function AuthorLoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const apiUrl = process.env.WP_URL;


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch("http://authorproback.me/wp-json/jwt-auth/v1/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
        }),
      });

      const data = await res.json();
      console.log("🔹 WP JWT Login Response:", data);

      if (!res.ok) {
        toast.error(data?.message || "Login failed");
      } else {
        localStorage.setItem("wpToken", data.token);
        localStorage.setItem("wpUser", data.user_display_name || formData.username);
        const token = data.token;
        const response = await fetch('http://authorproback.me/wp-json/custom/v1/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
       
        const profiledata = await response.json();
        if (!response.ok) {
          toast.error(profiledata?.message || "Login failed");
          console.log("❌ Profile Fetch Error:", profiledata);
        } 
        console.log(profiledata);
        localStorage.setItem("wpUserdata",  JSON.stringify(profiledata));
      


        toast.success("Login successful!");
        router.push("/dashboard/student");
      }
    } catch (err) {
      console.error("❌ WP JWT Error:", err);
      toast.error("Something went wrong!");
    } finally {
      setSubmitting(false);
    }

  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSocialLogin = (provider: string) => {
    toast.info(`${provider} login would be implemented here`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Login Form */}
            <div className="lg:col-span-2">
              <Card className="bg-white shadow-sm">
                <CardHeader>
                  <CardTitle className="text-2xl font-normal text-gray-900">Log In</CardTitle>
                  <p className="text-gray-600">
                    Don't have an account?{' '}
                    <Link href="/auth/author/register" className="text-blue-600 hover:underline">
                      Sign up for free.
                    </Link>
                  </p>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Social Login Buttons */}
                  <div className="space-y-3">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full h-12 border-gray-300 hover:bg-gray-50"
                      onClick={() => handleSocialLogin('Google')}
                    >
                      <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      Log in with Google
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      className="w-full h-12 border-gray-300 hover:bg-gray-50"
                      onClick={() => handleSocialLogin('Apple')}
                    >
                      <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                      </svg>
                      Log in with Apple
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      className="w-full h-12 border-gray-300 hover:bg-gray-50"
                      onClick={() => handleSocialLogin('Facebook')}
                    >
                      <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="#1877F2">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                      Log in with Facebook
                    </Button>
                  </div>

                  {/* Divider */}
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-white text-gray-500">Or</span>
                    </div>
                  </div>

                  {/* Login Form */}
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="username" className="text-gray-700">Username</Label>
                      <Input
                        id="username"
                        type="text"
                        value={formData.username}
                        onChange={(e) => handleInputChange('username', e.target.value)}
                        className="mt-1 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="password" className="text-gray-700">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        className="mt-1 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-md"
                    >
                      Log in
                    </Button>
                  </form>

                  <div className="text-center mt-4">
                    <Link href="/auth/forgot-password" className="text-blue-600 hover:underline text-sm">
                      Forgot username or password?
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* New to TutorConnect */}
              <Card className="bg-white shadow-sm">
                <CardContent className="p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">New to AuthorConnect?</h3>
                  <div className="space-y-3">
                    <Link 
                      href="/auth/user/register"
                      className="block text-blue-600 hover:underline"
                    >
                      Register as a student
                    </Link>
                    <Link 
                      href="/auth/author/register"
                      className="block text-blue-600 hover:underline"
                    >
                      Apply to become a Author
                    </Link>
                    <Link 
                      href="/about"
                      className="block text-blue-600 hover:underline"
                    >
                      Learn how we partner
                    </Link>
                  </div>
                </CardContent>
              </Card>

              {/* Username Info */}
              <Card className="bg-white shadow-sm">
                <CardContent className="p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Your username</h3>
                  <div className="space-y-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium text-gray-900">Students</span> - Your username is the email address you entered to contact Authors.
                    </div>
                    <div>
                      <span className="font-medium text-gray-900">Authors</span> - Your username was sent to you when you first registered. The format is usually FirstName.LastName and you can also sign in with your AuthorConnect email.
                    </div>
                    <div>
                      <span className="font-medium text-gray-900">Partners</span> - Your username is the email address you entered when you applied for the partner program.
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