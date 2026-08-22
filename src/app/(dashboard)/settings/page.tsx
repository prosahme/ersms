import { prisma } from "@/lib/prisma";
import { toggleUserActiveAction, resetPasswordAction, updateBusinessInfoAction } from "./actions";
import { NewUserForm } from "./new-user-form";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  const activeTab = tab ?? "users";

  const [users, businessInfo] = await Promise.all([
    prisma.user.findMany({ orderBy: { fullName: "asc" } }),
    prisma.businessInfo.findFirst(),
  ]);

  const tabs = [
    { key: "users", label: "User Management" },
    { key: "business", label: "Business Information" },
    { key: "language", label: "Language" },
  ];

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold mb-6">Settings</h1>

      <div className="flex gap-2 mb-6 border-b border-orange-200">
        {tabs.map((t) => (
          
           <a key={t.key}
            href={`/settings?tab=${t.key}`}
            className={`px-3 py-2 text-sm font-medium border-b-2 -mb-px ${
              activeTab === t.key ? "border-orange-600 text-orange-600" : "border-transparent text-slate-500"
            }`}
          >
            {t.label}
          </a>
        ))}
      </div>

      {activeTab === "users" && (
        <div className="space-y-6">
          <div className="bg-white border border-orange-200 rounded-lg p-4">
            <h2 className="font-semibold mb-3">Add User</h2>
            <NewUserForm />
          </div>

          <div className="bg-white border border-orange-200 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-orange-50 border-b border-orange-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-slate-500">Name</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-500">Email</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-500">Role</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-500">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-orange-50 last:border-0">
                    <td className="px-4 py-3">{u.fullName}</td>
                    <td className="px-4 py-3 text-slate-600">{u.email}</td>
                    <td className="px-4 py-3 capitalize">{u.role.toLowerCase()}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${u.isActive ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>
                        {u.isActive ? "Active" : "Disabled"}
                      </span>
                    </td>
                    <td className="px-4 py-3 space-x-3">
                      <form action={toggleUserActiveAction} className="inline">
                        <input type="hidden" name="id" value={u.id} />
                        <input type="hidden" name="isActive" value={String(u.isActive)} />
                        <button type="submit" className="text-orange-600 hover:underline text-sm">
                          {u.isActive ? "Disable" : "Enable"}
                        </button>
                      </form>
                      <form action={resetPasswordAction} className="inline">
                        <input type="hidden" name="id" value={u.id} />
                        <button type="submit" className="text-slate-600 hover:underline text-sm">Reset Password</button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "business" && (
        <div className="bg-white border border-orange-200 rounded-lg p-4 max-w-md">
          <h2 className="font-semibold mb-3">Business Information</h2>
          <form action={updateBusinessInfoAction} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Business Name</label>
              <input name="name" type="text" required defaultValue={businessInfo?.name ?? ""} className="w-full rounded-md border border-orange-300 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Address</label>
              <input name="address" type="text" defaultValue={businessInfo?.address ?? ""} className="w-full rounded-md border border-orange-300 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <input name="phone" type="text" defaultValue={businessInfo?.phone ?? ""} className="w-full rounded-md border border-orange-300 px-3 py-2 text-sm" />
            </div>
            <button type="submit" className="rounded-md bg-orange-600 text-white px-4 py-2 text-sm font-medium hover:bg-orange-700">
              Save
            </button>
          </form>
        </div>
      )}

      {activeTab === "language" && (
        <div className="bg-white border border-orange-200 rounded-lg p-4 max-w-md">
          <h2 className="font-semibold mb-3">Language</h2>
          <p className="text-sm text-slate-500">
            English / Amharic switching is coming in a follow-up update.
          </p>
        </div>
      )}
    </div>
  );
}