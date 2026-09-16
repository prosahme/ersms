import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, canSeeFinancials, UnauthorizedError } from "@/lib/auth-guard";

// Day 7a: supplies the minimum dataset needed for offline VIEWING and
// SEARCHING of Customers, Repairs and Inventory.
//
// Everything sensitive is filtered SERVER-SIDE, before it is ever sent to
// the browser — the client cache can only ever contain what this route
// chose to return for that specific user's role:
//
//   - PRIVATE repairs are excluded entirely for non-Administrators, using
//     the same rule as the online repairs list. A Technician's device
//     never receives private-repair data at all, so there is nothing in
//     local storage for them to inspect.
//   - Repair cost/deposit fields are only included for financial roles
//     (Administrator/Manager/Cashier), matching the Day 3 rule. A
//     Technician's cache contains no monetary values.
//   - Payments, expenses and reports are deliberately NOT cached. Those
//     remain online-only.
//   - Inventory mirrors what the online inventory page already shows to
//     every authenticated user (name, category, stock, selling price).
//     unitCost is excluded — it isn't shown online either.
export async function GET() {
  let user;
  try {
    user = await requireAuth();
  } catch (e) {
    if (e instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Not signed in." }, { status: 401 });
    }
    throw e;
  }

  const isAdmin = user.role === "ADMINISTRATOR";
  const isFinancial = canSeeFinancials(user.role);

  const [customers, repairs, inventory] = await Promise.all([
    prisma.customer.findMany({
      where: { deletedAt: null },
      select: { id: true, name: true, phone: true, email: true },
      orderBy: { name: "asc" },
    }),
    prisma.repairTicket.findMany({
      where: {
        deletedAt: null,
        // Same server-side private-repair rule as the online list.
        ...(isAdmin ? {} : { visibility: "NORMAL" }),
      },
      select: {
        id: true,
        ticketNumber: true,
        deviceType: true,
        deviceBrand: true,
        deviceModel: true,
        reportedProblem: true,
        status: true,
        dateReceived: true,
        customer: { select: { id: true, name: true, phone: true } },
        // Monetary fields only for roles allowed to see them.
        ...(isFinancial ? { estimatedCost: true, depositAmount: true } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: 500,
    }),
    prisma.sparePart.findMany({
      where: { deletedAt: null },
      select: {
        id: true,
        name: true,
        sku: true,
        category: true,
        quantityAvailable: true,
        lowStockThreshold: true,
        unitPrice: true,
      },
      orderBy: { name: "asc" },
    }),
  ]);

  return NextResponse.json({
    snapshotAt: new Date().toISOString(),
    role: user.role,
    includesFinancials: isFinancial,
    customers,
    repairs,
    inventory,
  });
}
