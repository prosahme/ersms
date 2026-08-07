import {auth } from "@/auth";
import {Search , Bell, Globe} from "lucide-react";
export async function Navbar(){
    const session = await auth();
    const user = session?.user;
    return(
        <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-6 sticky top-0 z-10">
            <div className="flex items-center gap-2 w-full max-w-md">
                <Search size={18} className="text-slate-400" />
                <input
                    type="text"
                    placeholder="Search"
                    className="w-full text-sm outline-none placeholder:text-slate-400"
                    />
            </div>
            <div className="flex items-center gap-4">
  <button className="text-slate-400 hover:text-slate-600" aria-label="Language">
    <Globe size={20} />
  </button>

  <button className="relative text-slate-400 hover:text-slate-600" aria-label="Notifications">
    <Bell size={20} />
    <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-red-500" />
  </button>

  <div className="flex items-center gap-2">
  <div className="text-right">
    <p className="text-sm font-medium text-slate-900">{user?.name}</p>
    <p className="text-xs text-slate-500 capitalize">
      {user?.role?.toLowerCase()}
    </p>
  </div>
  <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-sm font-semibold">
    {user?.name?.charAt(0) ?? "U"}
  </div>
</div>
</div>
        </header>
    )
}