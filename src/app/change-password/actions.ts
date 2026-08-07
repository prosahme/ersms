"use server";

import { auth, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

export type ChangePasswordState = { error?: string };

export async function changePasswordAction(
  _prevState: ChangePasswordState,
  formData: FormData
): Promise<ChangePasswordState> {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");

  const currentPassword = formData.get("currentPassword") as string;
  const newPassword = formData.get("newPassword") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!currentPassword || !newPassword || !confirmPassword) {
    return { error: "All fields are required." };
  }
  if (newPassword.length < 8) {
    return { error: "New password must be at least 8 characters." };
  }
  if (newPassword !== confirmPassword) {
    return { error: "Passwords do not match." };
  }

  const user = await prisma.user.findUnique({ where: { email: session!.user!.email! } });
  if (!user) return { error: "User not found." };

  const currentMatches = await bcrypt.compare(currentPassword, user.password);
  if (!currentMatches) return { error: "Current password is incorrect." };

  const sameAsOld = await bcrypt.compare(newPassword, user.password);
  if (sameAsOld) return { error: "New password cannot be the same as the current password." };

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedPassword, firstLogin: false, updatedBy: user.id },
  });

  await signOut({ redirect: false });
  redirect("/login?passwordChanged=true");
}