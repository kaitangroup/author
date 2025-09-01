'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import Link from 'next/link';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Check } from 'lucide-react';

export default function TutorRegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<{
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
    zipCode: string;
    agreeToTerms: boolean;
  }>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    zipCode: '',
    agreeToTerms: false,
  });

  const [errors, setErrors] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string) => {
    // Strong password: at least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
   
    
    // Reset errors
    setErrors({ email: '', password: '', confirmPassword: '' });
    
    let hasErrors = false;
    const newErrors = { email: '', password: '', confirmPassword: '' };

    // Validate email
    if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
      hasErrors = true;
    }

    // Validate password
    if (!validatePassword(formData.password)) {
      newErrors.password = 'Password must be at least 8 characters with uppercase, lowercase, number, and special character';
      hasErrors = true;
    }

    // Validate password confirmation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      hasErrors = true;
    }

    if (hasErrors) {
      setErrors(newErrors);
      return;
    }

    if (!formData.agreeToTerms) {
      toast.error('Please agree to the terms and conditions');
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch("http://authorproback.me/wp-json/custom/v1/register-author", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      console.log("📌 API Response:", data);

      if (!res.ok || !data.success) {
        toast.error(data?.message || "Signup failed");
      } else {
        toast.success("🎉 Signup successful! Please log in.");
        router.push("/auth/user/login");
      }
    } catch (err) {
      console.error("❌ Signup Error:", err);
      toast.error("Something went wrong!");
    } finally {
      setSubmitting(false);
    }
  

  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear specific error when user starts typing
    if (field === 'email' && errors.email) {
      setErrors(prev => ({ ...prev, email: '' }));
    }
    if (field === 'password' && errors.password) {
      setErrors(prev => ({ ...prev, password: '' }));
    }
    if (field === 'confirmPassword' && errors.confirmPassword) {
      setErrors(prev => ({ ...prev, confirmPassword: '' }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Hero Section */}
              <div className="mb-12">
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                  Share your expertise and earn money teaching students
                </h1>
              </div>

              {/* Signup Card */}
              <Card className="bg-white shadow-sm max-w-md mx-auto lg:mx-0">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl font-bold text-gray-900">Welcome to TutorConnect!</CardTitle>
                  <p className="text-gray-600">Apply to become a tutor and start earning.</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Already have an account?{' '}
                    <Link href="/auth/author/login" className="text-blue-600 hover:underline">
                      Log in.
                    </Link>
                  </p>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <p className="text-xs text-gray-500 text-center">
                    By signing up, I agree to TutorConnect's{' '}
                    <Link href="/terms" className="text-blue-600 hover:underline">terms of use</Link>
                    {' '}and{' '}
                    <Link href="/privacy" className="text-blue-600 hover:underline">privacy policy</Link>.
                  </p>

                  {/* Signup Form */}
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">First Name *</Label>
                        <Input
                          id="firstName"
                          type="text"
                          value={formData.firstName}
                          onChange={(e) => handleInputChange('firstName', e.target.value)}
                          className="mt-1 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          placeholder="Visible publicly"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Last Name *</Label>
                        <Input
                          id="lastName"
                          type="text"
                          value={formData.lastName}
                          onChange={(e) => handleInputChange('lastName', e.target.value)}
                          className="mt-1 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className={`mt-1 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 ${
                          errors.email ? 'border-red-500' : ''
                        }`}
                        required
                      />
                      {errors.email && (
                        <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="password">Create Password *</Label>
                      <Input
                        id="password"
                        type="password"
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        className={`mt-1 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 ${
                          errors.password ? 'border-red-500' : ''
                        }`}
                        required
                      />
                      {errors.password && (
                        <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="confirmPassword">Confirm Password *</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                        className={`mt-1 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 ${
                          errors.confirmPassword ? 'border-red-500' : ''
                        }`}
                        required
                      />
                      {errors.confirmPassword && (
                        <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="zipCode">Zip Code *</Label>
                      <Input
                        id="zipCode"
                        type="text"
                        value={formData.zipCode}
                        onChange={(e) => handleInputChange('zipCode', e.target.value)}
                        className="mt-1 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        placeholder="e.g., 10001"
                        required
                      />
                    </div>

                    <div className="flex items-start space-x-3 pt-4">
                      <Checkbox
                        id="agreeToTerms"
                        checked={formData.agreeToTerms}
                        onCheckedChange={(checked) => handleInputChange('agreeToTerms', checked)}
                        required
                      />
                      <Label htmlFor="agreeToTerms" className="text-sm">
                        I agree to TutorConnect's{' '}
                        <Link href="/terms" className="text-blue-600 hover:underline">terms of use</Link>
                        {' '}and{' '}
                        <Link href="/privacy" className="text-blue-600 hover:underline">privacy policy</Link>. *
                      </Label>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-md"
                    >
                      Apply to Become a Tutor
                    </Button>
                  </form>

                  <div className="text-center mt-4">
                    <p className="text-sm text-gray-600">
                      Looking for a tutor?{' '}
                      <Link href="/auth/user/register" className="text-blue-600 hover:underline">
                        Sign up as a student.
                      </Link>
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Testimonial */}
              <div className="mt-12 max-w-md mx-auto lg:mx-0">
                <Card className="bg-white shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <img 
                        src="https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=100"
                        alt="Tutor testimonial"
                        className="w-16 h-16 rounded-full object-cover"
                      />
                      <div>
                        <div className="flex items-center gap-1 mb-2">
                          <span className="text-green-600 font-medium">💬</span>
                          <span className="text-green-600 font-medium">Great platform for tutors!</span>
                        </div>
                        <p className="text-gray-600 text-sm mb-2">
                          I've been tutoring on TutorConnect for 2 years and love the flexibility. 
                          The platform makes it easy to connect with students and manage my schedule.
                        </p>
                        <p className="text-gray-400 text-xs">– Sarah, Mathematics Tutor</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Featured In */}
              <div>
                <p className="text-sm font-medium text-gray-500 mb-4 uppercase tracking-wide">FEATURED IN</p>
                <div className="flex flex-wrap items-center gap-4 opacity-60">
                  <div className="text-gray-400 font-bold text-lg">Forbes</div>
                  <div className="text-gray-400 font-bold text-lg">NBC</div>
                  <div className="text-gray-400 font-bold text-lg">TIME</div>
                  <div className="text-gray-400 font-bold text-lg">CNN</div>
                  <div className="text-gray-400 font-bold text-lg">Chicago Tribune</div>
                </div>
              </div>

              {/* Benefits */}
              <div className="space-y-6">
                <div className="flex items-start gap-3">
                  <div className="bg-green-100 rounded-full p-1 mt-1">
                    <Check className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Set Your Own Schedule</h3>
                    <p className="text-gray-600 text-sm">
                      Work when you want, where you want. You have complete control over your 
                      availability and can teach from anywhere.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-green-100 rounded-full p-1 mt-1">
                    <Check className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Earn $20-$80+ Per Hour</h3>
                    <p className="text-gray-600 text-sm">
                      Set your own rates and keep 85% of what you earn. Top tutors on our platform 
                      earn over $1,000 per week.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-green-100 rounded-full p-1 mt-1">
                    <Check className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Teach Any Subject</h3>
                    <p className="text-gray-600 text-sm">
                      From academic subjects to music, art, and languages. Share your expertise 
                      in whatever you're passionate about.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-green-100 rounded-full p-1 mt-1">
                    <Check className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">No Experience Required</h3>
                    <p className="text-gray-600 text-sm">
                      Whether you're a certified teacher or subject matter expert, we welcome 
                      tutors of all backgrounds and experience levels.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}