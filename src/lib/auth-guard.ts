import { auth } from "@/auth";

export type AppRole = "ADMINISTRATOR" | "MANAGER" | "CASHIER" | "TECHNICIAN";

/** Roles allowed to see/record payments, expenses, and financial reports. */
export const FINANCIAL_ROLES: AppRole[] = ["ADMINISTRATOR", "MANAGER", "CASHIER"];

/** Roles allowed into Settings (user management, backup/restore, business info). */
export const ADMIN_ROLES: AppRole[] = ["ADMINISTRATOR"];

export class UnauthorizedError extends Error {
  constructor(message = "You are not signed in.") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends Error {
  constructor(message = "You do not have permission to do this.") {
    super(message);
    this.name = "ForbiddenError";
  }
}

export type SessionUser = {
  id: string;
  role: AppRole;
  email: string;
  name: string;
};

/**
 * Returns the current session's user, or throws UnauthorizedError.
 * Every server action that touches data should start with this
 * (or one of the helpers below) — never trust the client.
 */
export async function requireAuth(): Promise<SessionUser> {
  const session = await auth();
  const user = session?.user as
    | { id?: string; role?: AppRole; email?: string; name?: string }
    | undefined;

  if (!session || !user?.id || !user?.role) {
    throw new UnauthorizedError();
  }

  return {
    id: user.id,
    role: user.role,
    email: user.email ?? "",
    name: user.name ?? "",
  };
}

/**
 * Requires a signed-in user whose role is allowed to see financial data
 * (payments, deposits, balances, expenses, revenue/profit reports).
 */
export async function requireFinancialAccess(): Promise<SessionUser> {
  const user = await requireAuth();
  if (!FINANCIAL_ROLES.includes(user.role)) {
    throw new ForbiddenError("Only Owner/Administrator, Manager, or Cashier can access financial information.");
  }
  return user;
}

/**
 * Requires a signed-in Administrator (user management, backup/restore,
 * business settings). Manager/Cashier do NOT get admin access by default.
 */
export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireAuth();
  if (!ADMIN_ROLES.includes(user.role)) {
    throw new ForbiddenError("Only the Owner/Administrator can do this.");
  }
  return user;
}

/** True if the given role can see financial information. Useful in page/UI code too. */
export function canSeeFinancials(role: AppRole | undefined | null): boolean {
  return !!role && FINANCIAL_ROLES.includes(role);
}
