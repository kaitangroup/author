"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [showResetForm, setShowResetForm] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const apiUrl = process.env.NEXT_PUBLIC_WP_CUSTOM_API;

  // STEP 1 — Verify Email
  const handleVerifyEmail = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${apiUrl}/forgot-password-direct`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      console.log("Email Verify Response:", data);

      if (!res.ok || !data.success) {
        toast.error(data?.message || "Email not found!");
      } else {
        toast.success("Email matched. Set your new password.");
        setShowResetForm(true);
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  // STEP 2 — Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${apiUrl}/reset-password-direct`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password: newPassword,
        }),
      });

      const data = await res.json();
      console.log("Reset Direct Response:", data);

      if (!res.ok || !data.success) {
        toast.error(data?.message || "Password reset failed");
      } else {
        toast.success("Password changed successfully!");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="py-16 px-4">
        <div className="max-w-lg mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Forgot Password</CardTitle>
            </CardHeader>

            <CardContent>
              
              {!showResetForm && (
                <form onSubmit={handleVerifyEmail} className="space-y-4">
                  <div>
                    <label className="block mb-1">Enter your email</label>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 text-white h-12"
                  >
                    {loading ? "Checking…" : "Verify Email"}
                  </Button>
                </form>
              )}

              {showResetForm && (
                <form onSubmit={handleResetPassword} className="space-y-4 mt-6">
                  <div>
                    <label className="block mb-1">New Password</label>
                    <Input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-green-600 text-white h-12"
                  >
                    {loading ? "Updating…" : "Change Password"}
                  </Button>
                </form>
              )}

              <div className="text-center mt-4">
                <Link href="/auth/user/login" className="text-blue-600 hover:underline text-sm">
                  Back to login
                </Link>
              </div>

            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}
