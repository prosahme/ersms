import Image from "next/image";
import { LoginForm } from "./login-form";
import { getLanguage } from "@/lib/language";
import { t } from "@/lib/translations";

export default async function LoginPage() {
  const lang = await getLanguage();

  return (
    <div className="min-h-screen flex items-center justify-center bg-orange-50 px-4 py-8">
      <div className="w-full max-w-sm rounded-lg border border-orange-200 bg-orange-50 p-6 sm:p-8 shadow-sm border-t-4 border-t-orange-500">
        <div className="flex justify-center mb-4">
          <Image src="/logo-full.png" alt="Family Electronics Maintenance" width={60} height={60} className="rounded-lg" />
        </div>
        <h1 className="text-xl sm:text-2xl font-semibold text-center mb-1">{t("welcomeBack", lang)}</h1>
        <p className="text-xs sm:text-sm text-orange-500 text-center mb-6">{t("signInSubtitle", lang)}</p>
        <LoginForm lang={lang} />
        <p className="text-center text-xs text-slate-400 mt-6">
          © 2026 Electronics Repair Shop Management System. Internal use only.
        </p>
      </div>
    </div>
  );
}