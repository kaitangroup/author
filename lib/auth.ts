import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import AppleProvider from "next-auth/providers/apple";
import CredentialsProvider from "next-auth/providers/credentials";
import { getSession } from "next-auth/react";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    }),

    AppleProvider({
      clientId: process.env.APPLE_CLIENT_ID!,
      clientSecret: process.env.APPLE_CLIENT_SECRET!, // must be a string
    }),

    // Normal WordPress login (JWT)
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;

        const res = await fetch(`${process.env.WP_URL}/wp-json/jwt-auth/v1/token`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: credentials.username,
            password: credentials.password,
          }),
        });

        const data = await res.json();

        if (!res.ok || !data?.token) {
          throw new Error(data?.message || "Invalid login");
        }

        return {
          id: data.user_id?.toString() || "0",
          name: data.user_display_name || credentials.username,
          email: data.user_email,
          token: data.token,         // ✅ WP JWT
          role: "student",
        } as any;
      },
    }),
  ],

  session: { strategy: "jwt" },

  pages: {
    signIn: "/auth/user/login",
  },

  callbacks: {
    // ✅ Social login -> WP তে JWT ইস্যু
    async signIn({ user, account }) {
      if (account?.provider === "google" || account?.provider === "facebook" || account?.provider === "apple") {
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_WP_URL}/wp-json/custom/v1/social-login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: user.email,
              name: user.name,
              provider: account.provider,
            }),
          });

          const data = await res.json();

          if (res.ok && data?.token) {
            (user as any).token = data.token;   // ✅ আসল WP JWT
            (user as any).role  = "student";
           
          } else {
      
            console.error("WP Social Login Error:", data);
          }
        } catch (err) {
          console.error("WP Social Login Sync Error:", err);
        }
      }
      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        token.role    = (user as any).role ?? "user";
        token.wpToken = (user as any).token ?? null; // ✅ client/session থেকে ব্যবহার করবে
      }
      return token;
    },

    async session({ session, token }) {
      (session as any).role    = token.role ?? "user";
      (session as any).wpToken = token.wpToken ?? null;
      return session;
    },
  },
};




