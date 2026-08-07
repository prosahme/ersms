import { auth } from "@/auth";
import { NextResponse } from "next/server";

const protectedPaths = [
  "/dashboard",
  "/customers",
  "/repairs",
  "/inventory",
  "/payments",
  "/reports",
  "/notifications",
  "/settings",
  "/change-password",
];

export const proxy = auth((req) => {
  const isLoggedIn = !!req.auth;
  const firstLogin = (req.auth?.user as any)?.firstLogin;
  const { pathname } = req.nextUrl;
  const isProtected = protectedPaths.some((path) => pathname.startsWith(path));

  if (isProtected && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (isLoggedIn && firstLogin && pathname !== "/change-password") {
    return NextResponse.redirect(new URL("/change-password", req.url));
  }

  if (isLoggedIn && !firstLogin && pathname === "/change-password") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/customers/:path*",
    "/repairs/:path*",
    "/inventory/:path*",
    "/payments/:path*",
    "/reports/:path*",
    "/notifications/:path*",
    "/settings/:path*",
    "/change-password",
  ],
};