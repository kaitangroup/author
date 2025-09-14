// import type { NextAuthOptions } from "next-auth";
// import GoogleProvider from "next-auth/providers/google";
// import FacebookProvider from "next-auth/providers/facebook";
// import AppleProvider from "next-auth/providers/apple";
// import CredentialsProvider from "next-auth/providers/credentials";
// import { getSession, signIn } from "next-auth/react";
// import { toast } from "sonner";
// import router from "next/router";

// export const authOptions: NextAuthOptions = {
//   providers: [
//     GoogleProvider({
//       clientId: process.env.GOOGLE_CLIENT_ID!,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
//     }),

//     FacebookProvider({
//       clientId: process.env.FACEBOOK_CLIENT_ID!,
//       clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
//     }),

//     // AppleProvider({
//     //   clientId: process.env.APPLE_CLIENT_ID!,
//     //   clientSecret: {
//     //     teamId: process.env.APPLE_TEAM_ID!,
//     //     privateKey: process.env.APPLE_PRIVATE_KEY!,
//     //     keyId: process.env.APPLE_KEY_ID!,
//     //   },
//     // }),

//     AppleProvider({
//       clientId: process.env.APPLE_CLIENT_ID!,
//       clientSecret: process.env.APPLE_CLIENT_SECRET!, // must be a string
//     }),
    
    

//     // Normal WordPress login
//     CredentialsProvider({
//       name: "Credentials",
//       credentials: {
//         username: { label: "Username", type: "text" },
//         password: { label: "Password", type: "password" },
//       },
//       async authorize(credentials) {
//         if (!credentials?.username || !credentials?.password) return null;

//         const res = await fetch(`${process.env.WP_URL}/wp-json/jwt-auth/v1/token`, {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({
//             username: credentials.username,
//             password: credentials.password,
//           }),
//         });

//         const data = await res.json();

//         if (!res.ok || !data?.token) {
//           throw new Error(data?.message || "Invalid login");
//         }

//         return {
//           id: data.user_id?.toString() || "0",
//           name: data.user_display_name || credentials.username,
//           email: data.user_email,
//           token: data.token,
//           role: "student",
//         } as any;
//       },
//     }),
//   ],

//   session: { strategy: "jwt" },

//   pages: {
//     signIn: "/auth/user/login",
//   },

//   callbacks: {
//     // ✅ Social Login success হলে WordPress API তে sync করবো
//     async signIn({ user, account }) {
//       if (account?.provider === "google" || account?.provider === "facebook" || account?.provider === "apple") {
//         try {
//           const res = await fetch(`${process.env.WP_URL}/wp-json/custom/v1/social-login`, {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({
//               email: user.email,
//               name: user.name,
//               provider: account.provider,
//             }),
//           });

//           const data = await res.json();
//           localStorage.setItem("wpToken", 'testtoken');
//           if (res.ok && data?.token) {
           
//             (user as any).token = data.token;   // WP JWT Token
//             (user as any).role = "student";     // Default role
            
            
//           //  toast.success("Login successful!");
//           //  router.push("/dashboard/student"); // ✅ Redirect after token is saved
            
//           } else {
//             console.error("WP Social Login Error:", data);
//           }
//         } catch (err) {
//           console.error("WP Social Login Sync Error:", err);
//         }
//       }
//       return true;
//     },

//     async jwt({ token, user }) {
//       if (user) {
//         token.role = (user as any).role ?? "user";
//         token.wpToken = (user as any).token ?? null;
//       }
//       return token;
//     },

//     async session({ session, token }) {
//       (session as any).role = token.role ?? "user";
//       (session as any).wpToken = token.wpToken ?? null;
//       return session;
//     },
//   },
// };



import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import AppleProvider from "next-auth/providers/apple";
import CredentialsProvider from "next-auth/providers/credentials";

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
          const res = await fetch(`${process.env.WP_URL}/wp-json/authorconnect/v1/social-login`, {
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




