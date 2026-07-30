import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

console.log("NEXTAUTH_SECRET is:", process.env.NEXTAUTH_SECRET ? "SET" : "UNDEFINED");

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "admin@example.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing email or password");
        }
        
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { role: true, branch: true }
        });

        if (!user || !user.password) {
          throw new Error("Invalid credentials");
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

        if (!isPasswordValid) {
          throw new Error("Invalid credentials");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role.name,
          permissions: user.role.permissions,
          branchId: user.branchId,
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.permissions = (user as any).permissions;
        token.branchId = (user as any).branchId;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.permissions = token.permissions as any;
        session.user.branchId = token.branchId as string | null;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET || "my-super-secret-jwt-key-2024",
  debug: true,
  logger: {
    error(code, metadata) {
      console.error("NEXTAUTH ERROR:", code, metadata);
    },
    warn(code) {
      console.warn("NEXTAUTH WARN:", code);
    },
    debug(code, metadata) {
      console.log("NEXTAUTH DEBUG:", code, metadata);
    }
  }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
