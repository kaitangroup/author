"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { FaGoogle, FaFacebook, FaApple } from "react-icons/fa";

export default function StudentRegisterPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [socialLoading, setSocialLoading] = useState<null | "google" | "apple" | "facebook">(null);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // ✅ WordPress Custom Register REST API
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    console.log("📌 Submitting Register Form:", formData);

    try {
      const res = await fetch("http://authorproback.me/wp-json/custom/v1/register", {
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

  // ✅ Social signup (NextAuth + WP)
  const handleSocialSignup = async (provider: "google" | "apple" | "facebook") => {
    try {
      setSocialLoading(provider);
      console.log("📌 Social Signup with:", provider);
      await signIn(provider, { callbackUrl: "/dashboard/student" });
    } catch (err) {
      console.error("❌ Social signup failed:", err);
      toast.error("Social signup failed");
    } finally {
      setSocialLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <Card className="bg-white shadow-sm rounded-2xl">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold text-gray-900">Create Your Account</CardTitle>
              <p className="text-gray-600 mt-1">
                Already have an account?{" "}
                <Link href="/auth/user/login" className="text-blue-600 hover:underline">
                  Log in
                </Link>
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* ✅ Social Signup */}
              <div className="space-y-3">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-12 flex items-center justify-center border-gray-300 hover:bg-gray-50"
                  onClick={() => handleSocialSignup("google")}
                  disabled={!!socialLoading}
                >
                  <FaGoogle className="w-5 h-5 mr-2 text-red-500" />
                  {socialLoading === "google" ? "Please wait…" : "Sign up with Google"}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-12 flex items-center justify-center border-gray-300 hover:bg-gray-50"
                  onClick={() => handleSocialSignup("apple")}
                  disabled={!!socialLoading}
                >
                  <FaApple className="w-5 h-5 mr-2 text-black" />
                  {socialLoading === "apple" ? "Please wait…" : "Sign up with Apple"}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-12 flex items-center justify-center border-gray-300 hover:bg-gray-50"
                  onClick={() => handleSocialSignup("facebook")}
                  disabled={!!socialLoading}
                >
                  <FaFacebook className="w-5 h-5 mr-2 text-blue-600" />
                  {socialLoading === "facebook" ? "Please wait…" : "Sign up with Facebook"}
                </Button>
              </div>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">Or sign up with email</span>
                </div>
              </div>

              {/* ✅ Register Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    value={formData.username}
                    onChange={(e) => handleInputChange("username", e.target.value)}
                    className="mt-1 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="mt-1 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    className="mt-1 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg"
                  disabled={submitting || !!socialLoading}
                >
                  {submitting ? "Signing up…" : "Sign up"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}


















// "use client";

// import { useState } from "react";
// import { signIn } from "next-auth/react";
// import { useRouter } from "next/navigation";
// import { toast } from "sonner";
// import Link from "next/link";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Header } from "@/components/layout/Header";
// import { Footer } from "@/components/layout/Footer";
// import { FaGoogle, FaFacebook, FaApple } from "react-icons/fa";

// export default function StudentRegisterPage() {
//   const router = useRouter();

//   const [formData, setFormData] = useState({
//     username: "",
//     email: "",
//     password: "",
//   });

//   const [submitting, setSubmitting] = useState(false);
//   const [socialLoading, setSocialLoading] = useState<null | "google" | "apple" | "facebook">(null);

//   const handleInputChange = (field: string, value: string) => {
//     setFormData((prev) => ({
//       ...prev,
//       [field]: value,
//     }));
//   };

//   // 👉 WordPress Custom Register REST API
//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setSubmitting(true);

//     try {
//       const res = await fetch("http://wyzant.me/wp-json/custom/v1/register", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(formData),
//       });

//       const data = await res.json();

//       if (!res.ok || !data.success) {
//         toast.error(data?.message || "Signup failed");
//       } else {
//         toast.success("Signup successful! Please log in.");
//         router.push("/auth/user/login");
//       }
//     } catch (err) {
//       toast.error("Something went wrong!");
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   // 👉 Social signup (via NextAuth)
//   const handleSocialSignup = async (provider: "google" | "apple" | "facebook") => {
//     try {
//       setSocialLoading(provider);
//       await signIn(provider, { callbackUrl: "/dashboard/student" });
//     } catch (err) {
//       toast.error("Social signup failed");
//     } finally {
//       setSocialLoading(null);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <Header />

//       <div className="py-16 px-4">
//         <div className="max-w-3xl mx-auto">
//           <Card className="bg-white shadow-sm">
//             <CardHeader>
//               <CardTitle className="text-2xl font-normal text-gray-900">Sign Up</CardTitle>
//               <p className="text-gray-600">
//                 Already have an account?{" "}
//                 <Link href="/auth/user/login" className="text-blue-600 hover:underline">
//                   Log in
//                 </Link>
//               </p>
//             </CardHeader>

//             <CardContent className="space-y-4">
//               {/* Social Signup */}
//               <div className="space-y-3">
//                 <Button
//                   type="button"
//                   variant="outline"
//                   className="w-full h-12 flex items-center justify-center border-gray-300 hover:bg-gray-50"
//                   onClick={() => handleSocialSignup("google")}
//                   disabled={!!socialLoading}
//                 >
//                   <FaGoogle className="w-5 h-5 mr-2 text-red-500" />
//                   {socialLoading === "google" ? "Please wait…" : "Sign up with Google"}
//                 </Button>

//                 <Button
//                   type="button"
//                   variant="outline"
//                   className="w-full h-12 flex items-center justify-center border-gray-300 hover:bg-gray-50"
//                   onClick={() => handleSocialSignup("apple")}
//                   disabled={!!socialLoading}
//                 >
//                   <FaApple className="w-5 h-5 mr-2 text-black" />
//                   {socialLoading === "apple" ? "Please wait…" : "Sign up with Apple"}
//                 </Button>

//                 <Button
//                   type="button"
//                   variant="outline"
//                   className="w-full h-12 flex items-center justify-center border-gray-300 hover:bg-gray-50"
//                   onClick={() => handleSocialSignup("facebook")}
//                   disabled={!!socialLoading}
//                 >
//                   <FaFacebook className="w-5 h-5 mr-2 text-blue-600" />
//                   {socialLoading === "facebook" ? "Please wait…" : "Sign up with Facebook"}
//                 </Button>
//               </div>

//               {/* Divider */}
//               <div className="relative my-6">
//                 <div className="absolute inset-0 flex items-center">
//                   <div className="w-full border-t border-gray-300"></div>
//                 </div>
//                 <div className="relative flex justify-center text-sm">
//                   <span className="px-4 bg-white text-gray-500">Or sign up with</span>
//                 </div>
//               </div>

//               {/* Register Form */}
//               <form onSubmit={handleSubmit} className="space-y-4">
//                 <div>
//                   <Label htmlFor="username" className="text-gray-700">
//                     Username
//                   </Label>
//                   <Input
//                     id="username"
//                     type="text"
//                     value={formData.username}
//                     onChange={(e) => handleInputChange("username", e.target.value)}
//                     className="mt-1 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
//                     required
//                   />
//                 </div>

//                 <div>
//                   <Label htmlFor="email" className="text-gray-700">
//                     Email
//                   </Label>
//                   <Input
//                     id="email"
//                     type="email"
//                     value={formData.email}
//                     onChange={(e) => handleInputChange("email", e.target.value)}
//                     className="mt-1 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
//                     required
//                   />
//                 </div>

//                 <div>
//                   <Label htmlFor="password" className="text-gray-700">
//                     Password
//                   </Label>
//                   <Input
//                     id="password"
//                     type="password"
//                     value={formData.password}
//                     onChange={(e) => handleInputChange("password", e.target.value)}
//                     className="mt-1 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
//                     required
//                   />
//                 </div>

//                 <Button
//                   type="submit"
//                   className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-md"
//                   disabled={submitting || !!socialLoading}
//                 >
//                   {submitting ? "Signing up…" : "Sign up"}
//                 </Button>
//               </form>
//             </CardContent>
//           </Card>
//         </div>
//       </div>

//       <Footer />
//     </div>
//   );
// }













// 'use client';

// import { useState } from 'react';
// import { Button } from '@/components/ui/button';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Checkbox } from '@/components/ui/checkbox';
// import { Header } from '@/components/layout/Header';
// import { Footer } from '@/components/layout/Footer';
// import Link from 'next/link';
// import { toast } from 'sonner';
// import { useRouter } from 'next/navigation';
// import { Check } from 'lucide-react';

// export default function StudentRegisterPage() {
//   const router = useRouter();
//   const [formData, setFormData] = useState({
//     firstName: '',
//     lastName: '',
//     email: '',
//     password: '',
//     confirmPassword: '',
//     agreeToTerms: false,
//   });

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
    
//     if (formData.password !== formData.confirmPassword) {
//       toast.error('Passwords do not match');
//       return;
//     }

//     if (!formData.agreeToTerms) {
//       toast.error('Please agree to the terms and conditions');
//       return;
//     }

//     // Simulate registration
//     toast.success('Registration successful! Please check your email to verify your account.');
//     router.push('/auth/user/login');
//   };

//   const handleInputChange = (field: string, value: string | boolean) => {
//     setFormData(prev => ({ ...prev, [field]: value }));
//   };

//   const handleSocialSignup = (provider: string) => {
//     toast.info(`${provider} signup would be implemented here`);
//   };

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <Header />
      
//       <div className="py-16 px-4">
//         <div className="max-w-7xl mx-auto">
//           <div className="grid lg:grid-cols-3 gap-12">
//             {/* Main Content */}
//             <div className="lg:col-span-2">
//               {/* Hero Section */}
//               <div className="mb-12">
//                 <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
//                   Reach your goals faster with 1-to-1 help from an expert
//                 </h1>
//               </div>

//               {/* Signup Card */}
//               <Card className="bg-white shadow-sm max-w-md mx-auto lg:mx-0">
//                 <CardHeader className="text-center">
//                   <CardTitle className="text-2xl font-bold text-gray-900">Welcome to TutorConnect!</CardTitle>
//                   <p className="text-gray-600">Create a free account to contact tutors.</p>
//                   <p className="text-sm text-gray-500 mt-2">
//                     Already have an account?{' '}
//                     <Link href="/auth/user/login" className="text-blue-600 hover:underline">
//                       Log in.
//                     </Link>
//                   </p>
//                 </CardHeader>
                
//                 <CardContent className="space-y-4">
//                   <p className="text-xs text-gray-500 text-center">
//                     By signing up, I agree to TutorConnect's{' '}
//                     <Link href="/terms" className="text-blue-600 hover:underline">terms of use</Link>
//                     {' '}and{' '}
//                     <Link href="/privacy" className="text-blue-600 hover:underline">privacy policy</Link>.
//                   </p>

//                   {/* Social Signup Buttons */}
//                   <div className="space-y-3">
//                     <Button
//                       type="button"
//                       variant="outline"
//                       className="w-full h-12 border-gray-300 hover:bg-gray-50"
//                       onClick={() => handleSocialSignup('Google')}
//                     >
//                       <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
//                         <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
//                         <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
//                         <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
//                         <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
//                       </svg>
//                       Sign up with Google
//                     </Button>

//                     <Button
//                       type="button"
//                       variant="outline"
//                       className="w-full h-12 border-gray-300 hover:bg-gray-50"
//                       onClick={() => handleSocialSignup('Apple')}
//                     >
//                       <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="currentColor">
//                         <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
//                       </svg>
//                       Sign up with Apple
//                     </Button>

//                     <Button
//                       type="button"
//                       variant="outline"
//                       className="w-full h-12 border-gray-300 hover:bg-gray-50"
//                       onClick={() => handleSocialSignup('Facebook')}
//                     >
//                       <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="#1877F2">
//                         <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
//                       </svg>
//                       Sign up with Facebook
//                     </Button>
//                   </div>

//                   {/* Divider */}
//                   <div className="relative my-6">
//                     <div className="absolute inset-0 flex items-center">
//                       <div className="w-full border-t border-gray-300"></div>
//                     </div>
//                     <div className="relative flex justify-center text-sm">
//                       <span className="px-4 bg-white text-gray-500">Or</span>
//                     </div>
//                   </div>

//                   {/* Email Signup Button */}
//                   <Button 
//                     type="button" 
//                     className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-md"
//                     onClick={() => {
//                       // This would open a modal or navigate to email form
//                       toast.info('Email signup form would open here');
//                     }}
//                   >
//                     Sign up with email
//                   </Button>

//                   <div className="text-center mt-4">
//                     <p className="text-sm text-gray-600">
//                       Interested in becoming a tutor?{' '}
//                       <Link href="/auth/author/register" className="text-blue-600 hover:underline">
//                         Apply today.
//                       </Link>
//                     </p>
//                   </div>
//                 </CardContent>
//               </Card>

//               {/* Testimonial */}
//               <div className="mt-12 max-w-md mx-auto lg:mx-0">
//                 <Card className="bg-white shadow-sm">
//                   <CardContent className="p-6">
//                     <div className="flex items-start gap-4">
//                       <img 
//                         src="https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100"
//                         alt="Student testimonial"
//                         className="w-16 h-16 rounded-full object-cover"
//                       />
//                       <div>
//                         <div className="flex items-center gap-1 mb-2">
//                           <span className="text-green-600 font-medium">💬</span>
//                           <span className="text-green-600 font-medium">I found the best tutor!</span>
//                         </div>
//                         <p className="text-gray-600 text-sm mb-2">
//                           Thank you very much, I have the best tutor in the world. I learned much more in my 
//                           three days with your tutor than in a year of school. Thank you TutorConnect.
//                         </p>
//                         <p className="text-gray-400 text-xs">– Janet, Grand Prairie, TX</p>
//                       </div>
//                     </div>
//                   </CardContent>
//                 </Card>
//               </div>
//             </div>

//             {/* Sidebar */}
//             <div className="space-y-8">
//               {/* Featured In */}
//               <div>
//                 <p className="text-sm font-medium text-gray-500 mb-4 uppercase tracking-wide">FEATURED IN</p>
//                 <div className="flex flex-wrap items-center gap-4 opacity-60">
//                   <div className="text-gray-400 font-bold text-lg">Forbes</div>
//                   <div className="text-gray-400 font-bold text-lg">NBC</div>
//                   <div className="text-gray-400 font-bold text-lg">TIME</div>
//                   <div className="text-gray-400 font-bold text-lg">CNN</div>
//                   <div className="text-gray-400 font-bold text-lg">Chicago Tribune</div>
//                 </div>
//               </div>

//               {/* Benefits */}
//               <div className="space-y-6">
//                 <div className="flex items-start gap-3">
//                   <div className="bg-green-100 rounded-full p-1 mt-1">
//                     <Check className="h-4 w-4 text-green-600" />
//                   </div>
//                   <div>
//                     <h3 className="font-semibold text-gray-900 mb-2">Free to Sign Up</h3>
//                     <p className="text-gray-600 text-sm">
//                       You won't pay a thing until your lesson is complete. And our Good Fit Guarantee 
//                       means you'll love your lesson, or we'll cover the first hour.
//                     </p>
//                   </div>
//                 </div>

//                 <div className="flex items-start gap-3">
//                   <div className="bg-green-100 rounded-full p-1 mt-1">
//                     <Check className="h-4 w-4 text-green-600" />
//                   </div>
//                   <div>
//                     <h3 className="font-semibold text-gray-900 mb-2">Access 65,000+ Experts</h3>
//                     <p className="text-gray-600 text-sm">
//                       Welcome to the nation's largest network of 1-to-1 learning. Browse tutor 
//                       profiles, hourly rates and over one million reviews and ratings.
//                     </p>
//                   </div>
//                 </div>

//                 <div className="flex items-start gap-3">
//                   <div className="bg-green-100 rounded-full p-1 mt-1">
//                     <Check className="h-4 w-4 text-green-600" />
//                   </div>
//                   <div>
//                     <h3 className="font-semibold text-gray-900 mb-2">Find help in over 250 subjects</h3>
//                     <p className="text-gray-600 text-sm">
//                       There's no limit to what you can learn on TutorConnect. While most take lessons in 
//                       traditional academic subjects like math and science, students can also search for art, 
//                       music, and language tutors.
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
      
//       <Footer />
//     </div>
//   );
// }












// 'use client';

// import { useState } from 'react';
// import { signIn } from 'next-auth/react';
// import { Button } from '@/components/ui/button';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Header } from '@/components/layout/Header';
// import { Footer } from '@/components/layout/Footer';
// import Link from 'next/link';
// import { toast } from 'sonner';
// import { useRouter } from 'next/navigation';
// import { Check } from 'lucide-react';

// export default function StudentRegisterPage() {
//   const router = useRouter();

//   const [formData, setFormData] = useState({
//     firstName: '',
//     lastName:  '',
//     email:     '',
//     password:  '',
//     confirmPassword: '',
//     agreeToTerms: false,
//   });

//   const [showEmailForm, setShowEmailForm] = useState(false);
//   const [submitting, setSubmitting] = useState(false);
//   const [socialLoading, setSocialLoading] = useState<null | 'google' | 'facebook' | 'apple'>(null);

//   const handleInputChange = (field: string, value: string | boolean) => {
//     setFormData(prev => ({ ...prev, [field]: value }));
//   };

//   // SOCIAL SIGNUP -> NextAuth signIn (first-time = create user in DB via callback)
//   const handleSocialSignup = async (provider: 'google' | 'facebook' | 'apple') => {
//     setSocialLoading(provider);
//     try {
//       await signIn(provider, { callbackUrl: '/dashboard/student' });
//     } finally {
//       setSocialLoading(null);
//     }
//   };

//   // EMAIL SIGNUP -> POST /api/register -> auto login (credentials) -> redirect
//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!formData.agreeToTerms) {
//       toast.error('Please agree to the terms and conditions');
//       return;
//     }
//     if (formData.password !== formData.confirmPassword) {
//       toast.error('Passwords do not match');
//       return;
//     }

//     setSubmitting(true);
//     try {
//       const res = await fetch('/api/register', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           firstName: formData.firstName,
//           lastName: formData.lastName,
//           email: formData.email,
//           password: formData.password,
//         }),
//       });

//       if (!res.ok) {
//         const data = await res.json().catch(() => ({}));
//         toast.error(data?.message || 'Registration failed');
//         setSubmitting(false);
//         return;
//       }

//       toast.success('Account created! Signing you in…');

//       // auto login with credentials
//       const loginRes = await signIn('credentials', {
//         email: formData.email,
//         password: formData.password,
//         redirect: false,
//       });

//       if (loginRes?.ok) {
//         router.push('/dashboard/student');
//       } else {
//         toast.info('Account created. Please log in.');
//         router.push('/auth/user/login');
//       }
//     } catch (err) {
//       toast.error('Something went wrong');
//       console.error(err);
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <Header />

//       <div className="py-16 px-4">
//         <div className="max-w-7xl mx-auto">
//           <div className="grid lg:grid-cols-3 gap-12">
//             {/* Main Content */}
//             <div className="lg:col-span-2">
//               {/* Hero Section */}
//               <div className="mb-12">
//                 <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
//                   Reach your goals faster with 1-to-1 help from an expert
//                 </h1>
//               </div>

//               {/* Signup Card */}
//               <Card className="bg-white shadow-sm max-w-md mx-auto lg:mx-0">
//                 <CardHeader className="text-center">
//                   <CardTitle className="text-2xl font-bold text-gray-900">Welcome to TutorConnect!</CardTitle>
//                   <p className="text-gray-600">Create a free account to contact tutors.</p>
//                   <p className="text-sm text-gray-500 mt-2">
//                     Already have an account?{' '}
//                     <Link href="/auth/user/login" className="text-blue-600 hover:underline">
//                       Log in.
//                     </Link>
//                   </p>
//                 </CardHeader>

//                 <CardContent className="space-y-4">
//                   <p className="text-xs text-gray-500 text-center">
//                     By signing up, I agree to TutorConnect&apos;s{' '}
//                     <Link href="/terms" className="text-blue-600 hover:underline">terms of use</Link>
//                     {' '}and{' '}
//                     <Link href="/privacy" className="text-blue-600 hover:underline">privacy policy</Link>.
//                   </p>

//                   {/* Social Signup Buttons */}
//                   <div className="space-y-3">
//                     <Button
//                       type="button"
//                       variant="outline"
//                       className="w-full h-12 border-gray-300 hover:bg-gray-50"
//                       onClick={() => handleSocialSignup('google')}
//                       disabled={!!socialLoading || submitting}
//                     >
//                       <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" aria-hidden="true">
//                         <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
//                         <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
//                         <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
//                         <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
//                       </svg>
//                       {socialLoading === 'google' ? 'Please wait…' : 'Sign up with Google'}
//                     </Button>

//                     <Button
//                       type="button"
//                       variant="outline"
//                       className="w-full h-12 border-gray-300 hover:bg-gray-50"
//                       onClick={() => handleSocialSignup('apple')}
//                       disabled={!!socialLoading || submitting}
//                     >
//                       <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
//                         <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
//                       </svg>
//                       {socialLoading === 'apple' ? 'Please wait…' : 'Sign up with Apple'}
//                     </Button>

//                     <Button
//                       type="button"
//                       variant="outline"
//                       className="w-full h-12 border-gray-300 hover:bg-gray-50"
//                       onClick={() => handleSocialSignup('facebook')}
//                       disabled={!!socialLoading || submitting}
//                     >
//                       <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="#1877F2" aria-hidden="true">
//                         <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
//                       </svg>
//                       {socialLoading === 'facebook' ? 'Please wait…' : 'Sign up with Facebook'}
//                     </Button>
//                   </div>

//                   {/* Divider */}
//                   <div className="relative my-6">
//                     <div className="absolute inset-0 flex items-center">
//                       <div className="w-full border-t border-gray-300"></div>
//                     </div>
//                     <div className="relative flex justify-center text-sm">
//                       <span className="px-4 bg-white text-gray-500">Or</span>
//                     </div>
//                   </div>

//                   {/* Toggle Email Form */}
//                   {!showEmailForm ? (
//                     <Button
//                       type="button"
//                       className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-md"
//                       onClick={() => setShowEmailForm(true)}
//                       disabled={!!socialLoading}
//                     >
//                       Sign up with email
//                     </Button>
//                   ) : (
//                     <form onSubmit={handleSubmit} className="space-y-4">
//                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                         <div>
//                           <Label htmlFor="firstName" className="text-gray-700">First name</Label>
//                           <Input
//                             id="firstName"
//                             type="text"
//                             value={formData.firstName}
//                             onChange={(e) => handleInputChange('firstName', e.target.value)}
//                             className="mt-1 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
//                             required
//                           />
//                         </div>
//                         <div>
//                           <Label htmlFor="lastName" className="text-gray-700">Last name</Label>
//                           <Input
//                             id="lastName"
//                             type="text"
//                             value={formData.lastName}
//                             onChange={(e) => handleInputChange('lastName', e.target.value)}
//                             className="mt-1 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
//                             required
//                           />
//                         </div>
//                       </div>

//                       <div>
//                         <Label htmlFor="email" className="text-gray-700">Email</Label>
//                         <Input
//                           id="email"
//                           type="email"
//                           value={formData.email}
//                           onChange={(e) => handleInputChange('email', e.target.value)}
//                           className="mt-1 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
//                           required
//                         />
//                       </div>

//                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                         <div>
//                           <Label htmlFor="password" className="text-gray-700">Password</Label>
//                           <Input
//                             id="password"
//                             type="password"
//                             value={formData.password}
//                             onChange={(e) => handleInputChange('password', e.target.value)}
//                             className="mt-1 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
//                             required
//                           />
//                         </div>
//                         <div>
//                           <Label htmlFor="confirmPassword" className="text-gray-700">Confirm password</Label>
//                           <Input
//                             id="confirmPassword"
//                             type="password"
//                             value={formData.confirmPassword}
//                             onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
//                             className="mt-1 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
//                             required
//                           />
//                         </div>
//                       </div>

//                       <div className="flex items-center gap-2">
//                         <input
//                           id="terms"
//                           type="checkbox"
//                           checked={formData.agreeToTerms}
//                           onChange={(e) => handleInputChange('agreeToTerms', e.target.checked)}
//                           className="h-4 w-4"
//                           required
//                         />
//                         <Label htmlFor="terms" className="text-gray-700 text-sm">
//                           I agree to the <Link href="/terms" className="text-blue-600 hover:underline">terms</Link> and{' '}
//                           <Link href="/privacy" className="text-blue-600 hover:underline">privacy policy</Link>.
//                         </Label>
//                       </div>

//                       <div className="flex gap-3">
//                         <Button
//                           type="submit"
//                           className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-md"
//                           disabled={submitting || !!socialLoading}
//                         >
//                           {submitting ? 'Creating account…' : 'Create account'}
//                         </Button>
//                         <Button
//                           type="button"
//                           variant="outline"
//                           className="h-12"
//                           onClick={() => setShowEmailForm(false)}
//                           disabled={submitting}
//                         >
//                           Cancel
//                         </Button>
//                       </div>
//                     </form>
//                   )}

//                   <div className="text-center mt-4">
//                     <p className="text-sm text-gray-600">
//                       Interested in becoming a tutor?{' '}
//                       <Link href="/auth/author/register" className="text-blue-600 hover:underline">
//                         Apply today.
//                       </Link>
//                     </p>
//                   </div>
//                 </CardContent>
//               </Card>

//               {/* Testimonial */}
//               <div className="mt-12 max-w-md mx-auto lg:mx-0">
//                 <Card className="bg-white shadow-sm">
//                   <CardContent className="p-6">
//                     <div className="flex items-start gap-4">
//                       <img
//                         src="https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100"
//                         alt="Student testimonial"
//                         className="w-16 h-16 rounded-full object-cover"
//                       />
//                       <div>
//                         <div className="flex items-center gap-1 mb-2">
//                           <span className="text-green-600 font-medium">💬</span>
//                           <span className="text-green-600 font-medium">I found the best tutor!</span>
//                         </div>
//                         <p className="text-gray-600 text-sm mb-2">
//                           Thank you very much, I have the best tutor in the world. I learned much more in my
//                           three days with your tutor than in a year of school. Thank you TutorConnect.
//                         </p>
//                         <p className="text-gray-400 text-xs">– Janet, Grand Prairie, TX</p>
//                       </div>
//                     </div>
//                   </CardContent>
//                 </Card>
//               </div>
//             </div>

//             {/* Sidebar */}
//             <div className="space-y-8">
//               <div>
//                 <p className="text-sm font-medium text-gray-500 mb-4 uppercase tracking-wide">FEATURED IN</p>
//                 <div className="flex flex-wrap items-center gap-4 opacity-60">
//                   <div className="text-gray-400 font-bold text-lg">Forbes</div>
//                   <div className="text-gray-400 font-bold text-lg">NBC</div>
//                   <div className="text-gray-400 font-bold text-lg">TIME</div>
//                   <div className="text-gray-400 font-bold text-lg">CNN</div>
//                   <div className="text-gray-400 font-bold text-lg">Chicago Tribune</div>
//                 </div>
//               </div>

//               <div className="space-y-6">
//                 <div className="flex items-start gap-3">
//                   <div className="bg-green-100 rounded-full p-1 mt-1">
//                     <Check className="h-4 w-4 text-green-600" />
//                   </div>
//                   <div>
//                     <h3 className="font-semibold text-gray-900 mb-2">Free to Sign Up</h3>
//                     <p className="text-gray-600 text-sm">
//                       You won't pay a thing until your lesson is complete. And our Good Fit Guarantee
//                       means you'll love your lesson, or we'll cover the first hour.
//                     </p>
//                   </div>
//                 </div>

//                 <div className="flex items-start gap-3">
//                   <div className="bg-green-100 rounded-full p-1 mt-1">
//                     <Check className="h-4 w-4 text-green-600" />
//                   </div>
//                   <div>
//                     <h3 className="font-semibold text-gray-900 mb-2">Access 65,000+ Experts</h3>
//                     <p className="text-gray-600 text-sm">
//                       Welcome to the nation's largest network of 1-to-1 learning. Browse tutor
//                       profiles, hourly rates and over one million reviews and ratings.
//                     </p>
//                   </div>
//                 </div>

//                 <div className="flex items-start gap-3">
//                   <div className="bg-green-100 rounded-full p-1 mt-1">
//                     <Check className="h-4 w-4 text-green-600" />
//                   </div>
//                   <div>
//                     <h3 className="font-semibold text-gray-900 mb-2">Find help in over 250 subjects</h3>
//                     <p className="text-gray-600 text-sm">
//                       There's no limit to what you can learn on TutorConnect. While most take lessons in
//                       traditional academic subjects like math and science, students can also search for art,
//                       music, and language tutors.
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>      

//       <Footer />
//     </div>
//   );
// }
















// // 'use client';

// // import { useState } from 'react';
// // import { Button } from '@/components/ui/button';
// // import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// // import { Input } from '@/components/ui/input';
// // import { Label } from '@/components/ui/label';
// // import { Checkbox } from '@/components/ui/checkbox';
// // import { Header } from '@/components/layout/Header';
// // import { Footer } from '@/components/layout/Footer';
// // import Link from 'next/link';
// // import { toast } from 'sonner';
// // import { useRouter } from 'next/navigation';
// // import { Check } from 'lucide-react';

// // export default function StudentRegisterPage() {
// //   const router = useRouter();
// //   const [formData, setFormData] = useState({
// //     firstName: '',
// //     lastName: '',
// //     email: '',
// //     password: '',
// //     confirmPassword: '',
// //     agreeToTerms: false,
// //   });

// //   const handleSubmit = async (e: React.FormEvent) => {
// //     e.preventDefault();
    
// //     if (formData.password !== formData.confirmPassword) {
// //       toast.error('Passwords do not match');
// //       return;
// //     }

// //     if (!formData.agreeToTerms) {
// //       toast.error('Please agree to the terms and conditions');
// //       return;
// //     }

// //     // Simulate registration
// //     toast.success('Registration successful! Please check your email to verify your account.');
// //     router.push('/auth/user/login');
// //   };

// //   const handleInputChange = (field: string, value: string | boolean) => {
// //     setFormData(prev => ({ ...prev, [field]: value }));
// //   };

// //   const handleSocialSignup = (provider: string) => {
// //     toast.info(`${provider} signup would be implemented here`);
// //   };

// //   return (
// //     <div className="min-h-screen bg-gray-50">
// //       <Header />
      
// //       <div className="py-16 px-4">
// //         <div className="max-w-7xl mx-auto">
// //           <div className="grid lg:grid-cols-3 gap-12">
// //             {/* Main Content */}
// //             <div className="lg:col-span-2">
// //               {/* Hero Section */}
// //               <div className="mb-12">
// //                 <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
// //                   Reach your goals faster with 1-to-1 help from an expert
// //                 </h1>
// //               </div>

// //               {/* Signup Card */}
// //               <Card className="bg-white shadow-sm max-w-md mx-auto lg:mx-0">
// //                 <CardHeader className="text-center">
// //                   <CardTitle className="text-2xl font-bold text-gray-900">Welcome to TutorConnect!</CardTitle>
// //                   <p className="text-gray-600">Create a free account to contact tutors.</p>
// //                   <p className="text-sm text-gray-500 mt-2">
// //                     Already have an account?{' '}
// //                     <Link href="/auth/user/login" className="text-blue-600 hover:underline">
// //                       Log in.
// //                     </Link>
// //                   </p>
// //                 </CardHeader>
                
// //                 <CardContent className="space-y-4">
// //                   <p className="text-xs text-gray-500 text-center">
// //                     By signing up, I agree to TutorConnect's{' '}
// //                     <Link href="/terms" className="text-blue-600 hover:underline">terms of use</Link>
// //                     {' '}and{' '}
// //                     <Link href="/privacy" className="text-blue-600 hover:underline">privacy policy</Link>.
// //                   </p>

// //                   {/* Social Signup Buttons */}
// //                   <div className="space-y-3">
// //                     <Button
// //                       type="button"
// //                       variant="outline"
// //                       className="w-full h-12 border-gray-300 hover:bg-gray-50"
// //                       onClick={() => handleSocialSignup('Google')}
// //                     >
// //                       <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
// //                         <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
// //                         <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
// //                         <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
// //                         <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
// //                       </svg>
// //                       Sign up with Google
// //                     </Button>

// //                     <Button
// //                       type="button"
// //                       variant="outline"
// //                       className="w-full h-12 border-gray-300 hover:bg-gray-50"
// //                       onClick={() => handleSocialSignup('Apple')}
// //                     >
// //                       <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="currentColor">
// //                         <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
// //                       </svg>
// //                       Sign up with Apple
// //                     </Button>

// //                     <Button
// //                       type="button"
// //                       variant="outline"
// //                       className="w-full h-12 border-gray-300 hover:bg-gray-50"
// //                       onClick={() => handleSocialSignup('Facebook')}
// //                     >
// //                       <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="#1877F2">
// //                         <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
// //                       </svg>
// //                       Sign up with Facebook
// //                     </Button>
// //                   </div>

// //                   {/* Divider */}
// //                   <div className="relative my-6">
// //                     <div className="absolute inset-0 flex items-center">
// //                       <div className="w-full border-t border-gray-300"></div>
// //                     </div>
// //                     <div className="relative flex justify-center text-sm">
// //                       <span className="px-4 bg-white text-gray-500">Or</span>
// //                     </div>
// //                   </div>

// //                   {/* Email Signup Button */}
// //                   <Button 
// //                     type="button" 
// //                     className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-md"
// //                     onClick={() => {
// //                       // This would open a modal or navigate to email form
// //                       toast.info('Email signup form would open here');
// //                     }}
// //                   >
// //                     Sign up with email
// //                   </Button>

// //                   <div className="text-center mt-4">
// //                     <p className="text-sm text-gray-600">
// //                       Interested in becoming a tutor?{' '}
// //                       <Link href="/auth/author/register" className="text-blue-600 hover:underline">
// //                         Apply today.
// //                       </Link>
// //                     </p>
// //                   </div>
// //                 </CardContent>
// //               </Card>

// //               {/* Testimonial */}
// //               <div className="mt-12 max-w-md mx-auto lg:mx-0">
// //                 <Card className="bg-white shadow-sm">
// //                   <CardContent className="p-6">
// //                     <div className="flex items-start gap-4">
// //                       <img 
// //                         src="https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100"
// //                         alt="Student testimonial"
// //                         className="w-16 h-16 rounded-full object-cover"
// //                       />
// //                       <div>
// //                         <div className="flex items-center gap-1 mb-2">
// //                           <span className="text-green-600 font-medium">💬</span>
// //                           <span className="text-green-600 font-medium">I found the best tutor!</span>
// //                         </div>
// //                         <p className="text-gray-600 text-sm mb-2">
// //                           Thank you very much, I have the best tutor in the world. I learned much more in my 
// //                           three days with your tutor than in a year of school. Thank you TutorConnect.
// //                         </p>
// //                         <p className="text-gray-400 text-xs">– Janet, Grand Prairie, TX</p>
// //                       </div>
// //                     </div>
// //                   </CardContent>
// //                 </Card>
// //               </div>
// //             </div>

// //             {/* Sidebar */}
// //             <div className="space-y-8">
// //               {/* Featured In */}
// //               <div>
// //                 <p className="text-sm font-medium text-gray-500 mb-4 uppercase tracking-wide">FEATURED IN</p>
// //                 <div className="flex flex-wrap items-center gap-4 opacity-60">
// //                   <div className="text-gray-400 font-bold text-lg">Forbes</div>
// //                   <div className="text-gray-400 font-bold text-lg">NBC</div>
// //                   <div className="text-gray-400 font-bold text-lg">TIME</div>
// //                   <div className="text-gray-400 font-bold text-lg">CNN</div>
// //                   <div className="text-gray-400 font-bold text-lg">Chicago Tribune</div>
// //                 </div>
// //               </div>

// //               {/* Benefits */}
// //               <div className="space-y-6">
// //                 <div className="flex items-start gap-3">
// //                   <div className="bg-green-100 rounded-full p-1 mt-1">
// //                     <Check className="h-4 w-4 text-green-600" />
// //                   </div>
// //                   <div>
// //                     <h3 className="font-semibold text-gray-900 mb-2">Free to Sign Up</h3>
// //                     <p className="text-gray-600 text-sm">
// //                       You won't pay a thing until your lesson is complete. And our Good Fit Guarantee 
// //                       means you'll love your lesson, or we'll cover the first hour.
// //                     </p>
// //                   </div>
// //                 </div>

// //                 <div className="flex items-start gap-3">
// //                   <div className="bg-green-100 rounded-full p-1 mt-1">
// //                     <Check className="h-4 w-4 text-green-600" />
// //                   </div>
// //                   <div>
// //                     <h3 className="font-semibold text-gray-900 mb-2">Access 65,000+ Experts</h3>
// //                     <p className="text-gray-600 text-sm">
// //                       Welcome to the nation's largest network of 1-to-1 learning. Browse tutor 
// //                       profiles, hourly rates and over one million reviews and ratings.
// //                     </p>
// //                   </div>
// //                 </div>

// //                 <div className="flex items-start gap-3">
// //                   <div className="bg-green-100 rounded-full p-1 mt-1">
// //                     <Check className="h-4 w-4 text-green-600" />
// //                   </div>
// //                   <div>
// //                     <h3 className="font-semibold text-gray-900 mb-2">Find help in over 250 subjects</h3>
// //                     <p className="text-gray-600 text-sm">
// //                       There's no limit to what you can learn on TutorConnect. While most take lessons in 
// //                       traditional academic subjects like math and science, students can also search for art, 
// //                       music, and language tutors.
// //                     </p>
// //                   </div>
// //                 </div>
// //               </div>
// //             </div>
// //           </div>
// //         </div>
// //       </div>
      
// //       <Footer />
// //     </div>
// //   );
// // }