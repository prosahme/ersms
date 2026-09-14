import Image from "next/image";
import Link from "next/link";

// Day 6: administrator-assisted password reset. No email input on this
// page at all — deliberately, since asking for an email and then always
// showing the same message is still worth doing right, and the simplest,
// safest option is to not collect anything here. There is nothing for
// this page to look up, so there is nothing that could leak whether a
// given account exists. The actual reset is performed by an
// Administrator from Settings -> User Management (existing
// Administrator-only resetPasswordAction), unchanged by this page.
export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-orange-50 px-4 py-8">
      <div className="w-full max-w-sm rounded-lg border border-orange-200 bg-orange-50 p-6 sm:p-8 shadow-sm border-t-4 border-t-orange-500">
        <div className="flex justify-center mb-4">
          <Image src="/logo-full.png" alt="Family Electronics Maintenance" width={60} height={60} className="rounded-lg" />
        </div>
        <h1 className="text-xl sm:text-2xl font-semibold text-center mb-1">Forgot Your Password?</h1>
        <p className="text-sm text-slate-600 text-center mb-6">
          For security, password resets are handled by your shop Administrator — this system doesn't send reset
          emails.
        </p>

        <div className="rounded-md border border-orange-200 bg-white p-4 text-sm text-slate-700 space-y-3 mb-6">
          <p>Please contact your Administrator directly (in person, by phone, or your usual work channel) and ask them to reset your password.</p>
          <p>They can do this from <span className="font-medium">Settings → User Management</span>. You'll be given a temporary password and asked to set a new one the next time you log in.</p>
        </div>

        <Link
          href="/login"
          className="block text-center rounded-md bg-orange-600 text-white px-4 py-2 text-sm font-medium hover:bg-orange-700"
        >
          Back to Login
        </Link>
      </div>
    </div>
  );
}
