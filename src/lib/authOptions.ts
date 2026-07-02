import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import type { JWT } from "next-auth/jwt";

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "name@example.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Dummy authentication validation
        if (
          credentials.email === "admin@ticktock.com" &&
          credentials.password === "Password123!"
        ) {
          return {
            id: "user-1",
            name: "Jane Doe",
            email: "admin@ticktock.com",
            image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120"
          };
        }

        return null;
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
    error: "/login"
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        (token as JWT & { id?: string }).id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user = {
          ...session.user,
          id: (token as JWT & { id?: string }).id
        };
      }
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET || "ticktock-secret-at-least-32-chars-long-for-jwt",
};
