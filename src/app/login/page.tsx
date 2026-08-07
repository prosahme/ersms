import Image from "next/image";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex justify-center mb-4">
          <Image src="/ersms logo1.jpg" alt="ERSMS" width={56} height={56} />
        </div>
        <h1 className="text-2xl font-semibold text-center mb-1">Welcome back</h1>
        <p className="text-sm text-slate-500 text-center mb-6">
          Sign in to manage repairs, customers, and inventory
        </p>
        <LoginForm />
        <p className="text-center text-xs text-slate-400 mt-6">
          © 2026 Electronics Repair Shop Management System. Internal use only.
        </p>
      </div>
    </div>
  );
}