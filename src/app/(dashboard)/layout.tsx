import { Sidebar } from '@/components/shared/sidebar';
import { Navbar } from "@/components/shared/navbar";
export default function DashboardLayout({ children} : { children: React.ReactNode}){
    return(
        <div className="flex">
            <Sidebar />
            <div className="flex-1 flex flex-col min-h-screen">
                <Navbar />
                <main className="flex-1 bg-slate-50">{children} </main>
            </div>
        </div>
    )
}
