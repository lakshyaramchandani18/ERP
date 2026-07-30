import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // If the user is logged in but trying to access login, redirect to dashboard
    if (req.nextUrl.pathname === "/login") {
      if (req.nextauth.token) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
      return NextResponse.next();
    }

    // Basic RBAC checking can go here based on req.nextauth.token.role
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname;
        if (path === "/login" || path.startsWith("/api/auth")) {
          return true; // Allow everyone to access login and auth endpoints
        }
        return !!token; // Require token for all other routes matched by the matcher
      },
    },
    secret: process.env.NEXTAUTH_SECRET || "my-super-secret-jwt-key-2024",
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  matcher: ["/dashboard/:path*", "/login"],
};
