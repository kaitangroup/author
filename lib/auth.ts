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
      clientSecret: {
        teamId: process.env.APPLE_TEAM_ID!,
        privateKey: process.env.APPLE_PRIVATE_KEY!,
        keyId: process.env.APPLE_KEY_ID!,
      },
    }),

    // Normal WordPress login
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
          token: data.token,
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
    // ✅ Social Login success হলে WordPress API তে sync করবো
    async signIn({ user, account }) {
      if (account?.provider === "google" || account?.provider === "facebook" || account?.provider === "apple") {
        try {
          const res = await fetch(`${process.env.WP_URL}/wp-json/custom/v1/social-login`, {
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
            (user as any).token = data.token;   // WP JWT Token
            (user as any).role = "student";     // Default role
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
        token.role = (user as any).role ?? "user";
        token.wpToken = (user as any).token ?? null;
      }
      return token;
    },

    async session({ session, token }) {
      (session as any).role = token.role ?? "user";
      (session as any).wpToken = token.wpToken ?? null;
      return session;
    },
  },
};
















// import type { NextAuthOptions } from "next-auth";
// import GoogleProvider from "next-auth/providers/google";
// import FacebookProvider from "next-auth/providers/facebook";
// import AppleProvider from "next-auth/providers/apple";
// import CredentialsProvider from "next-auth/providers/credentials";

// export const authOptions: NextAuthOptions = {
//   providers: [
//     // 🔹 Google Login
//     GoogleProvider({
//       clientId: process.env.GOOGLE_CLIENT_ID!,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
//     }),

//     // 🔹 Facebook Login
//     FacebookProvider({
//       clientId: process.env.FACEBOOK_CLIENT_ID!,
//       clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
//     }),

//     // 🔹 Apple Login
//     AppleProvider({
//       clientId: process.env.APPLE_CLIENT_ID!,
//       clientSecret: {
//         teamId: process.env.APPLE_TEAM_ID!,
//         privateKey: process.env.APPLE_PRIVATE_KEY!,
//         keyId: process.env.APPLE_KEY_ID!,
//       },
//     }),

//     // 🔹 WordPress Username/Password Login
//     CredentialsProvider({
//       name: "Credentials",
//       credentials: {
//         username: { label: "Username", type: "text" },
//         password: { label: "Password", type: "password" },
//       },
//       async authorize(credentials) {
//         if (!credentials?.username || !credentials?.password) return null;

//         try {
//           const res = await fetch(
//             `${process.env.WP_URL}/wp-json/jwt-auth/v1/token`,
//             {
//               method: "POST",
//               headers: { "Content-Type": "application/json" },
//               body: JSON.stringify({
//                 username: credentials.username,
//                 password: credentials.password,
//               }),
//             }
//           );

//           const data = await res.json();

//           if (!res.ok || !data?.token) {
//             throw new Error(data?.message || "Invalid login");
//           }

//           return {
//             id: data.user_id?.toString() || "0",
//             name: data.user_display_name || credentials.username,
//             email: data.user_email,
//             token: data.token, // ✅ WP JWT Token
//             role: "student",
//           } as any;
//         } catch (err) {
//           console.error("WordPress login error:", err);
//           return null;
//         }
//       },
//     }),
//   ],

//   session: { strategy: "jwt" },

//   pages: {
//     signIn: "/auth/user/login", // custom login page
//   },

//   callbacks: {
//     // 🔹 Social Login → WordPress DB তে User Add
//     async signIn({ user, account }) {
//       if (
//         account?.provider === "google" ||
//         account?.provider === "facebook" ||
//         account?.provider === "apple"
//       ) {
//         try {
//           const res = await fetch(
//             `${process.env.WP_URL}/wp-json/custom/v1/social-login`,
//             {
//               method: "POST",
//               headers: { "Content-Type": "application/json" },
//               body: JSON.stringify({
//                 email: user.email,
//                 name: user.name,
//                 provider: account.provider,
//               }),
//             }
//           );

//           const data = await res.json();

//           if (res.ok && data?.token) {
//             (user as any).token = data.token; // ✅ WP JWT
//             (user as any).role = "student";   // default role
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
//         token.wpToken = (user as any).token ?? null; // ✅ WP Token রাখলাম
//       }
//       return token;
//     },

//     async session({ session, token }) {
//       (session as any).role = token.role ?? "user";
//       (session as any).wpToken = token.wpToken ?? null; // ✅ client side এ পাঠালাম
//       return session;
//     },
//   },
// };

























// import type { NextAuthOptions } from "next-auth";
// import GoogleProvider from "next-auth/providers/google";
// import FacebookProvider from "next-auth/providers/facebook";
// import AppleProvider from "next-auth/providers/apple";
// import CredentialsProvider from "next-auth/providers/credentials";

// export const authOptions: NextAuthOptions = {
//   providers: [
//     // Google Login
//     GoogleProvider({
//       clientId: process.env.GOOGLE_CLIENT_ID!,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
//     }),

//     // Facebook Login
//     FacebookProvider({
//       clientId: process.env.FACEBOOK_CLIENT_ID!,
//       clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
//     }),

//     // Apple Login
//     AppleProvider({
//       clientId: process.env.APPLE_CLIENT_ID!,
//       clientSecret: {
//         teamId: process.env.APPLE_TEAM_ID!,
//         privateKey: process.env.APPLE_PRIVATE_KEY!,
//         keyId: process.env.APPLE_KEY_ID!,
//       },
//     }),

//     // WordPress Username/Password Login
//     CredentialsProvider({
//       name: "Credentials",
//       credentials: {
//         username: { label: "Username", type: "text" },
//         password: { label: "Password", type: "password" },
//       },
//       async authorize(credentials) {
//         if (!credentials?.username || !credentials?.password) return null;

//         try {
//           const res = await fetch(`${process.env.WP_URL}/wp-json/jwt-auth/v1/token`, {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({
//               username: credentials.username,
//               password: credentials.password,
//             }),
//           });

//           const data = await res.json();

//           if (!res.ok || !data?.token) {
//             throw new Error(data?.message || "Invalid login");
//           }

//           return {
//             id: data.user_id?.toString() || "0",
//             name: data.user_display_name || credentials.username,
//             email: data.user_email,
//             token: data.token, // ✅ WP JWT Token
//             role: "student",
//           } as any;
//         } catch (err) {
//           console.error("WordPress login error:", err);
//           return null;
//         }
//       },
//     }),
//   ],

//   session: { strategy: "jwt" },

//   pages: {
//     signIn: "/auth/user/login", // custom login page
//   },

//   callbacks: {
//     async jwt({ token, user }) {
//       if (user) {
//         token.role = (user as any).role ?? "user";
//         token.wpToken = (user as any).token ?? null; // ✅ WP Token রাখলাম
//       }
//       return token;
//     },
//     async session({ session, token }) {
//       (session as any).role = token.role ?? "user";
//       (session as any).wpToken = token.wpToken ?? null; // ✅ client side এ পাঠাচ্ছি
//       return session;
//     },
//   },
// };
















// import type { NextAuthOptions } from "next-auth";
// import GoogleProvider from "next-auth/providers/google";
// import FacebookProvider from "next-auth/providers/facebook";
// import AppleProvider from "next-auth/providers/apple";
// import CredentialsProvider from "next-auth/providers/credentials";

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
//     AppleProvider({
//       clientId: process.env.APPLE_CLIENT_ID!,
//       clientSecret: {
//         teamId: process.env.APPLE_TEAM_ID!,
//         privateKey: process.env.APPLE_PRIVATE_KEY!,
//         keyId: process.env.APPLE_KEY_ID!,
//       },
//     }),
//     CredentialsProvider({
//       name: "Credentials",
//       credentials: {
//         username: { label: "Username", type: "text" },
//         password: { label: "Password", type: "password" },
//       },
//       async authorize(credentials) {
//         if (!credentials?.username || !credentials?.password) return null;
//         // TODO: Replace with your real user lookup (DB/API)
//         // Example only:
//         if (
//           credentials.username === "student@example.com" &&
//           credentials.password === "Passw0rd!"
//         ) {
//           return {
//             id: "1",
//             name: "Demo Student",
//             email: "student@example.com",
//             role: "student",
//           } as any;
//         }
//         return null;
//       },
//     }),
//   ],
//   session: { strategy: "jwt" },
//   pages: {
//     // Let NextAuth use default pages OR add custom if you want
//   },
//   callbacks: {
//     async jwt({ token, user }) {
//       if (user) {
//         // attach anything you need from user to the token
//         (token as any).role = (user as any).role ?? (token as any).role ?? "user";
//       }
//       return token;
//     },
//     async session({ session, token }) {
//       // expose token fields on session
//       (session as any).role = (token as any).role ?? "user";
//       return session;
//     },
//   },
// };