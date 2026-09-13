// Overdue / forgotten-device detection.
//
// Default thresholds (no documented threshold existed in the app before
// this, so these are the defaults chosen for Day 4 — flagged to the client
// for confirmation, and easy to change in one place if a different number
// is wanted, or to make configurable later):
//   - 30+ days since intake, still unresolved -> OVERDUE
//   - 14+ days since intake, still unresolved -> NEEDS_ATTENTION
//   - under 14 days                            -> normal (no flag)
//
// Which statuses count as "still unresolved" (trackable): RECEIVED,
// DIAGNOSING, WAITING_FOR_PARTS, REPAIRING. COMPLETED and DELIVERED are
// both excluded, per the spec's literal wording ("completed/picked
// up/closed should not appear as overdue"). NOTE: this means a repair
// that's finished but never picked up by the customer — arguably the
// most literal "forgotten device" case — is NOT flagged by this logic.
// If that case should actually be tracked (as a separate "ready but
// uncollected" category, say), this is the one line to revisit.
export const OVERDUE_THRESHOLD_DAYS = 30;
export const NEEDS_ATTENTION_THRESHOLD_DAYS = 14;

export const TRACKABLE_STATUSES = [
  "RECEIVED",
  "DIAGNOSING",
  "WAITING_FOR_PARTS",
  "REPAIRING",
] as const;

export type OverdueCategory = "OVERDUE" | "NEEDS_ATTENTION" | "RECENTLY_RECEIVED" | "NONE";

export function daysSince(date: Date, now: Date = new Date()): number {
  const ms = now.getTime() - date.getTime();
  return Math.max(0, Math.floor(ms / (1000 * 60 * 60 * 24)));
}

/**
 * Categorizes a repair ticket's overdue status based on its current
 * status and how long it's been since intake. Returns "NONE" for
 * tickets that aren't trackable (e.g. already DELIVERED).
 */
export function getOverdueCategory(
  status: string,
  dateReceived: Date,
  now: Date = new Date()
): OverdueCategory {
  if (!TRACKABLE_STATUSES.includes(status as (typeof TRACKABLE_STATUSES)[number])) {
    return "NONE";
  }

  const days = daysSince(dateReceived, now);

  if (days >= OVERDUE_THRESHOLD_DAYS) return "OVERDUE";
  if (days >= NEEDS_ATTENTION_THRESHOLD_DAYS) return "NEEDS_ATTENTION";
  return "RECENTLY_RECEIVED";
}

/** The cutoff date a ticket must have dateReceived <= to count as OVERDUE right now. */
export function overdueCutoffDate(now: Date = new Date()): Date {
  const d = new Date(now);
  d.setDate(d.getDate() - OVERDUE_THRESHOLD_DAYS);
  return d;
}

export const overdueCategoryLabels: Record<OverdueCategory, string> = {
  OVERDUE: "Overdue",
  NEEDS_ATTENTION: "Needs Attention",
  RECENTLY_RECEIVED: "Recently Received",
  NONE: "",
};

export const overdueCategoryStyles: Record<OverdueCategory, string> = {
  OVERDUE: "bg-red-100 text-red-700",
  NEEDS_ATTENTION: "bg-amber-100 text-amber-700",
  RECENTLY_RECEIVED: "bg-slate-100 text-slate-500",
  NONE: "",
};
