import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { DeletePartButton } from "./delete-button";
import { formatCurrency } from "@/lib/format-currency";
import { getLanguage } from "@/lib/language";
import { t } from "@/lib/translations";

export default async function InventoryPage() {
  const lang = await getLanguage();
  const parts = await prisma.sparePart.findMany({ where: { deletedAt: null }, orderBy: { name: "asc" } });

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <h1 className="text-2xl font-semibold">{t("inventory", lang)}</h1>
        <Link href="/inventory/new" className="rounded-md bg-orange-600 text-white px-4 py-2 text-sm font-medium hover:bg-orange-700 text-center">
          {t("addSparePart", lang)}
        </Link>
      </div>

      <div className="space-y-3">
        {parts.map((part) => {
          const isLowStock = part.quantityAvailable <= part.lowStockThreshold;
          return (
            <div key={part.id} className={`bg-white border border-slate-200 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 ${isLowStock ? "border-l-4 border-l-red-500" : ""}`}>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium">{part.name}</p>
                  {isLowStock && <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">{t("lowStock", lang)}</span>}
                </div>
                <div className="flex items-center gap-3 text-sm text-orange-500">
                  <span className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 text-xs">{part.category}</span>
                  <span>{part.quantityAvailable} units</span>
                  <span className="text-orange-600 font-medium">{formatCurrency(part.unitPrice)}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Link href={`/inventory/${part.id}/edit`} className="text-slate-600 hover:underline text-sm">{t("edit", lang)}</Link>
                <DeletePartButton id={part.id} />
              </div>
            </div>
          );
        })}
      </div>
      {parts.length === 0 && <p className="text-center text-orange-500 py-8">{t("noResultsYet", lang)}</p>}
    </div>
  );
}