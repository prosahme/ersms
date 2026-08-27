"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export async function setLanguageAction(formData: FormData) {
  const lang = formData.get("lang") as string;
  const cookieStore = await cookies();
  cookieStore.set("lang", lang, { maxAge: 60 * 60 * 24 * 365 });
  revalidatePath("/", "layout");
}