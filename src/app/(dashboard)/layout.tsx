import { Sidebar } from "@/components/shared/sidebar";
import { Navbar } from "@/components/shared/navbar";
import { SidebarProvider } from "@/components/shared/sidebar-context";
import { auth } from "@/auth";
import { getLanguage } from "@/lib/language";
import { ConnectionStatus } from "@/components/shared/connection-status";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const role = (session?.user as any)?.role;
  const lang = await getLanguage();

  return (
    <SidebarProvider>
      <div className="flex">
        <Sidebar role={role} lang={lang} />

        <div className="flex-1 flex flex-col min-h-screen">
          <Navbar lang={lang} />
          <main className="flex-1 bg-[#0A0A0A]">{children}</main>
        </div>
      </div>
      <ConnectionStatus />
    </SidebarProvider>
  );
}