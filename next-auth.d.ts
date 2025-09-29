import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    wpToken?: string;
    wpUserdata?: {
      role?: "author" | "student";
    };
  }
}
