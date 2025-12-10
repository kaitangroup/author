"use client";

import { useEffect, useState } from "react";
import { getSession, signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import Link from "next/link";
import { toast } from "sonner";
// import { useRouter } from "next/navigation";
import { useRouter, useSearchParams } from "next/navigation"; // ⬅️ added useSearchParams

// social icons
import { FaGoogle, FaFacebook, FaApple } from "react-icons/fa";

export default function StudentLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect"); // ⬅️ jekhane theke esecho
  const apiUrl = process.env.NEXT_PUBLIC_WP_URL;

  const [formData, setFormData] = useState({ username: "", password: "" });
  const [submitting, setSubmitting] = useState(false);
  const [socialLoading, setSocialLoading] = useState<null | "google" | "apple" | "facebook">(null);


  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    const token = localStorage.getItem("wpToken");
  
    if (!token) return;
  
    // if user already logged in → redirect away from login page
    const checkProfile = async () => {
      try {
        const res = await fetch(`${apiUrl}wp-json/custom/v1/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
  
        const profile = await res.json();
  
        if (!res.ok) return;
  
        // save in localStorage for Header use
        localStorage.setItem("wpUserdata", JSON.stringify(profile));
  
        if (profile.role === "author") {
          if (profile.profile_completed == "100") {
            router.replace("/dashboard/author");
          } else {
            router.replace("/apply");
          }
        } else if (profile.role === "subscriber" || profile.role === "student") {
          router.replace("/dashboard/student");
        } else {
          router.replace("/");
        }
      } catch (e) {
        console.error("Auto-redirect failed:", e);
      }
    };
  
    checkProfile();
  }, []);
  

  // ✅ Social Login (NextAuth + WP API)
  // const handleSocialLogin = async (provider: "google" | "apple" | "facebook") => {
  //   try {
  //     setSocialLoading(provider);
  //     console.log("🔹 Social Login Start:", provider);
  
  //     // NextAuth signIn (no redirect yet)
  //     await signIn(provider, { callbackUrl: "/dashboard/student" });


  
  
  //   } catch (err) {
  //     console.error(`❌ Login with ${provider} failed:`, err);
  //     toast.error(`Login with ${provider} failed`);
  //   } finally {
  //     setSocialLoading(null);
  //   }
  // };

  const handleSocialLogin = async (provider: "google" | "facebook") => {
    try {
      setSocialLoading(provider);
  
      // FULL REDIRECT FLOW
      await signIn(provider, {
        callbackUrl: "/auth/social/callback", // We will process everything here
      });
  
    } catch (err) {
      console.error("Social login error:", err);
      toast.error("Login failed");
    } finally {
      setSocialLoading(null);
    }
  };
  
  
  
  

  // ✅ WordPress Username/Password Login
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch(`${apiUrl}wp-json/jwt-auth/v1/token`, {
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
        toast.error(
          <div dangerouslySetInnerHTML={{ __html: data?.message || "Login failed" }} />
        );
      } else {
        localStorage.setItem("wpToken", data.token);
        localStorage.setItem("wpUser", data.user_display_name || formData.username);
        const token = data.token;
        const response = await fetch(`${apiUrl}wp-json/custom/v1/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
       
        const profiledata = await response.json();
        if (!response.ok) {
          toast.error(profiledata?.message || "Login failed");
          console.log("❌ Profile Fetch Error:", profiledata);
        } 
        
        localStorage.setItem("wpUserdata",  JSON.stringify(profiledata));
        toast.success("Login successful!");
        if(profiledata.role == 'author'){
          console.log("profiledata.profile_completed",profiledata.profile_completed);
          if(profiledata.profile_completed == '100'){
            router.push("/dashboard/author");
          
          }else{
            router.push("/apply");
          
          }
          
        }else{
          router.push("/dashboard/student");
        }

        if(redirect){
          router.push(redirect);
        }
        
      }
    } catch (err) {
      console.error("❌ WP JWT Error:", err);
      toast.error("Something went wrong!");
    } finally {
      setSubmitting(false);
    }
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
                    Don&apos;t have an account?{" "}
                    <Link href="/auth/user/register" className="text-blue-600 hover:underline">
                      Sign up for free.
                    </Link>
                  </p>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* ✅ Social Login Buttons */}
                  <div className="space-y-3">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full h-12 border-gray-300 hover:bg-gray-50 flex items-center justify-center"
                      onClick={() => handleSocialLogin("google")}
                      disabled={!!socialLoading}
                    >
                      <FaGoogle className="w-5 h-5 mr-2 text-red-500" />
                      {socialLoading === "google" ? "Please wait…" : "Log in with Google"}
                    </Button>

                    {/* <Button
                      type="button"
                      variant="outline"
                      className="w-full h-12 border-gray-300 hover:bg-gray-50 flex items-center justify-center"
                      onClick={() => handleSocialLogin("apple")}
                      disabled={!!socialLoading}
                    >
                      <FaApple className="w-5 h-5 mr-2 text-black" />
                      {socialLoading === "apple" ? "Please wait…" : "Log in with Apple"}
                    </Button> */}

                    {/* <Button
                      type="button"
                      variant="outline"
                      className="w-full h-12 border-gray-300 hover:bg-gray-50 flex items-center justify-center"
                      onClick={() => handleSocialLogin("facebook")}
                      disabled={!!socialLoading}
                    >
                      <FaFacebook className="w-5 h-5 mr-2 text-blue-600" />
                      {socialLoading === "facebook" ? "Please wait…" : "Log in with Facebook"}
                    </Button> */}
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

                  {/* ✅ WordPress Login Form */}
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="username" className="text-gray-700">
                        Username
                      </Label>
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
                      <Label htmlFor="password" className="text-gray-700">
                        Password
                      </Label>
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
                      className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-md"
                      disabled={submitting || !!socialLoading}
                    >
                      {submitting ? "Signing in…" : "Log in"}
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
  <Card className="bg-white shadow-sm">
    <CardContent className="p-6 text-center">  {/* <-- added text-center */}
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        New to AuthorConnect?
      </h3>

      <div className="space-y-3 flex flex-col items-center justify-center"> 
        {/* <-- added flex + items-center (center horizontally) */}
        
        <Link
          href="/auth/user/register"
          className="text-blue-600 hover:underline"
        >
          Register as a User
        </Link>

        <Link
          href="/auth/author/register"
          className="text-blue-600 hover:underline"
        >
          Apply to become an Author
        </Link>
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






