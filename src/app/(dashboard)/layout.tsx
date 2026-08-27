import { Sidebar } from "@/components/shared/sidebar";
import { Navbar } from "@/components/shared/navbar";
import { SidebarProvider } from "@/components/shared/sidebar-context";
import { auth } from "@/auth";
import { getLanguage } from "@/lib/language";

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
          <main className="flex-1 bg-orange-50">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
