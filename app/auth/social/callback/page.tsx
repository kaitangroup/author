"use client";

import { useEffect } from "react";
import { getSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function SocialCallback() {
  const router = useRouter();
  const apiUrl = process.env.NEXT_PUBLIC_WP_URL;

  useEffect(() => {
    const processLogin = async () => {
      const session = await getSession();

      if (!session?.wpToken) {
        router.replace("/auth/user/login");
        return;
      }

      const token = session.wpToken;
      localStorage.setItem("wpToken", token);

      const res = await fetch(`${apiUrl}wp-json/custom/v1/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const profile = await res.json();

      if (!res.ok) {
        router.replace("/auth/user/login");
        return;
      }

      localStorage.setItem("wpUserdata", JSON.stringify(profile));

      // Redirect logic
      if (profile.role === "author") {
        if (profile.profile_completed == "100") {
          router.replace("/dashboard/author");
        } else {
          router.replace("/apply");
        }
      } else if (
        profile.role === "subscriber" ||
        profile.role === "student"
      ) {
        router.replace("/dashboard/student");
      } else {
        router.replace("/");
      }
    };

    processLogin();
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen text-gray-700">
      Processing login… please wait.
    </div>
  );
}
