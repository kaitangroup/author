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
  const apiUrl = process.env.NEXT_PUBLIC_WP_URL;
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    firstName: '',
    lastName: '',
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
      const res = await fetch(`${apiUrl}/wp-json/custom/v1/register`, {
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

                {/* <Button
                  type="button"
                  variant="outline"
                  className="w-full h-12 flex items-center justify-center border-gray-300 hover:bg-gray-50"
                  onClick={() => handleSocialSignup("apple")}
                  disabled={!!socialLoading}
                >
                  <FaApple className="w-5 h-5 mr-2 text-black" />
                  {socialLoading === "apple" ? "Please wait…" : "Sign up with Apple"}
                </Button> */}

                {/* <Button
                  type="button"
                  variant="outline"
                  className="w-full h-12 flex items-center justify-center border-gray-300 hover:bg-gray-50"
                  onClick={() => handleSocialSignup("facebook")}
                  disabled={!!socialLoading}
                >
                  <FaFacebook className="w-5 h-5 mr-2 text-blue-600" />
                  {socialLoading === "facebook" ? "Please wait…" : "Sign up with Facebook"}
                </Button> */}
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

