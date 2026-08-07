"use server";
import { signOut }from "next-auth/react";
export async function LogoutAction() {
    await signOut({ redirectTo: "/Login"});
}