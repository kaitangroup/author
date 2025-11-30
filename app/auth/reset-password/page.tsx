"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export default function ResetPasswordPage() {
  const params = useSearchParams();
  const router = useRouter();

  // read raw values from URL
  const rawKey = params.get("key") || "";
  const rawLogin = params.get("login") || "";

  // decode once (WP encoded with rawurlencode)
  const key = decodeURIComponent(rawKey);
  const login = decodeURIComponent(rawLogin);

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const apiUrl = process.env.NEXT_PUBLIC_WP_CUSTOM_API; // e.g. http://authorproback.me/wp-json/custom/v1

  useEffect(() => {
    if (!key || !login) {
      toast.error("Invalid reset link. Use the link from your email.");
    } else {
      console.log("Decoded reset key:", key);
      console.log("Decoded login:", login);
    }
  }, [key, login]);


    const handleReset = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!key || !login) {
      toast.error("Invalid reset link.");
      return;
    }
    if (!password || password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      toast.error("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${apiUrl}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          login: login,
          key: key,
          password: password
        }),
      });

      const data = await res.json();
      console.log("RESET API status:", res.status, "data:", data);

      if (!res.ok) {
        toast.error(data?.message || "Reset failed. Link may be expired or incorrect.");
      } else {
        toast.success("Password reset successful! Redirecting to login...");
        setTimeout(() => router.push("/auth/user/login"), 1200);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      toast.error("Something went wrong (network). Check console.");
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
              <CardTitle className="text-xl font-semibold">Reset Password</CardTitle>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleReset} className="space-y-4">
                <div>
                  <label className="block mb-1">New Password</label>
                  <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>

                <div>
                  <label className="block mb-1">Confirm Password</label>
                  <Input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
                </div>

                <Button type="submit" disabled={loading} className="w-full h-12 bg-green-600 text-white">
                  {loading ? "Updating…" : "Reset Password"}
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
