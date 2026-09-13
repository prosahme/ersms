import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { getLanguage } from "@/lib/language";
import { t } from "@/lib/translations";
import { CustomersList } from "./customers-list";

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const lang = await getLanguage();
  const { search } = await searchParams;

  const customers = await prisma.customer.findMany({
    where: { deletedAt: null },
    select: { id: true, name: true, phone: true, email: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-1">
        <h1 className="text-2xl font-semibold">{t("customers", lang)}</h1>
        <Link href="/customers/new" className="rounded-md bg-orange-600 text-white px-4 py-2 text-sm font-medium hover:bg-orange-700 text-center">
          {t("addCustomer", lang)}
        </Link>
      </div>
      <p className="text-sm text-orange-500 mb-6">{t("manageCustomers", lang)}</p>

      <CustomersList customers={customers} lang={lang} initialQuery={search ?? ""} />
    </div>
  );
}