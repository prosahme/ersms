import { auth } from "@/auth";
import Link from "next/link";

export default async function AccountPage() {
  const session = await auth();
  const user = session?.user as any;

  return (
    <div className="p-4 md:p-8 max-w-md">
      <h1 className="text-2xl font-semibold mb-6">My Account</h1>
      <div className="bg-white border border-orange-200 rounded-lg p-4">
        <p className="text-sm text-slate-500">Name</p>
        <p className="font-medium mb-3">{user?.name}</p>
        <p className="text-sm text-slate-500">Email</p>
        <p className="font-medium mb-3">{user?.email}</p>
        <p className="text-sm text-slate-500">Role</p>
        <p className="font-medium capitalize mb-4">{user?.role?.toLowerCase()}</p>
        <Link
          href="/change-password"
          className="inline-block rounded-md bg-orange-600 text-white px-4 py-2 text-sm font-medium hover:bg-orange-700"
        >
          Change Password
        </Link>
      </div>
    </div>
  );
}