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
  "/reminders",
  "/change-password",
];

const adminOnlyPaths = ["/settings", "/reports", "/reminders"];

export const proxy = auth((req) => {
  const isLoggedIn = !!req.auth;
  const role = (req.auth?.user as any)?.role;
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

  const isAdminOnly = adminOnlyPaths.some((path) => pathname.startsWith(path));
  if (isAdminOnly && role === "TECHNICIAN") {
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
    "/reminders/:path*",
    "/change-password",
  ],
};