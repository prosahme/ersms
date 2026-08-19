import { ChangePasswordForm } from "./change-password-form";

export default function ChangePasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-orange-50 px-4">
      <div className="w-full max-w-sm rounded-lg border border-orange-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-center mb-1">Set a new password</h1>
        <p className="text-sm text-orange-500 text-center mb-6">
          This is your first login — please set a permanent password to continue.
        </p>
        <ChangePasswordForm />
      </div>
    </div>
  );
}
