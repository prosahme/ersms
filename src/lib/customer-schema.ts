import { z } from "zod";

// Shared customer validation — used by both the standalone "New Customer"
// action and the combined "New Customer + Repair" / "New Repair" actions,
// so a customer created from any workflow is held to the same rules.
//
// This lives in a plain module (no "use server") specifically because a
// "use server" file may only export async functions — exporting this
// schema object directly from an actions.ts file breaks the server-action
// boundary at runtime ("A 'use server' file can only export async
// functions, found object").
//
// Client request: either name OR phone must be provided (not both
// required) — sometimes staff only remember one of the two. Each field
// is individually optional; the superRefine below enforces that at
// least one of them is actually filled in.
export const customerSchema = z
  .object({
    name: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email("Invalid email format").optional().or(z.literal("")),
    address: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    const hasName = Boolean(data.name && data.name.trim() !== "");
    const hasPhone = Boolean(data.phone && data.phone.trim() !== "");

    if (!hasName && !hasPhone) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please provide at least the customer's name or phone number.",
        path: ["name"],
      });
    }
  });