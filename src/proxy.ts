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
  "//account",
];

// Administrator-only: user management, backup/restore, shop-wide reminders.
const adminOnlyPaths = ["/settings", "/reminders"];

// Financial roles only (Owner/Administrator, Manager, Cashier): anything
// that shows payment amounts, revenue, or profit. Technicians and any
// other non-financial role are redirected away from these pages.
const financialOnlyPaths = ["/payments", "/reports"];
const FINANCIAL_ROLES = ["ADMINISTRATOR", "MANAGER", "CASHIER"];

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

  const isAdminOnly = adminOnlyPaths.some((path) => pathname.startsWith(path));
  if (isAdminOnly && role !== "ADMINISTRATOR") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  const isFinancialOnly = financialOnlyPaths.some((path) => pathname.startsWith(path));
  if (isFinancialOnly && !FINANCIAL_ROLES.includes(role)) {
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
    "/account/:path*",
  ],
};