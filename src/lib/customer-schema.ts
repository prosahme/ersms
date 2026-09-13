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
export const customerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().min(1, "Phone is required"),
  email: z.string().email("Invalid email format").optional().or(z.literal("")),
  address: z.string().optional(),
});
