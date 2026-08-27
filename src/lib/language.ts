import { cookies } from "next/headers";
import type { Lang } from "./translations";

export async function getLanguage(): Promise<Lang> {
  const cookieStore = await cookies();
  const value = cookieStore.get("lang")?.value;
  return value === "am" ? "am" : "en";
}