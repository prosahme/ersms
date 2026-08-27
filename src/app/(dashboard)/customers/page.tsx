import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { DeleteCustomerButton } from "./delete-button";
import { getLanguage } from "@/lib/language";
import { t } from "@/lib/translations";

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const lang = await getLanguage();
  const { search } = await searchParams;

  const where: any = { deletedAt: null };
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { phone: { contains: search } },
    ];
  }
  const customers = await prisma.customer.findMany({ where });

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-1">
        <h1 className="text-2xl font-semibold">{t("customers", lang)}</h1>
        <Link href="/customers/new" className="rounded-md bg-orange-600 text-white px-4 py-2 text-sm font-medium hover:bg-orange-700 text-center">
          {t("addCustomer", lang)}
        </Link>
      </div>
      <p className="text-sm text-orange-500 mb-6">{t("manageCustomers", lang)}</p>

      <form className="mb-4">
        <input type="text" name="search" defaultValue={search} placeholder={t("searchByNameOrPhone", lang)} className="w-full max-w-sm rounded-md border border-orange-300 px-3 py-2 text-sm" />
      </form>

      <div className="space-y-3 md:hidden">
        {customers.map((customer) => (
          <div key={customer.id} className="bg-white border border-orange-200 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 text-xs font-semibold flex-shrink-0">
                {customer.name.charAt(0)}
              </div>
              <span className="font-medium">{customer.name}</span>
            </div>
            <p className="text-sm text-slate-600">{customer.phone}</p>
            <p className="text-sm text-slate-600 mb-3">{customer.email ?? "—"}</p>
            <div className="flex flex-wrap gap-3 pt-2 border-t border-orange-100">
              <Link href={`/customers/${customer.id}`} className="text-orange-600 hover:underline text-sm">{t("viewProfile", lang)}</Link>
              <Link href={`/customers/${customer.id}/edit`} className="text-slate-600 hover:underline text-sm">{t("edit", lang)}</Link>
              <DeleteCustomerButton id={customer.id} />
            </div>
          </div>
        ))}
        {customers.length === 0 && <p className="text-center text-orange-500 py-8">{t("noResultsYet", lang)}</p>}
      </div>

      <div className="hidden md:block bg-white border border-orange-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-orange-50 border-b border-orange-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-orange-500">{t("customerName", lang)}</th>
              <th className="text-left px-4 py-3 font-medium text-orange-500">{t("phone", lang)}</th>
              <th className="text-left px-4 py-3 font-medium text-orange-500">{t("email", lang)}</th>
              <th className="text-left px-4 py-3 font-medium text-orange-500">{t("actions", lang)}</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => (
              <tr key={customer.id} className="border-b border-slate-100 last:border-0">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 text-xs font-semibold">
                      {customer.name.charAt(0)}
                    </div>
                    <span>{customer.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-600">{customer.phone}</td>
                <td className="px-4 py-3 text-slate-600">{customer.email ?? "—"}</td>
                <td className="px-4 py-3 space-x-3">
                  <Link href={`/customers/${customer.id}`} className="text-orange-600 hover:underline text-sm">{t("viewProfile", lang)}</Link>
                  <Link href={`/customers/${customer.id}/edit`} className="text-slate-600 hover:underline text-sm">{t("edit", lang)}</Link>
                  <DeleteCustomerButton id={customer.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {customers.length === 0 && <p className="text-center text-orange-500 py-8">{t("noResultsYet", lang)}</p>}
      </div>
    </div>
  );
}